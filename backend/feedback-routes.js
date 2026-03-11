/**
 * Feedback Routes for Fahamu Shamba
 * API endpoints for ratings, yield tracking, and analytics
 */

import express from 'express';
import feedbackService from './feedback-service-async.js';

const router = express.Router();

// ==================== RATINGS ====================

// Submit rating for a prediction
router.post('/feedback/rate', async (req, res) => {
  try {
    const { predictionId, phoneNumber, crop, rating, subCounty, soilType, season } = req.body;
    
    if (!crop || !rating) {
      return res.status(400).json({
        success: false,
        error: 'crop and rating are required'
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    const result = await feedbackService.submitRating({
      predictionId,
      phoneNumber,
      crop,
      rating,
      subCounty,
      soilType,
      season
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ success: false, error: 'Failed to submit rating' });
  }
});

// Submit detailed feedback
router.post('/feedback/submit', async (req, res) => {
  try {
    const {
      predictionId,
      phoneNumber,
      cropRecommended,
      cropPlanted,
      rating,
      wasHelpful,
      yieldAchieved,
      yieldUnit,
      cultivationPeriod,
      challenges,
      suggestions,
      wouldRecommend
    } = req.body;
    
    if (!cropRecommended) {
      return res.status(400).json({
        success: false,
        error: 'cropRecommended is required'
      });
    }
    
    const result = await feedbackService.submitFeedback({
      predictionId,
      phoneNumber,
      cropRecommended,
      cropPlanted,
      rating,
      wasHelpful,
      yieldAchieved,
      yieldUnit,
      cultivationPeriod,
      challenges,
      suggestions,
      wouldRecommend
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
});

// Simple feedback submission (for quick feedback and detailed feedback)
router.post('/feedback', async (req, res) => {
  try {
    const { helpful, comments, feedback_type, rating, phoneNumber } = req.body;
    
    // Use provided phoneNumber or try to extract from token
    let phone = phoneNumber;
    
    if (!phone) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          // Simple JWT decode (for production use proper jwt library)
          const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          phone = decoded.phone || decoded.phoneNumber;
        } catch (e) {
          // Token decode failed, phone is still undefined
        }
      }
    }
    
    // If still no phone, generate a temporary identifier
    if (!phone) {
      phone = `guest_${Date.now()}`;
    }
    
    const result = await feedbackService.submitSimpleFeedback({
      phoneNumber: phone,
      helpful,
      comments,
      feedback_type,
      rating
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting simple feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
});

// Get user's feedback history
router.get('/feedback/user/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { limit = 10 } = req.query;
    
    const result = await feedbackService.getUserFeedback(phoneNumber, parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
});

// Get all feedback (admin)
router.get('/feedback/all', async (req, res) => {
  try {
    const { page, limit, crop, subCounty, minRating } = req.query;
    
    const result = await feedbackService.getAllFeedback({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      crop,
      subCounty,
      minRating: minRating ? parseInt(minRating) : null
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
});

// ==================== YIELD TRACKING ====================

// Record yield
router.post('/feedback/yield', async (req, res) => {
  try {
    let {
      phoneNumber,
      crop,
      subCounty,
      soilType,
      season,
      yieldAmount,
      yieldUnit,
      farmSize,
      inputsUsed,
      notes
    } = req.body;
    
    // Extract phoneNumber from token if not provided
    if (!phoneNumber) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          // Simple JWT decode (for production use proper jwt library)
          const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          phoneNumber = decoded.phone || decoded.phoneNumber;
        } catch (e) {
          // Token decode failed
        }
      }
    }
    
    // If still no phone, generate a temporary identifier
    if (!phoneNumber) {
      phoneNumber = `guest_${Date.now()}`;
    }
    
    // Handle yield_amount from frontend
    const amount = yieldAmount || req.body.yield_amount;
    
    if (!crop) {
      return res.status(400).json({
        success: false,
        error: 'crop is required'
      });
    }
    
    const result = await feedbackService.recordYield({
      phoneNumber,
      crop,
      subCounty,
      soilType,
      season,
      yieldAmount: amount,
      yieldUnit,
      farmSize,
      inputsUsed,
      notes
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error recording yield:', error);
    res.status(500).json({ success: false, error: 'Failed to record yield' });
  }
});

// Get user yield history - requires phoneNumber in URL
router.get('/feedback/yields/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const result = await feedbackService.getUserYields(phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Error fetching yields:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch yields' });
  }
});

// Get current user's yield history (from token)
router.get('/feedback/yields', async (req, res) => {
  try {
    // Extract phoneNumber from token
    let phoneNumber = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        phoneNumber = decoded.phone || decoded.phoneNumber;
      } catch (e) {
        // Token decode failed
      }
    }
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Unable to identify user. Please log in.'
      });
    }
    
    const result = await feedbackService.getUserYields(phoneNumber);
    // Return in format expected by frontend: { success, data }
    res.json({
      success: result.success,
      data: result.yields || []
    });
  } catch (error) {
    console.error('Error fetching yields:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch yields' });
  }
});

// Get yield analytics
router.get('/feedback/yields/analytics', async (req, res) => {
  try {
    const { crop, subCounty } = req.query;
    
    const result = await feedbackService.getYieldAnalytics(crop, subCounty);
    res.json(result);
  } catch (error) {
    console.error('Error fetching yield analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// ==================== ANALYTICS ====================

// Get comprehensive feedback analytics
router.get('/feedback/analytics', async (req, res) => {
  try {
    const result = await feedbackService.getFeedbackAnalytics();
    
    // Transform to format expected by frontend
    if (result.success && result.analytics) {
      const overall = result.analytics.overall || {};
      const yieldStats = result.analytics.yieldStats || [];
      
      // Calculate total yields
      const totalYields = yieldStats.reduce((sum, item) => sum + (item.records || 0), 0);
      
      res.json({
        success: true,
        data: {
          totalFeedback: overall.totalFeedback || 0,
          helpfulCount: overall.helpfulPercentage || 0,  // Note: This is percentage in original
          averageRating: overall.avgRating || 0,
          totalYields: totalYields
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          totalFeedback: 0,
          helpfulCount: 0,
          averageRating: 0,
          totalYields: 0
        }
      });
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Get recent feedback
router.get('/feedback/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const result = await feedbackService.getRecentFeedback({
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching recent feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent feedback' });
  }
});

// Get ML training data
router.get('/feedback/ml-data', async (req, res) => {
  try {
    const { minRatings } = req.query;
    
    const result = await feedbackService.getMLTrainingData({
      minRatings: parseInt(minRatings) || 5
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching ML data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ML data' });
  }
});

// ==================== PRICE ALERTS ====================

// Subscribe to price alert
router.post('/feedback/price-alert', async (req, res) => {
  try {
    const { phoneNumber, crop, thresholdType, thresholdPrice, notifySms, notifyPush } = req.body;
    
    if (!phoneNumber || !crop) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber and crop are required'
      });
    }
    
    const result = await feedbackService.subscribePriceAlert({
      phoneNumber,
      crop,
      thresholdType,
      thresholdPrice,
      notifySms,
      notifyPush
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error subscribing to price alert:', error);
    res.status(500).json({ success: false, error: 'Failed to subscribe' });
  }
});

// Get user price alerts
router.get('/feedback/price-alerts/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const result = await feedbackService.getUserPriceAlerts(phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// Update price alert
router.put('/feedback/price-alert/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { thresholdPrice, isActive } = req.body;
    
    const result = await feedbackService.updatePriceAlert(parseInt(id), {
      thresholdPrice,
      isActive
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error updating price alert:', error);
    res.status(500).json({ success: false, error: 'Failed to update alert' });
  }
});

// Delete price alert
router.delete('/feedback/price-alert/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await feedbackService.deletePriceAlert(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

export default router;
