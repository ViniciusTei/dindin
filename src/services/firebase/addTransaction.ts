import { User } from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import app from "./firebase";
import { CreateTransaction as Transaction } from "./types";

const db = getFirestore(app);

export default async function addTransaction(
  user: User,
  transaction: Transaction,
) {
  try {
    const docRef = await addDoc(collection(db, user.uid), {
      ...transaction,
      date: Timestamp.fromDate(transaction.date),
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
