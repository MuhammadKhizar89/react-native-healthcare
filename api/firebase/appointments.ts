import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './config';

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export const bookAppointment = async (
  doctorId: string, 
  doctorName: string, 
  date: string, 
  time: string
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  // Get patient name
  const patientDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const patientName = patientDoc.exists() ? patientDoc.data().name : 'Unknown Patient';

  const appointmentData: Appointment = {
    patientId: currentUser.uid,
    patientName,
    doctorId,
    doctorName,
    date,
    time,
    status: 'Upcoming',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
  return { ...appointmentData, id: docRef.id };
};

export const getPatientAppointments = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const q = query(
    collection(db, 'appointments'), 
    where('patientId', '==', currentUser.uid)
  );

  const snapshot = await getDocs(q);
  const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
  return appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getDoctorAppointments = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const q = query(
    collection(db, 'appointments'), 
    where('doctorId', '==', currentUser.uid)
  );

  const snapshot = await getDocs(q);
  const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
  return appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getAllDoctors = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDoctorById = async (doctorId: string) => {
  const docRef = doc(db, 'users', doctorId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

export const getBookedTimeSlots = async (doctorId: string, date: string): Promise<string[]> => {
  const q = query(
    collection(db, 'appointments'),
    where('doctorId', '==', doctorId)
  );
  const snapshot = await getDocs(q);
  // Filter manually to avoid requiring a composite index in Firestore
  const bookedTimes = snapshot.docs
    .map(doc => doc.data())
    .filter(data => data.date === date && data.status === 'Upcoming')
    .map(data => data.time);
  return bookedTimes;
};
