/**
 * Community Service for Fahamu Shamba
 * Provides farmer-to-farmer Q&A, discussion boards, and success stories
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

function getDb() {
  if (!db) {
    db = new Database('./fahamu_shamba.db');
  }
  return db;
}

// Initialize community tables
export function initializeCommunityDatabase(dbConnection) {
  const database = dbConnection || getDb();
  
  // Questions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS community_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_phone TEXT NOT NULL,
      author_name TEXT,
      sub_county TEXT,
      category TEXT DEFAULT 'general',
      status TEXT DEFAULT 'open',
      upvotes INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Answers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS community_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author_phone TEXT NOT NULL,
      author_name TEXT,
      is_verified BOOLEAN DEFAULT 0,
      upvotes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES community_questions(id)
    )
  `);

  // Success stories table
  database.exec(`
    CREATE TABLE IF NOT EXISTS success_stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_phone TEXT NOT NULL,
      author_name TEXT,
      sub_county TEXT,
      crop_grown TEXT,
      yield_achieved TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'pending',
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME
    )
  `);

  // Discussion topics
  database.exec(`
    CREATE TABLE IF NOT EXISTS discussion_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      created_by TEXT NOT NULL,
      posts_count INTEGER DEFAULT 0,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_pinned BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Discussion posts
  database.exec(`
    CREATE TABLE IF NOT EXISTS discussion_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author_phone TEXT NOT NULL,
      author_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES discussion_topics(id)
    )
  `);

  // Indexes
  database.exec(`CREATE INDEX IF NOT EXISTS idx_questions_phone ON community_questions(author_phone)`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_answers_question ON community_answers(question_id)`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_stories_status ON success_stories(status)`);

  // Service marketplace tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_phone TEXT NOT NULL,
      farmer_name TEXT,
      sub_county TEXT,
      location TEXT,
      field_size TEXT,
      crop TEXT,
      service_type TEXT,
      description TEXT,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS service_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      provider_phone TEXT NOT NULL,
      provider_name TEXT,
      contact_info TEXT,
      availability TEXT,
      offer_price TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES service_requests(id)
    )
  `);

  database.exec(`CREATE INDEX IF NOT EXISTS idx_service_requests_farmer ON service_requests(farmer_phone)`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_service_apps_request ON service_applications(request_id)`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_service_apps_provider ON service_applications(provider_phone)`);

  console.log('✅ Community database tables initialized');
}

// ==================== SERVICE MARKETPLACE ====================

export function postServiceRequest(data) {
  const { farmerPhone, farmerName, subCounty, location, fieldSize, crop, serviceType, description } = data;
  if (!farmerPhone || !location || !serviceType || !description) {
    return { success: false, error: 'farmerPhone, location, serviceType and description are required' };
  }

  const stmt = getDb().prepare(`
    INSERT INTO service_requests (farmer_phone, farmer_name, sub_county, location, field_size, crop, service_type, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(farmerPhone, farmerName || 'Unknown', subCounty || '', location, fieldSize || '', crop || '', serviceType, description);

  return { success: true, requestId: result.lastInsertRowid, message: 'Service request posted successfully' };
}

export function getServiceRequests(options = {}) {
  const { page = 1, limit = 20, subCounty, status } = options;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM service_requests WHERE 1=1';
  const params = [];

  if (subCounty) {
    query += ' AND sub_county = ?';
    params.push(subCounty);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const requests = getDb().prepare(query).all(...params);
  const total = getDb().prepare(`SELECT COUNT(*) as total FROM service_requests WHERE 1=1${subCounty ? ' AND sub_county = ?' : ''}${status ? ' AND status = ?' : ''}`).get(...(subCounty ? (status ? [subCounty, status] : [subCounty]) : (status ? [status] : []))).total || 0;

  return {
    success: true,
    data: requests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

export function applyToServiceRequest(data) {
  const { requestId, providerPhone, providerName, contactInfo, availability, offerPrice, message } = data;
  if (!requestId || !providerPhone || !contactInfo || !offerPrice) {
    return { success: false, error: 'requestId, providerPhone, contactInfo and offerPrice are required' };
  }

  const request = getDb().prepare('SELECT * FROM service_requests WHERE id = ?').get(requestId);
  if (!request) {
    return { success: false, error: 'Service request not found' };
  }

  const stmt = getDb().prepare(`
    INSERT INTO service_applications (request_id, provider_phone, provider_name, contact_info, availability, offer_price, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(requestId, providerPhone, providerName || 'No Name', contactInfo, availability || '', offerPrice, message || '');

  return { success: true, message: 'Application submitted successfully' };
}

export function getServiceRequestApplications(requestId) {
  if (!requestId) {
    return { success: false, error: 'requestId is required' };
  }

  const applications = getDb().prepare('SELECT * FROM service_applications WHERE request_id = ? ORDER BY created_at DESC').all(requestId);
  return { success: true, data: applications };
}

export function getProviderApplications(providerPhone) {
  if (!providerPhone) {
    return { success: false, error: 'providerPhone is required' };
  }

  const applications = getDb().prepare('SELECT * FROM service_applications WHERE provider_phone = ? ORDER BY created_at DESC').all(providerPhone);
  return { success: true, data: applications };
}

// ==================== QUESTIONS & ANSWERS ====================

// Ask a question
export function askQuestion(data) {
  const { title, content, authorPhone, authorName, subCounty, category } = data;
  
  const stmt = getDb().prepare(`
    INSERT INTO community_questions (title, content, author_phone, author_name, sub_county, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(title, content, authorPhone, authorName || 'Anonymous', subCounty, category || 'general');
  
  return {
    success: true,
    questionId: result.lastInsertRowid,
    message: 'Question posted successfully'
  };
}

// Get all questions with pagination
export function getQuestions(options = {}) {
  const { page = 1, limit = 20, subCounty, category, status } = options;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM community_questions WHERE 1=1';
  const params = [];
  
  if (subCounty) {
    query += ' AND sub_county = ?';
    params.push(subCounty);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const questions = getDb().prepare(query).all(...params);
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM community_questions WHERE 1=1';
  const countParams = [];
  if (subCounty) {
    countQuery += ' AND sub_county = ?';
    countParams.push(subCounty);
  }
  if (category) {
    countQuery += ' AND category = ?';
    countParams.push(category);
  }
  if (status) {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }
  
  const { total } = getDb().prepare(countQuery).get(...countParams);
  
  // Get answer counts for each question
  const questionsWithAnswers = questions.map(q => {
    const answerCount = getDb().prepare('SELECT COUNT(*) as count FROM community_answers WHERE question_id = ?').get(q.id);
    return { ...q, answerCount: answerCount.count };
  });
  
  return {
    success: true,
    data: questionsWithAnswers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// Get single question with answers
export function getQuestionWithAnswers(questionId) {
  // Increment views
  getDb().prepare('UPDATE community_questions SET views = views + 1 WHERE id = ?').run(questionId);
  
  const question = getDb().prepare('SELECT * FROM community_questions WHERE id = ?').get(questionId);
  
  if (!question) {
    return { success: false, error: 'Question not found' };
  }
  
  const answers = getDb().prepare(`
    SELECT * FROM community_answers 
    WHERE question_id = ? 
    ORDER BY is_verified DESC, upvotes DESC, created_at ASC
  `).all(questionId);
  
  return {
    success: true,
    question,
    answers
  };
}

// Answer a question
export function answerQuestion(data) {
  const { questionId, content, authorPhone, authorName } = data;
  
  // Check if question exists
  const question = getDb().prepare('SELECT * FROM community_questions WHERE id = ?').get(questionId);
  if (!question) {
    return { success: false, error: 'Question not found' };
  }
  
  const stmt = getDb().prepare(`
    INSERT INTO community_answers (question_id, content, author_phone, author_name)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(questionId, content, authorPhone, authorName || 'Anonymous');
  
  // Update question status if first answer
  const answerCount = getDb().prepare('SELECT COUNT(*) as count FROM community_answers WHERE question_id = ?').get(questionId);
  if (answerCount.count === 1) {
    getDb().prepare("UPDATE community_questions SET status = 'answered' WHERE id = ?").run(questionId);
  }
  
  return {
    success: true,
    answerId: result.lastInsertRowid,
    message: 'Answer posted successfully'
  };
}

// Upvote a question or answer
export function upvoteContent(type, id) {
  const table = type === 'question' ? 'community_questions' : 'community_answers';
  const column = type === 'question' ? 'upvotes' : 'upvotes';
  
  getDb().prepare(`UPDATE ${table} SET ${column} = ${column} + 1 WHERE id = ?`).run(id);
  
  return { success: true, message: 'Upvote recorded' };
}

// Mark answer as verified
export function verifyAnswer(answerId) {
  const result = getDb().prepare('UPDATE community_answers SET is_verified = 1 WHERE id = ?').run(answerId);
  
  return { success: true, message: 'Answer verified' };
}

// ==================== SUCCESS STORIES ====================

// Submit success story
export function submitSuccessStory(data) {
  const { title, content, authorPhone, authorName, subCounty, cropGrown, yieldAchieved, imageUrl } = data;
  
  const stmt = getDb().prepare(`
    INSERT INTO success_stories (title, content, author_phone, author_name, sub_county, crop_grown, yield_achieved, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(title, content, authorPhone, authorName || 'Anonymous', subCounty, cropGrown, yieldAchieved, imageUrl);
  
  return {
    success: true,
    storyId: result.lastInsertRowid,
    message: 'Success story submitted for review'
  };
}

// Get approved success stories
export function getSuccessStories(options = {}) {
   const { page = 1, limit = 10, subCounty } = options;
   const offset = (page - 1) * limit;
   
   let query = "SELECT * FROM success_stories WHERE status IN ('approved', 'pending')";
   const params = [];
   
   if (subCounty) {
     query += ' AND sub_county = ?';
     params.push(subCounty);
   }
   
   query += ' ORDER BY likes DESC, created_at DESC LIMIT ? OFFSET ?';
   params.push(limit, offset);
   
   const stories = getDb().prepare(query).all(...params);
   
   return {
     success: true,
     data: stories
   };
}

// Approve success story (admin)
export function approveSuccessStory(storyId) {
  getDb().prepare(`
    UPDATE success_stories 
    SET status = 'approved', approved_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(storyId);
  
  return { success: true, message: 'Story approved' };
}

// Like a success story
export function likeSuccessStory(storyId) {
  getDb().prepare('UPDATE success_stories SET likes = likes + 1 WHERE id = ?').run(storyId);
  return { success: true, message: 'Like recorded' };
}

// ==================== DISCUSSION BOARDS ====================

// Create discussion topic
export function createDiscussionTopic(data) {
  const { title, description, category, createdBy } = data;
  
  const stmt = getDb().prepare(`
    INSERT INTO discussion_topics (title, description, category, created_by)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(title, description, category, createdBy);
  
  return {
    success: true,
    topicId: result.lastInsertRowid,
    message: 'Topic created'
  };
}

// Get discussion topics
export function getDiscussionTopics(category) {
  let query = 'SELECT * FROM discussion_topics';
  const params = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY is_pinned DESC, last_activity DESC';
  
  const topics = getDb().prepare(query).all(...params);
  
  return {
    success: true,
    topics
  };
}

// Get posts in a topic
export function getTopicPosts(topicId) {
  const topic = getDb().prepare('SELECT * FROM discussion_topics WHERE id = ?').get(topicId);
  
  if (!topic) {
    return { success: false, error: 'Topic not found' };
  }
  
  const posts = getDb().prepare(`
    SELECT * FROM discussion_posts 
    WHERE topic_id = ? 
    ORDER BY created_at ASC
  `).all(topicId);
  
  return {
    success: true,
    topic,
    posts
  };
}

// Post in discussion
export function postToDiscussion(data) {
  const { topicId, content, authorPhone, authorName } = data;
  
  // Check if topic exists
  const topic = getDb().prepare('SELECT * FROM discussion_topics WHERE id = ?').get(topicId);
  if (!topic) {
    return { success: false, error: 'Topic not found' };
  }
  
  const stmt = getDb().prepare(`
    INSERT INTO discussion_posts (topic_id, content, author_phone, author_name)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(topicId, content, authorPhone, authorName || 'Anonymous');
  
  // Update topic activity
  getDb().prepare(`
    UPDATE discussion_topics 
    SET posts_count = posts_count + 1, last_activity = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(topicId);
  
  return {
    success: true,
    postId: result.lastInsertRowid,
    message: 'Post added'
  };
}

// Get user's questions (for My Contributions section)
export function getUserQuestions(userPhone) {
  if (!userPhone) {
    return {
      success: false,
      error: 'User phone number is required'
    };
  }
  
  const questions = getDb().prepare(`
    SELECT * FROM community_questions 
    WHERE author_phone = ? 
    ORDER BY created_at DESC
  `).all(userPhone);
  
  // Get answer counts for each question
  const questionsWithAnswers = questions.map(q => {
    const answerCount = getDb().prepare('SELECT COUNT(*) as count FROM community_answers WHERE question_id = ?').get(q.id);
    return { ...q, answerCount: answerCount.count };
  });
  
  return {
    success: true,
    data: questionsWithAnswers
  };
}

// Get user's stories (for My Contributions section)
export function getUserStories(userPhone) {
  if (!userPhone) {
    return {
      success: false,
      error: 'User phone number is required'
    };
  }
  
  const stories = getDb().prepare(`
    SELECT * FROM success_stories 
    WHERE author_phone = ? 
    ORDER BY created_at DESC
  `).all(userPhone);
  
  return {
    success: true,
    data: stories
  };
}

// ==================== COMMUNITY STATS ====================

export function getCommunityStats() {
  const questions = getDb().prepare('SELECT COUNT(*) as count FROM community_questions').get();
  const answers = getDb().prepare('SELECT COUNT(*) as count FROM community_answers').get();
  const stories = getDb().prepare("SELECT COUNT(*) as count FROM success_stories WHERE status = 'approved'").get();
  const topics = getDb().prepare('SELECT COUNT(*) as count FROM discussion_topics').get();
  
  // Get total members (unique phone numbers from questions and stories)
  const membersQuery = getDb().prepare(`
    SELECT COUNT(DISTINCT phone) as count 
    FROM (
      SELECT author_phone as phone FROM community_questions
      UNION 
      SELECT author_phone as phone FROM success_stories
    )
  `);
  const members = membersQuery.get();
  
  const recentQuestions = getDb().prepare(`
    SELECT q.*, q.author_name as author_name 
    FROM community_questions q 
    ORDER BY q.created_at DESC LIMIT 5
  `).all();
  
  return {
    success: true,
    stats: {
      totalQuestions: questions.count,
      totalAnswers: answers.count,
      approvedStories: stories.count,
      totalTopics: topics.count,
      totalMembers: members.count
    },
    recentQuestions
  };
}

export default {
  initializeCommunityDatabase,
  askQuestion,
  getQuestions,
  getQuestionWithAnswers,
  answerQuestion,
  upvoteContent,
  verifyAnswer,
  submitSuccessStory,
  getSuccessStories,
  approveSuccessStory,
  likeSuccessStory,
  createDiscussionTopic,
  getDiscussionTopics,
  getTopicPosts,
  postToDiscussion,
  getCommunityStats,
  getUserQuestions,
  getUserStories
};

