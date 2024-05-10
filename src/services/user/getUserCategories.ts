import { collection, doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

export default async function getUserCategories(
  uid: string,
): Promise<string[]> {
  const coll = collection(db, "users");
  const query = doc(coll, uid);
  const docSnap = await getDoc(query);

  if (docSnap.exists()) {
    const categories = docSnap.get("categories");

    if (categories?.length) {
      return categories;
    }

    return [];
  } else {
    throw new Error(`Documento com id ${uid} não existe.`);
  }
}
