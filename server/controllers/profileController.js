const firestoreService = require('../services/firestoreService');

// Get user profile (which includes business profile)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await firestoreService.getUserProfile(userId);
    
    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }
    
    res.json(userProfile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile.' });
  }
};

// Create or update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    
    const updatedProfile = await firestoreService.updateUserProfile(userId, profileData);
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}; 