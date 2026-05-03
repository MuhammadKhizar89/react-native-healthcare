import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./config";

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  createdAt: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const formatDateYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const normalizeDateInput = (input: any): string => {
  if (!input) return "";
  if (typeof input === "string") {
    // already YYYY-MM-DD?
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    // try parsing other string forms
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) return formatDateYMD(parsed);
    return input;
  }
  if (input.toDate) {
    // Firestore Timestamp
    return formatDateYMD(input.toDate());
  }
  if (input instanceof Date) return formatDateYMD(input);
  return String(input);
};

const normalizeTime = (t: any): string => {
  if (!t) return "";
  if (typeof t === "string") {
    const m = t.match(/(\d{1,2}):(\d{2})/);
    if (m) return `${pad(parseInt(m[1], 10))}:${pad(parseInt(m[2], 10))}`;
    return t;
  }
  return String(t);
};

export const bookAppointment = async (
  doctorId: string,
  doctorName: string,
  date: string,
  time: string,
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  // Get patient name
  const patientDoc = await getDoc(doc(db, "users", currentUser.uid));
  const patientName = patientDoc.exists()
    ? patientDoc.data().name
    : "Unknown Patient";

  const appointmentData: Appointment = {
    patientId: currentUser.uid,
    patientName,
    doctorId,
    doctorName,
    date,
    time,
    status: "Upcoming",
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, "appointments"), appointmentData);
  return { ...appointmentData, id: docRef.id };
};

export const getPatientAppointments = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const q = query(
    collection(db, "appointments"),
    where("patientId", "==", currentUser.uid),
  );

  const snapshot = await getDocs(q);
  const appointments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Appointment[];
  return appointments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const getDoctorAppointments = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const q = query(
    collection(db, "appointments"),
    where("doctorId", "==", currentUser.uid),
  );

  const snapshot = await getDocs(q);
  const appointments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Appointment[];
  return appointments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const getAllDoctors = async () => {
  const q = query(collection(db, "users"), where("role", "==", "doctor"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getDoctorById = async (doctorId: string) => {
  const docRef = doc(db, "users", doctorId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

export const getBookedTimeSlots = async (
  doctorId: string,
  date: string,
): Promise<string[]> => {
  const q = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctorId),
  );
  const snapshot = await getDocs(q);
  // Filter manually to avoid requiring a composite index in Firestore
  const normDate = normalizeDateInput(date);
  const bookedTimes = snapshot.docs
    .map((doc) => doc.data() as any)
    .map((data) => ({
      ...data,
      date: normalizeDateInput((data as any).date),
      time: normalizeTime((data as any).time),
    }))
    .filter((data) => data.date === normDate && data.status === "Upcoming")
    .map((data) => data.time);
  return bookedTimes;
};

// Generate available time slots for a doctor on a given date.
// Default clinic hours: 09:00 - 17:00, 30-minute slots. Returns times in 'HH:MM' 24h format.
export const getAvailableTimeSlots = async (
  doctorId: string,
  date: string,
  slotMinutes = 30,
  startTime = "09:00",
  endTime = "17:00",
): Promise<string[]> => {
  const normDate = normalizeDateInput(date);
  const booked = await getBookedTimeSlots(doctorId, normDate);

  // helper to parse HH:MM into minutes since midnight
  const toMins = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map((s) => parseInt(s, 10));
    return h * 60 + m;
  };

  const toHHMM = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}`;
  };

  const startM = toMins(startTime);
  const endM = toMins(endTime);
  const slots: string[] = [];

  for (let t = startM; t + slotMinutes <= endM; t += slotMinutes) {
    slots.push(toHHMM(t));
  }

  // filter out booked
  let available = slots.filter((s) => !booked.includes(s));

  // remove past times if date is today (compare normalized YMD)
  const today = new Date();
  const todayStr = formatDateYMD(today);
  const isToday = normDate === todayStr;
  if (isToday) {
    const nowMins = today.getHours() * 60 + today.getMinutes();
    available = available.filter((s) => toMins(s) > nowMins);
  }

  return available;
};

export const rescheduleAppointment = async (
  appointmentId: string,
  newDate: string,
  newTime: string,
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const docRef = doc(db, "appointments", appointmentId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Appointment not found");

  const data = snapshot.data() as Appointment;

  if (data.patientId !== currentUser.uid)
    throw new Error("Not authorized to modify this appointment");
  if (data.status === "Cancelled")
    throw new Error("Cannot reschedule a cancelled appointment");

  const now = new Date();
  const originalDateTime = new Date(`${data.date} ${data.time}`);
  if (originalDateTime.getTime() < now.getTime())
    throw new Error("Cannot reschedule past appointments");

  const proposedDateTime = new Date(`${newDate} ${newTime}`);
  if (isNaN(proposedDateTime.getTime())) throw new Error("Invalid date/time");
  if (proposedDateTime.getTime() <= now.getTime())
    throw new Error("New appointment must be in the future");

  // Check doctor's existing bookings for that date
  const booked = await getBookedTimeSlots(data.doctorId, newDate);
  // allow the same appointment to keep its time (i.e., when checking its own current slot)
  const currentSlot = data.time;
  if (booked.includes(newTime) && newTime !== currentSlot) {
    throw new Error("Selected time slot is already booked");
  }

  await updateDoc(docRef, {
    date: newDate,
    time: newTime,
    updatedAt: new Date().toISOString(),
  });

  return { ...data, date: newDate, time: newTime } as Appointment;
};

export const cancelAppointment = async (appointmentId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const docRef = doc(db, "appointments", appointmentId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Appointment not found");

  const data = snapshot.data() as Appointment;
  if (data.patientId !== currentUser.uid)
    throw new Error("Not authorized to modify this appointment");
  if (data.status === "Cancelled")
    throw new Error("Appointment already cancelled");

  const appointmentDateTime = new Date(`${data.date} ${data.time}`);
  const now = new Date();
  if (appointmentDateTime.getTime() < now.getTime())
    throw new Error("Cannot cancel past appointments");

  await updateDoc(docRef, {
    status: "Cancelled",
    updatedAt: new Date().toISOString(),
  });

  return { ...data, status: "Cancelled" } as Appointment;
};
