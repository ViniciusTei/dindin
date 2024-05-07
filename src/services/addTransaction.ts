import { User } from "firebase/auth";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

type Transaction = {
  type: "income" | "expense";
  description: string;
  amount: number;
  date: Date;
};

export default async function addTransaction(
  user: User,
  transaction: Transaction,
) {
  try {
    const docRef = await addDoc(collection(db, user.uid), {
      ...transaction,
      date: transaction.date.toISOString(),
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
