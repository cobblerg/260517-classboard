/* ============================================
   Store — Firebase Firestore 데이터베이스 연결
   ============================================ */
import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";

// ID 생성 유틸리티 (로컬 모드 호환성용)
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// 컬렉션 전체 가져오기
export async function getAll(collectionName) {
  try {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (error) {
    console.error("Firebase getAll 에러 (설정을 확인해주세요):", error);
    return [];
  }
}

// ID로 단일 항목 가져오기
export async function getById(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Firebase getById 에러:", error);
    return null;
  }
}

// 항목 추가
export async function add(collectionName, data) {
  try {
    const id = data.id || generateId();
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...data, id });
    return { ...data, id };
  } catch (error) {
    console.error("Firebase add 에러:", error);
    return null;
  }
}

// 항목 수정
export async function update(collectionName, id, data) {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    console.error("Firebase update 에러:", error);
    return null;
  }
}

// 항목 삭제
export async function remove(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Firebase remove 에러:", error);
    return false;
  }
}
