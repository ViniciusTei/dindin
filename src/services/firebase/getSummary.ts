import { User } from "firebase/auth";
import app from "./firebase";
import {
  collection,
  getAggregateFromServer,
  getFirestore,
  query,
  sum,
  where,
} from "firebase/firestore";

const db = getFirestore(app);

type Summary = {
  balance: number;
  expense: number;
  income: number;
};

export default async function getSummary(user: User): Promise<Summary> {
  try {
    const coll = collection(db, user.uid);
    const queryExpenses = query(coll, where("type", "==", "expense"));
    const queryIncome = query(coll, where("type", "==", "income"));
    const expensesSnap = await getAggregateFromServer(queryExpenses, {
      total: sum("amount"),
    });
    const incomeSnap = await getAggregateFromServer(queryIncome, {
      total: sum("amount"),
    });

    return {
      balance: incomeSnap.data().total - expensesSnap.data().total,
      expense: expensesSnap.data().total,
      income: incomeSnap.data().total,
    };
  } catch (e) {
    console.error("Error reading document: ", e);
    throw e;
  }
}
