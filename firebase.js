const firebaseConfig = {
  apiKey: "AIzaSyDBfBls41KjIiWB37dxi3hmzLV7OwU1XTU",
  authDomain: "babi-jeff.firebaseapp.com",
  projectId: "babi-jeff",
  storageBucket: "babi-jeff.firebasestorage.app",
  messagingSenderId: "485864539305",
  appId: "1:485864539305:web:9f4c05347d598ae78f95b8"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();