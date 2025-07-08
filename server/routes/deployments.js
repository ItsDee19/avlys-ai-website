const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const firestoreService = require('../services/firestoreService');
const socialDeploymentService = require('../services/socialDeploymentService');

// GET /api/deployments/status
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const deployments = await firestoreService.getDeploymentsByUser(userId);
    res.json({ status: 'success', deployments });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/deployments/history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await firestoreService.getDeploymentHistoryByUser(userId);
    res.json({ status: 'success', history });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/deployments
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const deploymentData = { ...req.body, userId };
    const deployment = await firestoreService.createDeployment(deploymentData);
    res.status(201).json({ status: 'success', deployment });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /api/deployments/:id
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const deploymentId = req.params.id;
    const updateData = req.body;
    const updated = await firestoreService.updateDeployment(deploymentId, updateData);
    res.json({ status: 'success', deployment: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/deployments/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const deploymentId = req.params.id;
    const result = await firestoreService.deleteDeployment(deploymentId);
    res.json({ status: 'success', result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/deployments/schedule
router.post('/schedule', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { campaignIds = [], platforms = [] } = req.body;
    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No campaigns selected' });
    }
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No platforms selected' });
    }
    const deployments = [];
    const user = req.user;
    for (const campaignId of campaignIds) {
      const campaign = await firestoreService.getCampaignById(campaignId);
      for (const platform of platforms) {
        const deploymentData = {
          userId,
          campaignId,
          platform,
          status: 'scheduled',
          createdAt: new Date(),
        };
        const deployment = await firestoreService.createDeployment(deploymentData);
        deployments.push(deployment);
        // Call the deployment agent (stub)
        await socialDeploymentService.deployToPlatform({ platform, campaign, user });
      }
    }
    res.status(201).json({ status: 'success', deployments });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router; 