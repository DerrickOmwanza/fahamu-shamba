/**
 * Community Service for Fahamu Shamba (PostgreSQL/Async Compatible)
 * Provides farmer-to-farmer Q&A, discussion boards, and success stories
 */

import pool from './database-postgres.js';

const fallbackDbAsync = {
  run: async (sql, params = []) => {
    let paramIndex = 0;
    let pgSQL = sql.replace(/\?/g, () => `$${++paramIndex}`);
    
    // Auto-add RETURNING id for INSERT statements
    if (pgSQL.trim().toUpperCase().startsWith('INSERT') && !pgSQL.toUpperCase().includes('RETURNING')) {
      pgSQL += ' RETURNING id';
    }
    
    const result = await pool.query(pgSQL, params);
    return {
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount
    };
  },
  get: async (sql, params = []) => {
    let paramIndex = 0;
    const pgSQL = sql.replace(/\?/g, () => `$${++paramIndex}`);
    const result = await pool.query(pgSQL, params);
    return result.rows[0] || null;
  },
  all: async (sql, params = []) => {
    let paramIndex = 0;
    const pgSQL = sql.replace(/\?/g, () => `$${++paramIndex}`);
    const result = await pool.query(pgSQL, params);
    return result.rows;
  }
};

const USE_POSTGRES = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');
let activeDbAsync = fallbackDbAsync;
let schemaInitialized = false;

function getDbAsync() {
  return activeDbAsync;
}

const dbAsync = new Proxy({}, {
  get(_target, prop) {
    const current = getDbAsync();
    const value = current[prop];
    return typeof value === 'function' ? value.bind(current) : value;
  }
});

async function ensureCommunitySchema() {
  if (schemaInitialized) return;

  const db = getDbAsync();

  if (USE_POSTGRES) {
    await db.run(`
      CREATE TABLE IF NOT EXISTS community_questions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_phone VARCHAR(20) NOT NULL,
        author_name VARCHAR(100),
        sub_county VARCHAR(100),
        category VARCHAR(50) DEFAULT 'general',
        upvotes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_questions_author ON community_questions(author_phone)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_questions_category ON community_questions(category)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_questions_status ON community_questions(status)`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS community_answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author_phone VARCHAR(20) NOT NULL,
        author_name VARCHAR(100),
        upvotes INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_answers_question ON community_answers(question_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_answers_author ON community_answers(author_phone)`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS success_stories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_phone VARCHAR(20) NOT NULL,
        author_name VARCHAR(100),
        sub_county VARCHAR(100),
        crop_grown VARCHAR(100),
        yield_achieved VARCHAR(100),
        image_url TEXT,
        likes INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stories_author ON success_stories(author_phone)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stories_status ON success_stories(status)`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS discussion_topics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        created_by VARCHAR(20) NOT NULL,
        posts_count INTEGER DEFAULT 0,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_topics_category ON discussion_topics(category)`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS discussion_posts (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL REFERENCES discussion_topics(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author_phone VARCHAR(20) NOT NULL,
        author_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id SERIAL PRIMARY KEY,
        farmer_phone VARCHAR(20) NOT NULL,
        farmer_name VARCHAR(100),
        sub_county VARCHAR(100),
        location VARCHAR(255),
        field_size VARCHAR(100),
        crop VARCHAR(100),
        service_type VARCHAR(100),
        description TEXT,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_requests_farmer ON service_requests(farmer_phone)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS service_applications (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
        provider_phone VARCHAR(20) NOT NULL,
        provider_name VARCHAR(100),
        contact_info VARCHAR(255),
        availability VARCHAR(100),
        offer_price VARCHAR(100),
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_apps_request ON service_applications(request_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_apps_provider ON service_applications(provider_phone)`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS community_presence (
        id SERIAL PRIMARY KEY,
        member_phone VARCHAR(20) NOT NULL UNIQUE,
        member_name VARCHAR(100),
        sub_county VARCHAR(100),
        status VARCHAR(20) DEFAULT 'online',
        current_page VARCHAR(100),
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON community_presence(last_seen)`);
  } else {
    await db.run(`
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
    await db.run(`CREATE INDEX IF NOT EXISTS idx_questions_phone ON community_questions(author_phone)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_questions_category ON community_questions(category)`);

    await db.run(`
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
    await db.run(`CREATE INDEX IF NOT EXISTS idx_answers_question ON community_answers(question_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_answers_author ON community_answers(author_phone)`);

    await db.run(`
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
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stories_author ON success_stories(author_phone)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stories_status ON success_stories(status)`);

    await db.run(`
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

    await db.run(`
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

    await db.run(`
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
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_requests_farmer ON service_requests(farmer_phone)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)`);

    await db.run(`
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
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_apps_request ON service_applications(request_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_service_apps_provider ON service_applications(provider_phone)`);

    await db.run(`
      CREATE TABLE IF NOT EXISTS community_presence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_phone TEXT NOT NULL UNIQUE,
        member_name TEXT,
        sub_county TEXT,
        status TEXT DEFAULT 'online',
        current_page TEXT,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON community_presence(last_seen)`);
  }

  schemaInitialized = true;
}

export function setAsyncDb(asyncDbHelper) {
  if (asyncDbHelper) {
    activeDbAsync = asyncDbHelper;
  }
}

async function recordCommunityPresence({ memberPhone, memberName, subCounty, currentPage = 'community', status = 'online' }) {
  if (!memberPhone) {
    return { success: false, error: 'memberPhone is required' };
  }

  await ensureCommunitySchema();
  const db = getDbAsync();

  if (USE_POSTGRES) {
    await db.run(
      `INSERT INTO community_presence (member_phone, member_name, sub_county, status, current_page, last_seen)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (member_phone)
       DO UPDATE SET
         member_name = EXCLUDED.member_name,
         sub_county = EXCLUDED.sub_county,
         status = EXCLUDED.status,
         current_page = EXCLUDED.current_page,
         last_seen = CURRENT_TIMESTAMP`,
      [memberPhone, memberName || 'Farmer', subCounty || null, status, currentPage]
    );
  } else {
    await db.run(
      `INSERT INTO community_presence (member_phone, member_name, sub_county, status, current_page, last_seen)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(member_phone) DO UPDATE SET
         member_name = excluded.member_name,
         sub_county = excluded.sub_county,
         status = excluded.status,
         current_page = excluded.current_page,
         last_seen = CURRENT_TIMESTAMP`,
      [memberPhone, memberName || 'Farmer', subCounty || null, status, currentPage]
    );
  }

  return { success: true };
}

export async function initializeCommunityDatabase(dbConnection, asyncDbConnection) {
  if (asyncDbConnection) {
    setAsyncDb(asyncDbConnection);
  }
  await ensureCommunitySchema();
  console.log(`✅ Community async service initialized with ${USE_POSTGRES ? 'PostgreSQL' : 'SQLite'} dbAsync`);
}

// ==================== QUESTIONS & ANSWERS ====================

// Ask a question
export async function askQuestion(data) {
  const { title, content, authorPhone, authorName, subCounty, category } = data;
  await ensureCommunitySchema();
  
  const result = await dbAsync.run(
    `INSERT INTO community_questions (title, content, author_phone, author_name, sub_county, category)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, content, authorPhone, authorName || 'Anonymous', subCounty, category || 'general']
  );

  await recordCommunityPresence({
    memberPhone: authorPhone,
    memberName: authorName || 'Anonymous',
    subCounty
  });
  
  return {
    success: true,
    questionId: result.lastID,
    message: 'Question posted successfully'
  };
}

// Get all questions with pagination
export async function getQuestions(options = {}) {
  const { page = 1, limit = 20, subCounty, category, status } = options;
  await ensureCommunitySchema();
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
  
  const questions = await dbAsync.all(query, params);
  
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
  
  const countResult = await dbAsync.get(countQuery, countParams);
  const total = countResult?.total || 0;
  
  // Get answer counts for each question
  const questionsWithAnswers = await Promise.all(questions.map(async (q) => {
    const answerCount = await dbAsync.get('SELECT COUNT(*) as count FROM community_answers WHERE question_id = ?', [q.id]);
    return { ...q, answerCount: answerCount?.count || 0 };
  }));
  
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
export async function getQuestionWithAnswers(questionId) {
  await ensureCommunitySchema();
  // Increment views
  await dbAsync.run('UPDATE community_questions SET views = views + 1 WHERE id = ?', [questionId]);
  
  const question = await dbAsync.get('SELECT * FROM community_questions WHERE id = ?', [questionId]);
  
  if (!question) {
    return { success: false, error: 'Question not found' };
  }
  
  const answers = await dbAsync.all(
    `SELECT * FROM community_answers 
     WHERE question_id = ? 
     ORDER BY is_verified DESC, upvotes DESC, created_at ASC`,
    [questionId]
  );
  
  return {
    success: true,
    question,
    answers
  };
}

// Answer a question
export async function answerQuestion(data) {
  const { questionId, content, authorPhone, authorName } = data;
  await ensureCommunitySchema();
  
  // Check if question exists
  const question = await dbAsync.get('SELECT * FROM community_questions WHERE id = ?', [questionId]);
  if (!question) {
    return { success: false, error: 'Question not found' };
  }
  
  const result = await dbAsync.run(
    `INSERT INTO community_answers (question_id, content, author_phone, author_name)
     VALUES (?, ?, ?, ?)`,
    [questionId, content, authorPhone, authorName || 'Anonymous']
  );
  
  // Update question status if first answer
  const answerCount = await dbAsync.get('SELECT COUNT(*) as count FROM community_answers WHERE question_id = ?', [questionId]);
  if (answerCount.count === 1) {
    await dbAsync.run("UPDATE community_questions SET status = 'answered' WHERE id = ?", [questionId]);
  }

  await recordCommunityPresence({
    memberPhone: authorPhone,
    memberName: authorName || 'Anonymous',
    subCounty: question.sub_county
  });
  
  return {
    success: true,
    answerId: result.lastID,
    message: 'Answer posted successfully'
  };
}

// Upvote a question or answer
export async function upvoteContent(type, id) {
  await ensureCommunitySchema();
  const table = type === 'question' ? 'community_questions' : 'community_answers';
  const column = 'upvotes';
  
  await dbAsync.run(`UPDATE ${table} SET ${column} = ${column} + 1 WHERE id = ?`, [id]);
  
  return { success: true, message: 'Upvote recorded' };
}

// Mark answer as verified
export async function verifyAnswer(answerId) {
  await ensureCommunitySchema();
  await dbAsync.run('UPDATE community_answers SET is_verified = 1 WHERE id = ?', [answerId]);
  
  return { success: true, message: 'Answer verified' };
}

// ==================== SUCCESS STORIES ====================

// Submit success story
export async function submitSuccessStory(data) {
  const { title, content, authorPhone, authorName, subCounty, cropGrown, yieldAchieved, imageUrl } = data;
  await ensureCommunitySchema();
  
  const result = await dbAsync.run(
    `INSERT INTO success_stories (title, content, author_phone, author_name, sub_county, crop_grown, yield_achieved, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, content, authorPhone, authorName || 'Anonymous', subCounty, cropGrown, yieldAchieved, imageUrl]
  );

  await recordCommunityPresence({
    memberPhone: authorPhone,
    memberName: authorName || 'Anonymous',
    subCounty
  });
  
  return {
    success: true,
    storyId: result.lastID,
    message: 'Success story submitted for review'
  };
}

// Get approved success stories
export async function getSuccessStories(options = {}) {
  const { page = 1, limit = 10, subCounty } = options;
  await ensureCommunitySchema();
  const offset = (page - 1) * limit;
  
  let query = "SELECT * FROM success_stories WHERE status IN ('approved', 'pending')";
  const params = [];
  
  if (subCounty) {
    query += ' AND sub_county = ?';
    params.push(subCounty);
  }
  
  query += ' ORDER BY likes DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const stories = await dbAsync.all(query, params);
  
  return {
    success: true,
    data: stories
  };
}

// Approve success story (admin)
export async function approveSuccessStory(storyId) {
  await ensureCommunitySchema();
  await dbAsync.run(
    `UPDATE success_stories 
     SET status = 'approved', approved_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [storyId]
  );
  
  return { success: true, message: 'Story approved' };
}

// Like a success story
export async function likeSuccessStory(storyId) {
  await ensureCommunitySchema();
  await dbAsync.run('UPDATE success_stories SET likes = likes + 1 WHERE id = ?', [storyId]);
  return { success: true, message: 'Like recorded' };
}

// ==================== DISCUSSION BOARDS ====================

// Create discussion topic
export async function createDiscussionTopic(data) {
  const { title, description, category, createdBy } = data;
  await ensureCommunitySchema();
  
  const result = await dbAsync.run(
    `INSERT INTO discussion_topics (title, description, category, created_by)
     VALUES (?, ?, ?, ?)`,
    [title, description, category, createdBy]
  );
  
  return {
    success: true,
    topicId: result.lastID,
    message: 'Topic created'
  };
}

// Get discussion topics
export async function getDiscussionTopics(category) {
  await ensureCommunitySchema();
  let query = 'SELECT * FROM discussion_topics';
  const params = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY is_pinned DESC, last_activity DESC';
  
  const topics = await dbAsync.all(query, params);
  
  return {
    success: true,
    topics
  };
}

// Get posts in a topic
export async function getTopicPosts(topicId) {
  await ensureCommunitySchema();
  const topic = await dbAsync.get('SELECT * FROM discussion_topics WHERE id = ?', [topicId]);
  
  if (!topic) {
    return { success: false, error: 'Topic not found' };
  }
  
  const posts = await dbAsync.all(
    `SELECT * FROM discussion_posts 
     WHERE topic_id = ? 
     ORDER BY created_at ASC`,
    [topicId]
  );
  
  return {
    success: true,
    topic,
    posts
  };
}

// Post in discussion
export async function postToDiscussion(data) {
  const { topicId, content, authorPhone, authorName } = data;
  await ensureCommunitySchema();
  
  // Check if topic exists
  const topic = await dbAsync.get('SELECT * FROM discussion_topics WHERE id = ?', [topicId]);
  if (!topic) {
    return { success: false, error: 'Topic not found' };
  }
  
  const result = await dbAsync.run(
    `INSERT INTO discussion_posts (topic_id, content, author_phone, author_name)
     VALUES (?, ?, ?, ?)`,
    [topicId, content, authorPhone, authorName || 'Anonymous']
  );
  
  // Update topic activity
  await dbAsync.run(
    `UPDATE discussion_topics 
     SET posts_count = posts_count + 1, last_activity = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [topicId]
  );

  await recordCommunityPresence({
    memberPhone: authorPhone,
    memberName: authorName || 'Anonymous'
  });
  
  return {
    success: true,
    postId: result.lastID,
    message: 'Post added'
  };
}

// Get user's questions (for My Contributions section)
export async function getUserQuestions(userPhone) {
  await ensureCommunitySchema();
  if (!userPhone) {
    return {
      success: false,
      error: 'User phone number is required'
    };
  }
  
  const questions = await dbAsync.all(
    `SELECT * FROM community_questions 
     WHERE author_phone = ? 
     ORDER BY created_at DESC`,
    [userPhone]
  );
  
  // Get answer counts for each question
  const questionsWithAnswers = await Promise.all(questions.map(async (q) => {
    const answerCount = await dbAsync.get('SELECT COUNT(*) as count FROM community_answers WHERE question_id = ?', [q.id]);
    return { ...q, answerCount: answerCount?.count || 0 };
  }));
  
  return {
    success: true,
    data: questionsWithAnswers
  };
}

// Get user's stories (for My Contributions section)
export async function getUserStories(userPhone) {
  await ensureCommunitySchema();
  if (!userPhone) {
    return {
      success: false,
      error: 'User phone number is required'
    };
  }
  
  const stories = await dbAsync.all(
    `SELECT * FROM success_stories 
     WHERE author_phone = ? 
     ORDER BY created_at DESC`,
    [userPhone]
  );
  
  return {
    success: true,
    data: stories
  };
}

// ==================== SERVICE MARKETPLACE ====================

export async function postServiceRequest(data) {
  const { farmerPhone, farmerName, subCounty, location, fieldSize, crop, serviceType, description } = data;
  await ensureCommunitySchema();
  if (!farmerPhone || !location || !serviceType || !description) {
    return { success: false, error: 'farmerPhone, location, serviceType and description are required' };
  }

  const result = await dbAsync.run(
    `INSERT INTO service_requests (farmer_phone, farmer_name, sub_county, location, field_size, crop, service_type, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [farmerPhone, farmerName || 'Unknown', subCounty || '', location, fieldSize || '', crop || '', serviceType, description]
  );

  await recordCommunityPresence({
    memberPhone: farmerPhone,
    memberName: farmerName || 'Farmer',
    subCounty,
    currentPage: 'service-market',
    status: 'online'
  });

  return { success: true, requestId: result.lastID, message: 'Service request posted successfully' };
}

export async function getServiceRequests(options = {}) {
  await ensureCommunitySchema();
  const { page = 1, limit = 20, subCounty, status, serviceType, crop, search } = options;
  const offset = (page - 1) * limit;

  let query = `
    SELECT sr.*,
           COUNT(sa.id) as applications_count
    FROM service_requests sr
    LEFT JOIN service_applications sa ON sa.request_id = sr.id
    WHERE 1=1
  `;
  const params = [];

  if (subCounty) {
    query += ' AND sr.sub_county = ?';
    params.push(subCounty);
  }
  if (status) {
    query += ' AND sr.status = ?';
    params.push(status);
  }
  if (serviceType) {
    query += ' AND sr.service_type = ?';
    params.push(serviceType);
  }
  if (crop) {
    query += ' AND sr.crop = ?';
    params.push(crop);
  }
  if (search) {
    query += ' AND (LOWER(sr.service_type) LIKE ? OR LOWER(sr.crop) LIKE ? OR LOWER(sr.location) LIKE ? OR LOWER(sr.sub_county) LIKE ? OR LOWER(sr.description) LIKE ?)';
    const searchTerm = `%${String(search).toLowerCase()}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += ' GROUP BY sr.id ORDER BY sr.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const requests = await dbAsync.all(query, params);
  const countParams = [];
  let countQuery = 'SELECT COUNT(*) as total FROM service_requests WHERE 1=1';
  if (subCounty) {
    countQuery += ' AND sub_county = ?';
    countParams.push(subCounty);
  }
  if (status) {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }
  if (serviceType) {
    countQuery += ' AND service_type = ?';
    countParams.push(serviceType);
  }
  if (crop) {
    countQuery += ' AND crop = ?';
    countParams.push(crop);
  }
  if (search) {
    countQuery += ' AND (LOWER(service_type) LIKE ? OR LOWER(crop) LIKE ? OR LOWER(location) LIKE ? OR LOWER(sub_county) LIKE ? OR LOWER(description) LIKE ?)';
    const searchTerm = `%${String(search).toLowerCase()}%`;
    countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  const totalResult = await dbAsync.get(countQuery, countParams);

  return {
    success: true,
    data: requests,
    pagination: {
      page,
      limit,
      total: totalResult?.total || 0,
      pages: Math.ceil((totalResult?.total || 0) / limit)
    }
  };
}

export async function getFarmerServiceRequests(farmerPhone) {
  await ensureCommunitySchema();
  if (!farmerPhone) {
    return { success: false, error: 'farmerPhone is required' };
  }

  const requests = await dbAsync.all(
    `SELECT sr.*,
            COUNT(sa.id) as applications_count
     FROM service_requests sr
     LEFT JOIN service_applications sa ON sa.request_id = sr.id
     WHERE sr.farmer_phone = ?
     GROUP BY sr.id
     ORDER BY sr.created_at DESC`,
    [farmerPhone]
  );

  const enrichedRequests = await Promise.all(
    requests.map(async (request) => {
      const applications = await dbAsync.all(
        `SELECT id, request_id, provider_phone, provider_name, contact_info, availability, offer_price, message, status, created_at
         FROM service_applications
         WHERE request_id = ?
         ORDER BY created_at DESC`,
        [request.id]
      );

      return {
        ...request,
        applications
      };
    })
  );

  return {
    success: true,
    data: enrichedRequests
  };
}

export async function applyToServiceRequest(data) {
  await ensureCommunitySchema();
  const { requestId, providerPhone, providerName, contactInfo, availability, offerPrice, message } = data;
  if (!requestId || !providerPhone || !contactInfo || !offerPrice) {
    return { success: false, error: 'requestId, providerPhone, contactInfo and offerPrice are required' };
  }

  const request = await dbAsync.get('SELECT * FROM service_requests WHERE id = ?', [requestId]);
  if (!request) {
    return { success: false, error: 'Service request not found' };
  }

  const existingApplication = await dbAsync.get(
    'SELECT id FROM service_applications WHERE request_id = ? AND provider_phone = ?',
    [requestId, providerPhone]
  );
  if (existingApplication) {
    return { success: false, error: 'You have already applied for this service request' };
  }

  await dbAsync.run(
    `INSERT INTO service_applications (request_id, provider_phone, provider_name, contact_info, availability, offer_price, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [requestId, providerPhone, providerName || 'No Name', contactInfo, availability || '', offerPrice, message || '']
  );

  await recordCommunityPresence({
    memberPhone: providerPhone,
    memberName: providerName || 'Provider',
    subCounty: request.sub_county || '',
    currentPage: 'service-market',
    status: 'online'
  });

  return { success: true, message: 'Application submitted successfully' };
}

export async function getServiceRequestApplications(requestId) {
  await ensureCommunitySchema();
  if (!requestId) {
    return { success: false, error: 'requestId is required' };
  }

  const applications = await dbAsync.all('SELECT * FROM service_applications WHERE request_id = ? ORDER BY created_at DESC', [requestId]);
  return { success: true, data: applications };
}

export async function getProviderApplications(providerPhone) {
  await ensureCommunitySchema();
  if (!providerPhone) {
    return { success: false, error: 'providerPhone is required' };
  }

  const applications = await dbAsync.all(
    `SELECT sa.*,
            sr.service_type,
            sr.crop,
            sr.location,
            sr.sub_county,
            sr.field_size,
            sr.description as request_description,
            sr.farmer_name,
            sr.farmer_phone,
            sr.status as request_status
     FROM service_applications sa
     INNER JOIN service_requests sr ON sr.id = sa.request_id
     WHERE sa.provider_phone = ?
     ORDER BY sa.created_at DESC`,
    [providerPhone]
  );
  return { success: true, data: applications };
}

// ==================== COMMUNITY STATS ====================

export async function getCommunityStats() {
  await ensureCommunitySchema();
  const questions = await dbAsync.get('SELECT COUNT(*) as count FROM community_questions');
  const answers = await dbAsync.get('SELECT COUNT(*) as count FROM community_answers');
  const stories = await dbAsync.get("SELECT COUNT(*) as count FROM success_stories WHERE status = 'approved'");
  const topics = await dbAsync.get('SELECT COUNT(*) as count FROM discussion_topics');

  const activeMembers = await dbAsync.get(`
    SELECT COUNT(*) as count
    FROM community_presence
    WHERE last_seen >= ${USE_POSTGRES ? "CURRENT_TIMESTAMP - INTERVAL '5 minutes'" : "datetime('now', '-5 minutes')"}
  `);

  const members = await dbAsync.get(`
    SELECT COUNT(DISTINCT phone) as count 
    FROM (
      SELECT author_phone as phone FROM community_questions
      UNION 
      SELECT author_phone as phone FROM success_stories
      UNION
      SELECT author_phone as phone FROM community_answers
    ) AS combined
  `);
  
  const recentQuestions = await dbAsync.all(`
    SELECT q.*, q.author_name as author_name 
    FROM community_questions q 
    ORDER BY q.created_at DESC LIMIT 5
  `);
  
  return {
    success: true,
    stats: {
      totalQuestions: questions?.count || 0,
      totalAnswers: answers?.count || 0,
      approvedStories: stories?.count || 0,
      totalTopics: topics?.count || 0,
      totalMembers: members?.count || 0,
      activeMembers: activeMembers?.count || 0
    },
    recentQuestions
  };
}

export async function getActiveCommunityMembers(limit = 12) {
  await ensureCommunitySchema();
  const members = await dbAsync.all(
    `SELECT member_phone, member_name, sub_county, current_page, last_seen
     FROM community_presence
     WHERE last_seen >= ${USE_POSTGRES ? "CURRENT_TIMESTAMP - INTERVAL '5 minutes'" : "datetime('now', '-5 minutes')"}
     ORDER BY last_seen DESC
     LIMIT ?`,
    [limit]
  );

  return {
    success: true,
    data: members,
    count: members.length
  };
}

export async function updateCommunityPresence(data) {
  await ensureCommunitySchema();
  return await recordCommunityPresence(data);
}

export default {
  initializeCommunityDatabase,
  setAsyncDb,
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
  getActiveCommunityMembers,
  updateCommunityPresence,
  getUserQuestions,
  getUserStories,
  postServiceRequest,
  getServiceRequests,
  getFarmerServiceRequests,
  applyToServiceRequest,
  getServiceRequestApplications,
  getProviderApplications
};
