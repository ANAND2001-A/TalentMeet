// userService.js
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Store full name
export const saveUserName = async (fullName) => {
  try {
    const docRef = await addDoc(collection(db, "interviewersProfile"), { fullName });
    return docRef.id;
  } catch (error) {
    console.error("Error saving name:", error);
    throw error;
  }
};

// Fetch all names
export const fetchUserNames = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "interviewersProfile"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching names:", error);
    return [];
  }
};
