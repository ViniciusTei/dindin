import { User } from "firebase/auth";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import app from "./firebase";
import { CreateTransaction as Transaction } from "./types";

const db = getFirestore(app);

export default async function addTransaction(
  user: User,
  transaction: Transaction,
) {
  try {
    const currentDate = new Date();
    const docRef = await addDoc(collection(db, user.uid), {
      ...transaction,
      date: transaction.date.toISOString(),
      created_at: currentDate.toISOString(),
      updated_at: currentDate.toISOString(),
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
