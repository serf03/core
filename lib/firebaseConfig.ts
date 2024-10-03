import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtnqnaUmpbzXCZw_v-fC1qNj9qqQ6vDMQ",
    authDomain: "lavanderia-619c8.firebaseapp.com",
    projectId: "lavanderia-619c8",
    storageBucket: "lavanderia-619c8.appspot.com",
    messagingSenderId: "922087279639",
    appId: "1:922087279639:web:f07f3f4991b4b5cf876052"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);