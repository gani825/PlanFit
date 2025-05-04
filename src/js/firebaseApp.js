// // firebaseApp.js
// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";
// import { getAuth } from "firebase/auth";
//
// // Firebase 설정
// const firebaseConfig = {
//     apiKey: "AIzaSyAGgh5o6BmT4cgiERFxy076Qg2dTAlGP6k",
//     authDomain: "js-sample-35bc7.firebaseapp.com",
//     databaseURL: "https://js-sample-35bc7-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "js-sample-35bc7",
//     storageBucket: "js-sample-35bc7.firebasestorage.app",
//     messagingSenderId: "183351474686",
//     appId: "1:183351474686:web:c3c376100359c0282fe8af"
// };
//
// // Firebase 초기화
// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);
// const auth = getAuth(app);  // getAuth에 app 객체 전달
//
// // named export로 db와 auth 제공
// export { db, auth };


// firebaseApp.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyAGgh5o6BmT4cgiERFxy076Qg2dTAlGP6k",
    authDomain: "js-sample-35bc7.firebaseapp.com",
    databaseURL: "https://js-sample-35bc7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "js-sample-35bc7",
    storageBucket: "js-sample-35bc7.firebasestorage.app",
    messagingSenderId: "183351474686",
    appId: "1:183351474686:web:c3c376100359c0282fe8af"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);  // getAuth에 app 객체 전달

// named export로 db와 auth 제공
export { db, auth };


