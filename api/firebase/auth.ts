import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const signUpPatient = async (
  email: string, 
  password: string, 
  name: string,
  phone?: string,
  bloodType?: string,
  dob?: string
) => {
  try {
    // Set local storage first to prevent race conditions with onAuthStateChanged
    await AsyncStorage.setItem('role', 'patient');
    await AsyncStorage.setItem('isAuthenticated', 'yes');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create patient profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      role: 'patient',
      name,
      email,
      phone: phone || '',
      bloodType: bloodType || '',
      dob: dob || '',
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const signUpDoctor = async (
  email: string, 
  password: string, 
  name: string, 
  availability: Record<string, string[]>,
  specialty?: string,
  experience?: string,
  hospital?: string,
  about?: string,
  bloodType?: string,
  dob?: string
) => {
  try {
    // Set local storage first to prevent race conditions with onAuthStateChanged
    await AsyncStorage.setItem('role', 'doctor');
    await AsyncStorage.setItem('isAuthenticated', 'yes');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create doctor profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      role: 'doctor',
      name,
      email,
      availability,
      specialty: specialty || 'General Practitioner',
      experience: experience || '0',
      hospital: hospital || 'Clinic',
      about: about || '',
      bloodType: bloodType || '',
      dob: dob || '',
      patientsCount: 0,
      rating: 5.0,
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user role
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      await AsyncStorage.setItem('role', userData.role);
      await AsyncStorage.setItem('isAuthenticated', 'yes');
      return { user, role: userData.role };
    } else {
      throw new Error("User profile not found");
    }
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('isAuthenticated');
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
