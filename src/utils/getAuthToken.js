export async function getAuthToken(user) {
  // 1. Try localStorage
  let token = localStorage.getItem('authToken');
  if (token) return token;

  // 2. Try user context
  if (user && user.token) return user.token;

  // 3. Try Firebase Auth
  if (window.firebase && window.firebase.auth) {
    const currentUser = window.firebase.auth().currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
  }

  // 4. No token found
  return null;
} 