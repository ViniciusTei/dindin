import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

export default async function addUserCategories(
  uid: string,
  categories: string[],
) {
  const userRef = doc(db, "users", uid);

  // Set the "capital" field of the city 'DC'
  await updateDoc(userRef, {
    categories,
  });
}
