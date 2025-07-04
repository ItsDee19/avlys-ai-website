import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Example: Real-time campaign updates
export const subscribeToCampaigns = (userId, callback) => {
  const q = query(
    collection(db, 'campaigns'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(campaigns);
  });
};

// Example: Add campaign
export const addCampaign = async (campaignData) => {
  try {
    const docRef = await addDoc(collection(db, 'campaigns'), {
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding campaign:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch a profile.");
  }
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such document!");
      return null; // Or throw an error, depending on desired behavior
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const addNewsletterEmail = async (email) => {
  if (!email) throw new Error('Email is required');
  try {
    const docRef = await addDoc(collection(db, 'newsletter'), {
      email,
      subscribedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding newsletter email:', error);
    throw error;
  }
};

/**
 * Ensures a user document exists in Firestore for the given user.
 * If not present, creates it with uid, email, and createdAt.
 */
export const ensureUserDocument = async (user) => {
  if (!user || !user.uid || !user.email) throw new Error('User object with uid and email required');
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp()
    });
    return true; // Created
  }
  return false; // Already existed
};

/**
 * Add a campaign under users/{uid}/campaigns subcollection.
 * @param {string} uid - User ID
 * @param {object} campaignData - Campaign data
 */
export const addUserCampaign = async (uid, campaignData) => {
  if (!uid) throw new Error('User ID required');
  try {
    const campaignsCol = collection(db, 'users', uid, 'campaigns');
    const docRef = await addDoc(campaignsCol, {
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding user campaign:', error);
    throw error;
  }
};

/**
 * Subscribe to campaigns under users/{uid}/campaigns subcollection.
 * @param {string} uid - User ID
 * @param {function} callback - Callback to receive campaign list
 * @returns {function} Unsubscribe function
 */
export const subscribeToUserCampaigns = (uid, callback) => {
  if (!uid) throw new Error('User ID required');
  const q = query(
    collection(db, 'users', uid, 'campaigns'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(campaigns);
  });
};

export const updateCampaign = async (campaignId, updateData) => {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, {
      ...updateData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId) => {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    await deleteDoc(campaignRef);
    return true;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};

export const deleteUserCampaign = async (uid, campaignId) => {
  try {
    const campaignRef = doc(db, 'users', uid, 'campaigns', campaignId);
    await deleteDoc(campaignRef);
    return true;
  } catch (error) {
    console.error('Error deleting user campaign:', error);
    throw error;
  }
};