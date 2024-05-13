import {
  Timestamp,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import app from "./firebase";
import { endOfMonth, startOfMonth } from "date-fns";

const db = getFirestore(app);

export default function getDataByMonth(uid: string, month: string) {
  const currentMonth = mesesMap[month.toLowerCase()];

  if (!currentMonth) {
    throw Promise.reject("Nome do mês inválido!");
  }

  const currentDate = new Date(new Date().getFullYear(), currentMonth - 1, 1);
  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);

  const coll = collection(db, uid);
  const w1 = where("date", ">=", Timestamp.fromDate(startMonth));
  const w2 = where("date", "<=", Timestamp.fromDate(endMonth));
  const q1 = query(coll, w1, w2);

  return getDocs(q1);
}

const mesesMap: { [key: string]: number } = {
  janeiro: 1,
  fevereiro: 2,
  março: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};
