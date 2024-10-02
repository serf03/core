import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5-pN2or9nYK-KdQkS8ct6RbVZT5EbE3Q",
    authDomain: "quickclear-56b83.firebaseapp.com",
    projectId: "quickclear-56b83",
    storageBucket: "quickclear-56b83.appspot.com",
    messagingSenderId: "725911095171",
    appId: "1:725911095171:web:7e795c5a731180000958b6"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);