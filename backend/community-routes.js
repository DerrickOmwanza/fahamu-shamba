/**
 * Community Routes for Fahamu Shamba
 * API endpoints for Q&A, discussions, and success stories
 */

import express from 'express';
import communityService from './community-service-async.js';

const router = express.Router();

// Middleware to ensure dbAsync is set for all routes
router.use((req, res, next) => {
  if (req.dbAsync) {
    communityService.setAsyncDb(req.dbAsync);
  }
  next();
});

// ==================== QUESTIONS & ANSWERS ====================

// Ask a question
router.post('/community/questions', async (req, res) => {
  try {
    const { title, content, authorPhone, authorName, subCounty, category } = req.body;
    
    if (!title || !content || !authorPhone) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and authorPhone are required'
      });
    }
    
    const result = await communityService.askQuestion({
      title,
      content,
      authorPhone,
      authorName,
      subCounty,
      category
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(500).json({ success: false, error: 'Failed to post question', details: error.message });
  }
});

// Get all questions
router.get('/community/questions', async (req, res) => {
  try {
    const { page, limit, subCounty, category, status } = req.query;
    
    const result = await communityService.getQuestions({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      subCounty,
      category,
      status
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch questions', details: error.message });
  }
});

// Get user's questions (for My Contributions section)
router.get('/community/my-questions', async (req, res) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'User phone number is required'
      });
    }
    
    const result = await communityService.getUserQuestions(phone);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user questions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user questions', details: error.message });
  }
});

// Get user's stories (for My Contributions section)
router.get('/community/my-stories', async (req, res) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'User phone number is required'
      });
    }
    
    const result = await communityService.getUserStories(phone);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user stories', details: error.message });
  }
});

// Service marketplace: create service request
router.post('/community/service-requests', async (req, res) => {
  try {
    const result = await communityService.postServiceRequest(req.body);
    if (result.success) return res.json(result);
    return res.status(400).json(result);
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ success: false, error: 'Failed to create service request', details: error.message });
  }
});

// Service marketplace: list service requests
router.get('/community/service-requests', async (req, res) => {
  try {
    const { page, limit, subCounty, status, serviceType, crop, search } = req.query;
    const result = await communityService.getServiceRequests({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      subCounty,
      status,
      serviceType,
      crop,
      search
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch service requests', details: error.message });
  }
});

// Service marketplace: farmer-owned requests with applications
router.get('/community/my-service-requests', async (req, res) => {
  try {
    const { farmerPhone } = req.query;
    if (!farmerPhone) {
      return res.status(400).json({ success: false, error: 'farmerPhone query parameter is required' });
    }
    const result = await communityService.getFarmerServiceRequests(farmerPhone);
    res.json(result);
  } catch (error) {
    console.error('Error fetching farmer service requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch farmer service requests', details: error.message });
  }
});

// Service marketplace: apply to a request
router.post('/community/service-requests/:id/applications', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const result = await communityService.applyToServiceRequest({ ...req.body, requestId });
    if (result.success) return res.json(result);
    return res.status(400).json(result);
  } catch (error) {
    console.error('Error applying to service request:', error);
    res.status(500).json({ success: false, error: 'Failed to apply to service request', details: error.message });
  }
});

// Service marketplace: get applications for a request
router.get('/community/service-requests/:id/applications', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const result = await communityService.getServiceRequestApplications(requestId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching applications for service request:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications', details: error.message });
  }
});

// Service marketplace: provider applications
router.get('/community/service-applications', async (req, res) => {
  try {
    const { providerPhone } = req.query;
    if (!providerPhone) {
      return res.status(400).json({ success: false, error: 'providerPhone query parameter is required'});
    }
    const result = await communityService.getProviderApplications(providerPhone);
    res.json(result);
  } catch (error) {
    console.error('Error fetching provider applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch provider applications', details: error.message });
  }
});

// Get single question with answers
router.get('/community/questions/:id', async (req, res) => {
  try {
    const result = await communityService.getQuestionWithAnswers(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch question', details: error.message });
  }
});

// Answer a question
router.post('/community/answers', async (req, res) => {
  try {
    const { questionId, content, authorPhone, authorName } = req.body;
    
    if (!questionId || !content || !authorPhone) {
      return res.status(400).json({
        success: false,
        error: 'questionId, content, and authorPhone are required'
      });
    }
    
    const result = await communityService.answerQuestion({
      questionId: parseInt(questionId),
      content,
      authorPhone,
      authorName
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error posting answer:', error);
    res.status(500).json({ success: false, error: 'Failed to post answer', details: error.message });
  }
});

// Upvote question or answer
router.post('/community/upvote', async (req, res) => {
  try {
    const { type, id } = req.body;
    
    if (!type || !id) {
      return res.status(400).json({
        success: false,
        error: 'type and id are required'
      });
    }
    
    if (!['question', 'answer'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'type must be "question" or "answer"'
      });
    }
    
    const result = await communityService.upvoteContent(type, parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error upvoting:', error);
    res.status(500).json({ success: false, error: 'Failed to upvote', details: error.message });
  }
});

// Verify answer (admin)
router.post('/community/answers/verify', async (req, res) => {
  try {
    const { answerId } = req.body;
    
    if (!answerId) {
      return res.status(400).json({
        success: false,
        error: 'answerId is required'
      });
    }
    
    const result = await communityService.verifyAnswer(parseInt(answerId));
    res.json(result);
  } catch (error) {
    console.error('Error verifying answer:', error);
    res.status(500).json({ success: false, error: 'Failed to verify answer', details: error.message });
  }
});

// ==================== SUCCESS STORIES ====================

// Submit success story
router.post('/community/stories', async (req, res) => {
  try {
    const { title, content, authorPhone, authorName, subCounty, cropGrown, yieldAchieved, imageUrl } = req.body;
    
    if (!title || !content || !authorPhone) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and authorPhone are required'
      });
    }
    
    const result = await communityService.submitSuccessStory({
      title,
      content,
      authorPhone,
      authorName,
      subCounty,
      cropGrown,
      yieldAchieved,
      imageUrl
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting story:', error);
    res.status(500).json({ success: false, error: 'Failed to submit story', details: error.message });
  }
});

// Get success stories
router.get('/community/stories', async (req, res) => {
  try {
    const { page, limit, subCounty } = req.query;
    
    const result = await communityService.getSuccessStories({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      subCounty
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stories', details: error.message });
  }
});

// Like success story
router.post('/community/stories/like', async (req, res) => {
  try {
    const { storyId } = req.body;
    
    if (!storyId) {
      return res.status(400).json({
        success: false,
        error: 'storyId is required'
      });
    }
    
    const result = await communityService.likeSuccessStory(parseInt(storyId));
    res.json(result);
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ success: false, error: 'Failed to like story', details: error.message });
  }
});

// Approve success story (admin)
router.post('/community/stories/approve', async (req, res) => {
  try {
    const { storyId } = req.body;
    
    if (!storyId) {
      return res.status(400).json({
        success: false,
        error: 'storyId is required'
      });
    }
    
    const result = await communityService.approveSuccessStory(parseInt(storyId));
    res.json(result);
  } catch (error) {
    console.error('Error approving story:', error);
    res.status(500).json({ success: false, error: 'Failed to approve story', details: error.message });
  }
});

// ==================== DISCUSSION BOARDS ====================

// Create discussion topic
router.post('/community/topics', async (req, res) => {
  try {
    const { title, description, category, createdBy } = req.body;
    
    if (!title || !category || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'title, category, and createdBy are required'
      });
    }
    
    const result = await communityService.createDiscussionTopic({
      title,
      description,
      category,
      createdBy
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ success: false, error: 'Failed to create topic', details: error.message });
  }
});

// Get discussion topics
router.get('/community/topics', async (req, res) => {
  try {
    const { category } = req.query;
    const result = await communityService.getDiscussionTopics(category);
    res.json(result);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch topics', details: error.message });
  }
});

// Get posts in topic
router.get('/community/topics/:id/posts', async (req, res) => {
  try {
    const result = await communityService.getTopicPosts(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts', details: error.message });
  }
});

// Post to discussion
router.post('/community/posts', async (req, res) => {
  try {
    const { topicId, content, authorPhone, authorName } = req.body;
    
    if (!topicId || !content || !authorPhone) {
      return res.status(400).json({
        success: false,
        error: 'topicId, content, and authorPhone are required'
      });
    }
    
    const result = await communityService.postToDiscussion({
      topicId: parseInt(topicId),
      content,
      authorPhone,
      authorName
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error posting:', error);
    res.status(500).json({ success: false, error: 'Failed to post', details: error.message });
  }
});

// ==================== COMMUNITY STATS ====================

// Get community statistics
router.get('/community/stats', async (req, res) => {
  try {
    const result = await communityService.getCommunityStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats', details: error.message });
  }
});

router.get('/community/active-members', async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await communityService.getActiveCommunityMembers(parseInt(limit) || 12);
    res.json(result);
  } catch (error) {
    console.error('Error fetching active community members:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active members', details: error.message });
  }
});

router.post('/community/presence', async (req, res) => {
  try {
    const { memberPhone, memberName, subCounty, currentPage, status } = req.body;

    if (!memberPhone) {
      return res.status(400).json({
        success: false,
        error: 'memberPhone is required'
      });
    }

    const result = await communityService.updateCommunityPresence({
      memberPhone,
      memberName,
      subCounty,
      currentPage,
      status
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating community presence:', error);
    res.status(500).json({ success: false, error: 'Failed to update presence', details: error.message });
  }
});

export default router;
