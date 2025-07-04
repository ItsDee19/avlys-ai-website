const request = require('supertest');
const express = require('express');
const campaignRoutes = require('../routes/campaigns');
const firestoreService = require('../services/firestoreService');

// Mock the firestoreService and auth middleware
jest.mock('../services/firestoreService');
jest.mock('../middleware/auth', () => ({
  authenticateUser: jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/campaigns', campaignRoutes);

describe('Campaigns API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/campaigns/:id', () => {
    it('should return a campaign if it belongs to the user', async () => {
      const mockCampaign = { id: 'campaign-1', name: 'Test Campaign', userId: 'test-user-id' };
      firestoreService.getCampaignById.mockResolvedValue(mockCampaign);

      const res = await request(app).get('/api/campaigns/campaign-1');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockCampaign);
    });

    it('should return 403 if campaign belongs to another user', async () => {
        const mockCampaign = { id: 'campaign-1', name: 'Test Campaign', userId: 'another-user-id' };
        firestoreService.getCampaignById.mockResolvedValue(mockCampaign);
  
        const res = await request(app).get('/api/campaigns/campaign-1');
        
        expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /api/campaigns/:id', () => {
    it('should update a campaign and return it', async () => {
        const originalCampaign = { id: 'campaign-1', name: 'Old Name', userId: 'test-user-id' };
        const updatedData = { name: 'New Name' };
        const updatedCampaign = { ...originalCampaign, ...updatedData };
  
        firestoreService.getCampaignById.mockResolvedValue(originalCampaign);
        firestoreService.updateCampaign.mockResolvedValue(updatedCampaign);
  
        const res = await request(app)
          .put('/api/campaigns/campaign-1')
          .send(updatedData);
  
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(updatedCampaign);
      });
  });

  describe('DELETE /api/campaigns/:id', () => {
    it('should delete a campaign and return 204', async () => {
        const mockCampaign = { id: 'campaign-1', name: 'Test Campaign', userId: 'test-user-id' };
  
        firestoreService.getCampaignById.mockResolvedValue(mockCampaign);
        firestoreService.deleteCampaign.mockResolvedValue();
  
        const res = await request(app).delete('/api/campaigns/campaign-1');
  
        expect(res.statusCode).toEqual(204);
      });
  });

}); 