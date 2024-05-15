import { User } from "firebase/auth";
import app from "./firebase";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import { Transaction, TransactionDoc } from "./types";

const db = getFirestore(app);

export default async function getTransactions(
  user: User,
): Promise<Transaction[]> {
  try {
    const docRef = collection(db, user.uid);

    const q = query(docRef);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    const results: Transaction[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as TransactionDoc;
      results.push({
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        created_at: data.created_at.toDate(),
        updated_at: data.updated_at.toDate(),
      } as Transaction);
    });

    return results;
  } catch (e) {
    console.error("Error reading document: ", e);
    throw e;
  }
}
