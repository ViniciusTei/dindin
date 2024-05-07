import { User } from "firebase/auth";
import app from "./firebase";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";

const db = getFirestore(app);

type Transaction = {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
};

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
      results.push({
        id: doc.id,
        ...doc.data(),
      } as Transaction);
    });

    return results;
  } catch (e) {
    console.error("Error reading document: ", e);
    throw e;
  }
}
