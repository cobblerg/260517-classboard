import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: 선생님의 실제 파이어베이스 프로젝트 설정값으로 바꿔주세요!
const firebaseConfig = {
  apiKey: "AIzaSyBRJ2Y-es5fD4P_2Zd8MM9cnoxGW-cJFd8",
  authDomain: "classboard-51c31.firebaseapp.com",
  projectId: "classboard-51c31",
  storageBucket: "classboard-51c31.firebasestorage.app",
  messagingSenderId: "372935462831",
  appId: "1:372935462831:web:60e388665b9b4ba046a95a"
};

// Next.js 환경에서 Firebase 중복 초기화를 방지하는 코드입니다.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
