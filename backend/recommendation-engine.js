// ML-based Recommendation Engine for Fahamu Shamba
// Uses rule-based logic + scoring to recommend crops

import demoData from './demo-data.js';
import farmInputsData from './farm-inputs-data.js';

class RecommendationEngine {
  constructor() {
    this.cropRules = demoData.cropRules;
    this.soilData = demoData.soilData;
    this.weatherData = demoData.weatherData;
    this.marketPrices = demoData.marketPrices;
    this.cropInputs = farmInputsData.cropInputs;
    this.essentialTools = farmInputsData.essentialTools;
    this.costSavingStrategies = farmInputsData.costSavingStrategies;
  }

  /**
   * Main recommendation function
   * @param {Object} farmerData - farmer's conditions { subCounty, soilType, season, budget, farmSize, waterSource }
   * @returns {Object} - top 3 crop recommendations with scores
   * IMPROVED: Ensures diversity, filters by constraints
   */
  getRecommendations(farmerData) {
    const { subCounty, soilType, season, budget = 5000, farmSize = 1, waterSource = 'Rainfall' } = farmerData;

    // Calculate score for each crop
    const cropScores = this.cropRules.map(rule => {
      const score = this.calculateCropScore(rule, {
        subCounty: subCounty.toLowerCase(),
        soilType: soilType.toLowerCase(),
        season: season.toLowerCase(),
        budget,
        farmSize,
        waterSource
      });

      return {
        ...rule,
        score,
        marketPrice: this.getMarketPrice(rule.name, subCounty)
      };
    });

    // Filter out zero scores (constraint violations)
    const viableCrops = cropScores.filter(crop => crop.score > 0);

    // Sort by score descending
    viableCrops.sort((a, b) => b.score - a.score);

    // NEW: Ensure diversity - get top 3 DIFFERENT crops
    const recommendations = [];
    const seenCropNames = new Set();
    
    for (const crop of viableCrops) {
      if (recommendations.length >= 3) break;  // Get top 3 different crops
      
      if (!seenCropNames.has(crop.name)) {
        recommendations.push(crop);
        seenCropNames.add(crop.name);
      }
    }

    return {
      recommendations,
      allScores: viableCrops,  // All viable options, not just top 3
      metadata: {
        timestamp: new Date().toISOString(),
        location: subCounty,
        soil: soilType,
        season,
        budget,
        farmSize,
        recommendationDiversity: Math.min(100, Math.round(recommendations.length / 3 * 100))
      }
    };
  }

  /**
   * Calculate suitability score for a crop (0-100)
   * IMPROVED: Check constraints first, better scoring
   */
  calculateCropScore(rule, farmerData) {
    // Check budget constraint FIRST - if not met, return 0
    if (rule.budgetRange) {
      if (farmerData.budget < rule.budgetRange.min) {
        return 0;  // Budget too low for this crop
      }
    }

    // Check farm size constraint FIRST - if not met, return 0
    if (rule.farmSizeRange) {
      if (farmerData.farmSize < rule.farmSizeRange.min) {
        return 0;  // Farm too small for this crop
      }
    }

    let score = 0;

    // 1. Soil match (30 points max) - CRITICAL factor
    const soilMatch = rule.conditions.soil === farmerData.soilType;
    score += soilMatch ? 30 : 0;  // No points if soil doesn't match

    // 2. Season match (25 points max) - CRITICAL factor
    const seasonMatch = rule.conditions.season === farmerData.season;
    score += seasonMatch ? 25 : 0;  // No points if season doesn't match

    // 3. Sub-county match (15 points max)
    const subCountyMatch = rule.conditions.subcounty === farmerData.subCounty;
    score += subCountyMatch ? 15 : 5;  // Small points for nearby areas

    // 4. Rule confidence (0-25 points) - weighted by rule's own confidence
    // This is now LESS important to prevent bias
    const confidenceScore = (rule.confidence / 100) * 25;
    score += confidenceScore;

    // 5. Water requirement vs water source (10 points max)
    const waterScore = this.getWaterCompatibilityScore(rule.waterReq, farmerData.waterSource);
    score += waterScore;

    // 6. Budget feasibility within range (5 points max)
    const budgetScore = this.getBudgetFeasibilityScore(
      rule.budgetRange, 
      farmerData.budget
    );
    score += budgetScore;

    // 7. Farm size suitability (5 points max)
    const sizeScore = this.getFarmSizeScore(rule.name, farmerData.farmSize);
    score += sizeScore;

    return Math.min(100, Math.round(score));
  }

  /**
   * Score budget feasibility with range (0-5)
   */
  getBudgetFeasibilityScore(budgetRange, budget) {
    if (!budgetRange) return 3; // Default middle score
    
    const { min, max } = budgetRange;
    
    if (budget >= min && budget <= max) {
      return 5;  // Perfect fit
    } else if (budget >= min * 0.8 && budget <= max * 1.2) {
      return 3;  // Acceptable
    } else if (budget >= min * 0.5) {
      return 1;  // Tight but possible
    }
    
    return 0;  // Not feasible
  }

  /**
   * Score water requirement vs water source (0-15)
   */
  getWaterCompatibilityScore(waterReq, waterSource) {
    const waterMap = {
      'Low': 1,
      'Low-Medium': 2,
      'Moderate': 3,
      'Moderate-High': 4,
      'High': 5,
      'Very High': 6
    };

    const sourceRating = {
      'Rainfall': { low: 15, medium: 12, high: 5 },
      'Well': { low: 12, medium: 15, high: 10 },
      'Borehole': { low: 12, medium: 15, high: 15 },
      'Irrigation': { low: 13, medium: 15, high: 15 }
    };

    const extractLevel = (req) => {
      if (req.includes('Very High')) return 'high';
      if (req.includes('High')) return 'high';
      if (req.includes('Moderate')) return 'medium';
      return 'low';
    };

    const level = extractLevel(waterReq);
    const ratings = sourceRating[waterSource] || sourceRating['Rainfall'];
    return ratings[level] || 10;
  }

  /**
   * Score budget feasibility (0-10)
   */
  getBudgetScore(inputs, budget) {
    // Very rough estimate: simple inputs ~1500-3000, moderate ~3000-6000, intensive ~6000+
    const estimatedCost = this.estimateInputCost(inputs);
    
    if (budget >= estimatedCost) {
      return 10; // Budget sufficient
    } else if (budget >= estimatedCost * 0.7) {
      return 7; // Marginal
    } else if (budget >= estimatedCost * 0.5) {
      return 4; // Tight budget
    } else {
      return 1; // Insufficient budget
    }
  }

  /**
   * Estimate input cost based on description
   */
  estimateInputCost(inputs) {
    const costMap = {
      'minimal': 1000,
      'low': 1500,
      'moderate': 3500,
      'intensive': 6000,
      'high': 8000
    };

    const lower = inputs.toLowerCase();
    if (lower.includes('fertilizer') && lower.includes('fungicide')) return 5000;
    if (lower.includes('fungicide') || lower.includes('intensive')) return 4500;
    if (lower.includes('manure') || lower.includes('mulch')) return 2500;
    if (lower.includes('minimal') || lower.includes('low')) return 1500;
    
    return 3000; // Default moderate cost
  }

  /**
   * Score farm size suitability (0-5)
   */
  getFarmSizeScore(cropName, farmSize) {
    // Different crops suit different farm sizes
    const suitability = {
      'Maize': { small: 4, medium: 5, large: 4 },
      'Beans': { small: 5, medium: 5, large: 4 },
      'Rice': { small: 3, medium: 5, large: 5 },
      'Sorghum': { small: 5, medium: 5, large: 4 },
      'Groundnuts': { small: 5, medium: 5, large: 4 },
      'Cassava': { small: 4, medium: 5, large: 5 },
      'Sweet Potatoes': { small: 5, medium: 5, large: 4 },
      'Tomatoes': { small: 5, medium: 4, large: 3 },
      'Soybean': { small: 4, medium: 5, large: 5 },
      'Kales': { small: 5, medium: 4, large: 3 }
    };

    const getSize = (ha) => {
      if (ha < 1) return 'small';
      if (ha < 3) return 'medium';
      return 'large';
    };

    const size = getSize(farmSize);
    const scores = suitability[cropName] || { small: 3, medium: 3, large: 3 };
    return scores[size] || 3;
  }

  /**
   * Get market price for a crop in a specific location
   */
  getMarketPrice(cropName, subCounty) {
    const priceData = this.marketPrices.find(p => p.crop === cropName);
    if (!priceData) return null;

    const key = subCounty.toLowerCase();
    return {
      crop: cropName,
      price: priceData[key] || 0,
      trend: priceData.trend,
      lastUpdated: priceData.lastUpdated
    };
  }

  /**
   * Get soil quality assessment for a location
   */
  getSoilAssessment(subCounty, soilType) {
    const soilData = this.soilData[subCounty.toLowerCase()]?.[soilType.toLowerCase()];
    if (!soilData) return null;

    return {
      location: subCounty,
      soilType: soilType,
      pH: soilData.pH,
      nitrogen: soilData.nitrogen,
      phosphorus: soilData.phosphorus,
      potassium: soilData.potassium,
      organicMatter: soilData.organicMatter,
      assessment: this.assessSoilQuality(soilData)
    };
  }

  /**
   * Assess soil quality based on chemical properties
   */
  assessSoilQuality(soilData) {
    const { pH, nitrogen, phosphorus, potassium, organicMatter } = soilData;
    let quality = 'Good';
    let issues = [];

    if (pH < 6 || pH > 7.5) {
      issues.push(`pH ${pH} (ideal 6.0-7.0) - adjust with lime or sulfur`);
    }
    if (nitrogen < 1.0) {
      issues.push('Low nitrogen - apply manure or fertilizer');
    }
    if (phosphorus < 10) {
      issues.push('Low phosphorus - apply Single Super Phosphate');
    }
    if (potassium < 100) {
      issues.push('Low potassium - apply K fertilizer');
    }
    if (organicMatter < 2.5) {
      issues.push('Low organic matter - add compost or manure');
    }

    if (issues.length > 2) quality = 'Poor';
    else if (issues.length > 0) quality = 'Fair';

    return { quality, issues };
  }

  /**
   * Get comprehensive farm analysis
   */
  analyzeFarm(farmerData) {
    const recommendations = this.getRecommendations(farmerData);
    const soilAssessment = this.getSoilAssessment(farmerData.subCounty, farmerData.soilType);
    const weather = this.weatherData[farmerData.subCounty.toLowerCase()]?.[farmerData.season.toLowerCase()];

    return {
      recommendations,
      soilAssessment,
      weather: {
        location: farmerData.subCounty,
        season: farmerData.season,
        ...weather
      },
      analysis: {
        budget: farmerData.budget,
        farmSize: farmerData.farmSize,
        waterSource: farmerData.waterSource,
        suggestions: this.generateSuggestions(farmerData, soilAssessment)
      }
    };
  }

  /**
   * Get farm input recommendations for a specific crop
   */
  getFarmInputRecommendations(cropName, farmSize = 1) {
    const cropInputs = this.cropInputs[cropName];
    if (!cropInputs) {
      return {
        error: `No input recommendations found for ${cropName}`,
        crop: cropName
      };
    }

    const totalInputCost = cropInputs.totalEstimatedCost * farmSize;

    return {
      crop: cropName,
      farmSize: farmSize,
      fertilizers: cropInputs.fertilizers,
      pesticides: cropInputs.pesticides,
      herbicides: cropInputs.herbicides || [],
      soilAmendments: cropInputs.soilAmendments || [],
      tools: cropInputs.tools || [],
      micronutrients: cropInputs.micronutrients || [],
      totalEstimatedCost: cropInputs.totalEstimatedCost,
      totalCostForFarmSize: Math.round(totalInputCost),
      summary: {
        message: `For a ${farmSize} hectare ${cropName} farm, you'll need:`,
        fertilizers: cropInputs.fertilizers.length,
        pesticides: cropInputs.pesticides.length,
        herbicides: (cropInputs.herbicides || []).length,
        soilAmendments: cropInputs.soilAmendments.length,
        tools: cropInputs.tools.length
      }
    };
  }

  /**
   * Get cost breakdown and budget-adjusted recommendations
   */
  getBudgetAdjustedInputs(cropName, budget, farmSize = 1) {
    const fullInputs = this.getFarmInputRecommendations(cropName, farmSize);
    if (fullInputs.error) return fullInputs;

    const requiredCost = fullInputs.totalCostForFarmSize;
    const budgetRatio = budget / requiredCost;

    // Categorize inputs by priority
    const prioritized = {
      essential: [],
      important: [],
      optional: []
    };

    // Fertilizers - always essential
    fullInputs.fertilizers.forEach((fert, idx) => {
      if (idx === 0) {
        prioritized.essential.push(fert); // Base fertilizer is essential
      } else if (idx === 1) {
        prioritized.important.push(fert);
      } else {
        prioritized.optional.push(fert);
      }
    });

    // Fungicides - important for disease prevention
    fullInputs.pesticides.forEach((pest, idx) => {
      if (idx === 0) {
        prioritized.important.push(pest);
      } else {
        prioritized.optional.push(pest);
      }
    });

    // Soil amendments - important
    (fullInputs.soilAmendments || []).forEach((amend, idx) => {
      if (idx === 0) {
        prioritized.important.push(amend);
      } else {
        prioritized.optional.push(amend);
      }
    });

    // Seeds - essential
    (fullInputs.tools || []).forEach((tool) => {
      if (tool.name.includes('Seed') || tool.name.includes('Cuttings') || tool.name.includes('Seedlings')) {
        prioritized.essential.push(tool);
      } else {
        prioritized.optional.push(tool);
      }
    });

    return {
      crop: cropName,
      farmSize,
      budget,
      budgetSufficiency: {
        required: requiredCost,
        available: budget,
        ratio: Math.round(budgetRatio * 100) + '%',
        status: budgetRatio >= 0.9 ? 'Sufficient' : budgetRatio >= 0.6 ? 'Tight' : 'Limited'
      },
      recommendations: {
        essential: prioritized.essential,
        important: prioritized.important,
        optional: prioritized.optional
      },
      costBreakdown: {
        fertilizers: Math.round(fullInputs.fertilizers.reduce((sum, f) => sum + (f.costPerUnit * (farmSize || 1) / 50), 0)),
        pesticides: Math.round(fullInputs.pesticides.reduce((sum, p) => sum + (p.costPerUnit * (farmSize || 1) / 50), 0)),
        soilAmendments: Math.round((fullInputs.soilAmendments || []).reduce((sum, s) => sum + (s.costPerUnit * (farmSize || 1)), 0)),
        tools: Math.round((fullInputs.tools || []).reduce((sum, t) => sum + (t.costPerUnit * (farmSize || 1)), 0))
      }
    };
  }

  /**
   * Get cost-saving recommendations
   */
  getCostSavingTips(budget, farmSize = 1) {
    const tips = [];

    // If budget is tight, recommend specific strategies
    if (budget < 5000 * farmSize) {
      tips.push({
        strategy: 'Group Buying',
        description: 'Join a farmer group and buy inputs together',
        potential_savings: '15-25%',
        contact: 'Visit your sub-county agricultural office'
      });
      tips.push({
        strategy: 'Use Farm Manure',
        description: 'Rely on farmyard manure instead of expensive synthetic fertilizers',
        potential_savings: '30-40%',
        requirement: '10-15 tons/ha available'
      });
    }

    // General tips
    tips.push({
      strategy: 'Organic Pest Control',
      description: 'Use neem oil, soap spray, or companion planting',
      potential_savings: '25-35%',
      benefit: 'Safer for family and environment'
    });

    tips.push({
      strategy: 'Mulching',
      description: 'Use farm waste as mulch instead of buying',
      potential_savings: '20-30%',
      benefit: 'Reduces watering and weeding needs'
    });

    tips.push({
      strategy: 'Seed Saving',
      description: 'Save seeds from good plants for next season',
      potential_savings: '15-25%',
      note: 'Works better for open-pollinated varieties'
    });

    return tips;
  }

  /**
   * Get essential tools checklist
   */
  getEssentialToolsChecklist() {
    return {
      tools: this.essentialTools,
      totalEstimatedCost: this.essentialTools.reduce((sum, tool) => sum + tool.cost, 0),
      message: 'These are basic tools every farmer should have. Buy gradually if budget is limited.',
      purchasePriority: [
        '1. Hand hoe (most important)',
        '2. Knapsack sprayer (for chemical application)',
        '3. Machete/Panga (for clearing)',
        '4. Watering can (for dry season)',
        '5. Measuring equipment (for accurate input application)'
      ]
    };
  }

  /**
   * Soil improvement recommendations based on soil assessment
   */
  getSoilImprovementPlan(subCounty, soilType, cropName) {
    const soilAssessment = this.getSoilAssessment(subCounty, soilType);
    const improvements = {
      subCounty,
      soilType,
      currentQuality: soilAssessment?.assessment?.quality || 'Unknown',
      issues: soilAssessment?.assessment?.issues || [],
      recommendedAmendments: [],
      estimatedCost: 0,
      timeline: '2-3 months before planting'
    };

    if (soilAssessment?.assessment?.issues?.length > 0) {
      const issues = soilAssessment.assessment.issues;

      if (issues.some(i => i.includes('pH'))) {
        if (issues[0].includes('Low')) {
          improvements.recommendedAmendments.push({
            amendment: 'Lime (CaCO3)',
            quantity: '2-3 tons/ha',
            cost: '2400-3600 KSh/ha'
          });
        } else {
          improvements.recommendedAmendments.push({
            amendment: 'Sulfur',
            quantity: '1-2 tons/ha',
            cost: '2000-4000 KSh/ha'
          });
        }
      }

      if (issues.some(i => i.includes('nitrogen'))) {
        improvements.recommendedAmendments.push({
          amendment: 'Farmyard manure or Compost',
          quantity: '10-15 tons/ha',
          cost: '5000-7500 KSh/ha'
        });
      }

      if (issues.some(i => i.includes('organic'))) {
        improvements.recommendedAmendments.push({
          amendment: 'Compost/Green manure',
          quantity: '8-12 tons/ha',
          cost: '4000-7200 KSh/ha'
        });
      }
    } else {
      improvements.message = 'Soil is in good condition. Maintain fertility by adding manure annually.';
    }

    return improvements;
  }

  /**
   * Generate actionable suggestions
   */
  generateSuggestions(farmerData, soilAssessment) {
    const suggestions = [];

    if (soilAssessment?.assessment?.issues?.length > 0) {
      suggestions.push({
        type: 'soil',
        priority: 'high',
        message: 'Address soil issues',
        actions: soilAssessment.assessment.issues
      });
    }

    if (farmerData.budget < 3000) {
      suggestions.push({
        type: 'budget',
        priority: 'medium',
        message: 'Your budget is limited. Focus on crops with low input requirements.',
        actions: ['Consider cassava, sorghum, or beans', 'Explore group buying for inputs']
      });
    }

    if (farmerData.farmSize < 1) {
      suggestions.push({
        type: 'farm-size',
        priority: 'medium',
        message: 'Your farm is small. Optimize with high-value crops.',
        actions: ['Grow tomatoes or leafy vegetables', 'Intercrop with legumes']
      });
    }

    suggestions.push({
      type: 'market',
      priority: 'low',
      message: 'Check current market prices before planting',
      actions: ['Contact local agricultural office', 'Check weekly market reports']
    });

    return suggestions;
  }
}

export default new RecommendationEngine();
