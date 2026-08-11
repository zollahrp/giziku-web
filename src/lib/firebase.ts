// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQvYqPmtyI6767r8hDMO7p89wrT2UZYIs",
  authDomain: "giziku-19ded.firebaseapp.com",
  projectId: "giziku-19ded",
  storageBucket: "giziku-19ded.firebasestorage.app",
  messagingSenderId: "840411135689",
  appId: "1:840411135689:web:efea17d39c17e112d31718",
  measurementId: "G-9DRG03SC30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);