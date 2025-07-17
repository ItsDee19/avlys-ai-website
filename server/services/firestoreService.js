const { db, firebaseInitialized } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class FirestoreService {
  constructor() {
    this.isAvailable = firebaseInitialized;
    if (!this.isAvailable) {
      console.warn('⚠️  Firestore service is not available - Firebase not initialized');
    }
  }

  // Helper method to check if Firestore is available
  checkAvailability() {
    if (!this.isAvailable) {
      throw new Error('Firestore is not available. Please check Firebase configuration.');
    }
  }

  // User operations
  async createUser(userData) {
    try {
      this.checkAvailability();
      
      const { username, email, password, firebaseUid } = userData;
      
      // Validation
      if (!username || !email) {
        throw new Error('Missing required fields');
      }
      
      // For traditional users, password is required
      if (!firebaseUid && !password) {
        throw new Error('Password is required for non-Firebase users');
      }
      
      if (password && password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Hash password only if provided (not for Firebase users)
      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }
      
      const userDoc = {
        username,
        email: email.toLowerCase(),
        ...(hashedPassword && { password: hashedPassword }),
        ...(firebaseUid && { firebaseUid }),
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: '',
          lastName: '',
          company: '',
          phone: ''
        },
        settings: {
          notifications: true,
          timezone: 'UTC',
          currency: 'USD'
        },
        subscription: {
          plan: 'free',
          status: 'active',
          expiresAt: null
        }
      };
      
      const docRef = await db.collection('users').add(userDoc);
      return { id: docRef.id, ...userDoc };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  async getUserByEmail(email) {
    try {
      this.checkAvailability();
      
      const snapshot = await db.collection('users').where('email', '==', email).get();
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }
  
  async getUserById(id) {
    try {
      this.checkAvailability();
      
      const doc = await db.collection('users').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
  
  async getUserByFirebaseId(firebaseUserId) {
    const snapshot = await db.collection('users')
      .where('firebaseUserId', '==', firebaseUserId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  async createUserFromFirebase(firebaseUserId) {
    // Create a placeholder user for Firebase Auth users
    const userDoc = {
      firebaseUserId,
      username: `user_${firebaseUserId.substring(0, 8)}`,
      email: '', // Will be updated when user provides it
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        firstName: '',
        lastName: '',
        company: '',
        phone: ''
      },
      settings: {
        notifications: true,
        timezone: 'UTC',
        currency: 'USD'
      },
      subscription: {
        plan: 'free',
        status: 'active',
        expiresAt: null
      }
    };
    
    const docRef = await db.collection('users').add(userDoc);
    return { id: docRef.id, ...userDoc };
  }
  
  async updateUser(userId, updateData) {
    try {
      this.checkAvailability();
      
      await db.collection('users').doc(userId).update({
        ...updateData,
        updatedAt: new Date()
      });
      return this.getUserById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Campaign operations
  async createCampaign(campaignData) {
    try {
      this.checkAvailability();
      
      const requiredFields = ['name', 'userId'];
      for (const field of requiredFields) {
        if (!campaignData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      const campaignDoc = {
        ...campaignData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: campaignData.status || 'draft',
        analytics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          roas: 0
        },
        targetAudience: campaignData.targetAudience || {},
        platforms: campaignData.platforms || [],
        strategy: campaignData.strategy || {}
      };
      
      const docRef = await db.collection('campaigns').add(campaignDoc);
      return { id: docRef.id, ...campaignDoc };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }
  
  async getCampaignsByUser(userId) {
    try {
      this.checkAvailability();
      const campaignsRef = db.collection('campaigns');
      const snapshot = await campaignsRef.where('userId', '==', userId).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      const campaigns = [];
      snapshot.forEach(doc => {
        campaigns.push({ id: doc.id, ...doc.data() });
      });
      
      return campaigns;
    } catch (error) {
      console.error('Error getting campaigns by user:', error);
      throw error;
    }
  }
  
  async updateCampaign(campaignId, campaignData) {
    try {
        this.checkAvailability();
        const campaignRef = db.collection('campaigns').doc(campaignId);
        await campaignRef.update({ ...campaignData, updatedAt: new Date() });
        return { id: campaignId, ...campaignData };
    } catch (error) {
        console.error('Error updating campaign:', error);
        throw error;
    }
  }
  
  async getCampaignById(campaignId) {
    try {
      this.checkAvailability();
      
      const doc = await db.collection('campaigns').doc(campaignId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  }
  
  async deleteCampaign(campaignId) {
    try {
        this.checkAvailability();
        const campaignRef = db.collection('campaigns').doc(campaignId);
        await campaignRef.delete();
    } catch (error) {
        console.error('Error deleting campaign:', error);
        throw error;
    }
  }
  
  // Contact operations
  async createContact(contactData) {
    try {
      this.checkAvailability();
      
      const requiredFields = ['name', 'email', 'subject', 'message'];
      for (const field of requiredFields) {
        if (!contactData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      const contactDoc = {
        ...contactData,
        status: 'new',
        createdAt: new Date()
      };
      
      const docRef = await db.collection('contacts').add(contactDoc);
      return { id: docRef.id, ...contactDoc };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }
  
  // Newsletter operations
  async addNewsletterSubscriber(email) {
    try {
      this.checkAvailability();
      
      if (!email) {
        throw new Error('Email is required');
      }
      
      // Check if already subscribed
      const existing = await this.checkNewsletterSubscriber(email);
      if (existing) {
        throw new Error('Email already subscribed');
      }
      
      const subscriberDoc = {
        email: email.toLowerCase(),
        status: 'active',
        subscribedAt: new Date(),
        unsubscribedAt: null
      };
      
      const docRef = await db.collection('newsletter').add(subscriberDoc);
      return { id: docRef.id, ...subscriberDoc };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }
  
  async checkNewsletterSubscriber(email) {
    const snapshot = await db.collection('newsletter')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }
  
  // Analytics operations
  async createCampaignAnalytics(analyticsData) {
    const { campaignId, userId, platform, date, metrics } = analyticsData;
    
    const analyticsDoc = {
      campaignId,
      userId,
      platform,
      date: new Date(date),
      metrics,
      createdAt: new Date()
    };
    
    const docRef = await db.collection('campaign_analytics').add(analyticsDoc);
    return { id: docRef.id, ...analyticsDoc };
  }
  
  async getCampaignAnalytics(campaignId, startDate, endDate) {
    let query = db.collection('campaign_analytics')
      .where('campaignId', '==', campaignId);
    
    if (startDate && endDate) {
      query = query.where('date', '>=', new Date(startDate))
                   .where('date', '<=', new Date(endDate));
    }
    
    const snapshot = await query.orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // Payment operations
  async createPayment(paymentData) {
    const { userId, campaignId, amount, currency, paymentMethod } = paymentData;
    
    const paymentDoc = {
      userId,
      campaignId,
      amount,
      currency,
      status: 'pending',
      paymentMethod,
      transactionId: null,
      createdAt: new Date()
    };
    
    const docRef = await db.collection('payments').add(paymentDoc);
    return { id: docRef.id, ...paymentDoc };
  }
  
  async updatePaymentStatus(paymentId, status, transactionId = null) {
    const updateData = { status };
    if (transactionId) updateData.transactionId = transactionId;
    
    await db.collection('payments').doc(paymentId).update(updateData);
    return this.getPaymentById(paymentId);
  }
  
  async getPaymentById(paymentId) {
    const doc = await db.collection('payments').doc(paymentId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
  
  // Utility methods
  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
  
  // Get campaign statistics
  async getCampaignStats(userId) {
    try {
      this.checkAvailability();
      
      const campaigns = await this.getCampaignsByUser(userId);
      
      const stats = {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        draft: campaigns.filter(c => c.status === 'draft').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        totalSpend: campaigns.reduce((sum, c) => sum + (c.analytics?.spend || 0), 0),
        totalConversions: campaigns.reduce((sum, c) => sum + (c.analytics?.conversions || 0), 0),
        avgROAS: campaigns.length > 0 ? 
          campaigns.reduce((sum, c) => sum + (c.analytics?.roas || 0), 0) / campaigns.length : 0
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw error;
    }
  }
  
  // Batch operations for efficiency
  async batchUpdateCampaigns(campaignUpdates) {
    const batch = db.batch();
    
    campaignUpdates.forEach(({ id, updates }) => {
      const ref = db.collection('campaigns').doc(id);
      batch.update(ref, { ...updates, updatedAt: new Date() });
    });
    
    await batch.commit();
  }
  
  // Cleanup old data (for maintenance)
  async cleanupOldData(daysOld = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const batch = db.batch();
    
    // Clean old analytics
    const oldAnalytics = await db.collection('campaign_analytics')
      .where('date', '<', cutoffDate)
      .get();
    
    oldAnalytics.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return oldAnalytics.size;
  }

  // Health check
  async healthCheck() {
    try {
      this.checkAvailability();
      
      // Try a simple read operation
      const snapshot = await db.collection('health').limit(1).get();
      
      return {
        status: 'healthy',
        timestamp: new Date(),
        collections: ['campaigns', 'users', 'contacts', 'newsletter', 'analytics']
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // User and Business Profile operations
  async getUserProfile(userId) {
    try {
      this.checkAvailability();
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();

      if (!doc.exists) {
        // If profile doesn't exist, create a default one
        const defaultProfile = {
          id: userId,
          createdAt: new Date(),
          // other default fields...
        };
        await userRef.set(defaultProfile);
        return defaultProfile;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      this.checkAvailability();
      const userRef = db.collection('users').doc(userId);
      
      const updateData = {
        ...profileData,
        updatedAt: new Date()
      };

      await userRef.set(updateData, { merge: true });
      return { id: userId, ...updateData };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Deployment operations
  async getDeploymentsByUser(userId) {
    this.checkAvailability();
    const deploymentsRef = db.collection('deployments');
    const snapshot = await deploymentsRef.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getDeploymentHistoryByUser(userId) {
    this.checkAvailability();
    const deploymentsRef = db.collection('deployments');
    const snapshot = await deploymentsRef.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];
    // For history, you might want to return all deployments or filter by status, etc.
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createDeployment(deploymentData) {
    this.checkAvailability();
    const deploymentDoc = {
      ...deploymentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await db.collection('deployments').add(deploymentDoc);
    return { id: docRef.id, ...deploymentDoc };
  }

  async updateDeployment(deploymentId, updateData) {
    this.checkAvailability();
    const deploymentRef = db.collection('deployments').doc(deploymentId);
    await deploymentRef.update({ ...updateData, updatedAt: new Date() });
    const updatedDoc = await deploymentRef.get();
    return { id: deploymentId, ...updatedDoc.data() };
  }

  async deleteDeployment(deploymentId) {
    this.checkAvailability();
    await db.collection('deployments').doc(deploymentId).delete();
    return { id: deploymentId, deleted: true };
  }

  /**
   * Update a campaign in the user's subcollection (users/{uid}/campaigns/{campaignId})
   * @param {string} userId - User ID
   * @param {string} campaignId - Campaign ID
   * @param {object} updateData - Data to update
   */
  async updateUserCampaign(userId, campaignId, updateData) {
    try {
      this.checkAvailability();
      const campaignRef = db.collection('users').doc(userId).collection('campaigns').doc(campaignId);
      await campaignRef.set({
        ...updateData,
        updatedAt: new Date()
      }, { merge: true });
      return (await campaignRef.get()).data();
    } catch (error) {
      console.error('Error updating user campaign:', error);
      throw error;
    }
  }
}

module.exports = new FirestoreService();