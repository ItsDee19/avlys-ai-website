const request = require('supertest');
const express = require('express');
const profileRoutes = require('../routes/profile');
const firestoreService = require('../services/firestoreService');
const { authenticateUser } = require('../middleware/auth');

// Mock the firestoreService
jest.mock('../services/firestoreService');
// Mock the authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateUser: jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id' }; // Simulate a logged-in user
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/profile', profileRoutes);

describe('Profile API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should return a user profile if it exists', async () => {
      const mockProfile = { id: 'test-user-id', name: 'Test User', email: 'test@example.com' };
      firestoreService.getUserProfile.mockResolvedValue(mockProfile);

      const res = await request(app).get('/api/profile');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProfile);
      expect(firestoreService.getUserProfile).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 404 if profile is not found', async () => {
      firestoreService.getUserProfile.mockResolvedValue(null);

      const res = await request(app).get('/api/profile');
      
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Profile not found.');
    });
  });

  describe('POST /api/profile', () => {
    it('should update a user profile and return it', async () => {
      const profileData = { name: 'Updated Name', business: { name: 'Test Business' } };
      const updatedProfile = { id: 'test-user-id', ...profileData };
      firestoreService.updateUserProfile.mockResolvedValue(updatedProfile);

      const res = await request(app)
        .post('/api/profile')
        .send(profileData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedProfile);
      expect(firestoreService.updateUserProfile).toHaveBeenCalledWith('test-user-id', profileData);
    });

    it('should return 500 if there is a server error', async () => {
        firestoreService.updateUserProfile.mockRejectedValue(new Error('Firestore error'));
  
        const res = await request(app)
          .post('/api/profile')
          .send({ name: 'Test' });
  
        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toEqual('Failed to update profile.');
      });
  });
}); 