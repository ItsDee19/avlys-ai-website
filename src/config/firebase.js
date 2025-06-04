import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDCez0bElFU0VCos7FQGrQEW-_uNzTwspI",
    authDomain: "avlys-ai-3e461.firebaseapp.com",
    projectId: "avlys-ai-3e461",
    storageBucket: "avlys-ai-3e461.firebasestorage.app",
    messagingSenderId: "26043304424",
    appId: "1:26043304424:web:34b9244e6a9d8214607c5d",
    measurementId: "G-S0X6V07L23"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);