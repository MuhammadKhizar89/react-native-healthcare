import React from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../api/firebase/config';
import { getPatientAppointments, Appointment } from '../../../api/firebase/appointments';

export default function HomeScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('Loading...');
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchDoctors = async () => {
        try {
          const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
          const querySnapshot = await getDocs(q);
          const docsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          if (isActive) setDoctors(docsList);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      };
      
      const fetchUserData = async () => {
        if (auth.currentUser) {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && isActive) {
            setUserName(docSnap.data().name);
          } else if (isActive) {
            setUserName('Patient');
          }
        }
      };

      const fetchUpcomingSchedule = async () => {
        try {
          const appointments = await getPatientAppointments();
          const upcoming = appointments.find(app => app.status === 'Upcoming');
          if (isActive) setUpcomingAppointment(upcoming || null);
        } catch (error) {
          console.error("Error fetching upcoming schedule", error);
        }
      };

      fetchDoctors();
      fetchUserData();
      fetchUpcomingSchedule();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Blue Header Area */}
        <View style={styles.headerBackground}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.profilePicPlaceholder}>
                  <MaterialIcons name="image" size={24} color="#555" />
                </View>
                <View>
                  <Text style={styles.welcomeText}>Welcome Back</Text>
                  <Text style={styles.userName}>{userName}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationBtn}>
                <MaterialIcons name="notifications" size={24} color={Colors.white} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>

          {/* Categories Grid */}
          <View style={styles.categoriesCard}>
            <View style={styles.categoryRow}>
              <CategoryItem icon="emergency" label="Emergency" />
              <CategoryItem icon="local-hospital" label="Hospital" />
              <CategoryItem icon="water-drop" label="Blood" />
              <CategoryItem icon="medication" label="Prescription" />
            </View>
            <View style={styles.categoryRow}>
              <CategoryItem icon="stethoscope" label="Doctor" active />
              <CategoryItem icon="monitor-heart" label="Check Up" />
              <CategoryItem icon="location-on" label="Location" />
              <CategoryItem icon="healing" label="Radiology" />
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Find doctor"
              placeholderTextColor="#9CA3AF"
            />
            <MaterialIcons name="search" size={24} color="#4B5563" />
          </View>

          {/* Schedule Today */}
          {upcomingAppointment ? (
            <>
              <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
              <TouchableOpacity style={styles.scheduleCard} onPress={() => router.push('/patient/(tabs)/schedule' as any)}>
                <View style={styles.scheduleImagePlaceholder}>
                  <MaterialIcons name="image" size={32} color="#555" />
                </View>
                <View style={styles.scheduleInfo}>
                  <View style={styles.scheduleHospital}>
                    <MaterialIcons name="location-on" size={14} color="#3B82F6" />
                    <Text style={styles.hospitalText}>Clinic</Text>
                  </View>
                  <Text style={styles.doctorName}>{upcomingAppointment.doctorName || 'Unknown Doctor'}</Text>
                  <Text style={styles.specialtyText}>Doctor</Text>
                </View>
                <View style={styles.scheduleTimeInfo}>
                  <Text style={styles.dateText}>{upcomingAppointment.date}</Text>
                  <Text style={styles.timeText}>{upcomingAppointment.time}</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
              <View style={[styles.scheduleCard, { justifyContent: 'center', paddingVertical: 30 }]}>
                <Text style={{ color: '#6B7280' }}>No upcoming appointments</Text>
              </View>
            </>
          )}

          {/* Doctor's Recommendation */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Doctor's recommendation</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreBtn}>See more</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationList}>
            {doctors.map(doctor => (
              <DoctorRecommendationCard 
                key={doctor.id} 
                id={doctor.id} 
                name={doctor.name || 'Unknown Doctor'} 
                spec={doctor.specialty || 'General Practitioner'} 
              />
            ))}
            {doctors.length === 0 && (
              <Text style={{ color: '#6B7280', marginTop: 20 }}>No doctors available right now.</Text>
            )}
          </ScrollView>

        </View>
      </ScrollView>
    </View>
  );
}

// Subcomponents
function CategoryItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <View style={styles.categoryItem}>
      <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
        <MaterialIcons name={icon} size={28} color={active ? '#FFF' : '#6B7280'} />
      </View>
      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{label}</Text>
    </View>
  );
}

function DoctorRecommendationCard({ id, name, spec }: { id: string, name: string, spec: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push(`/patient/doctor/${id}` as any)} style={styles.recommendationCard}>
      <View style={styles.recImagePlaceholder}>
        <MaterialIcons name="image" size={32} color="#555" />
      </View>
      <Text style={styles.recName}>{name}</Text>
      <Text style={styles.recSpec}>{spec}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // From Colors
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    backgroundColor: '#3B5998',
    paddingBottom: 60, // Space for overlapping card
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20, // Add top padding for safer area
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  welcomeText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#3B5998',
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: -40, // Pull up to overlap header
  },
  categoriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: '22%',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapperActive: {
    backgroundColor: '#3B5998',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#3B5998',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  seeMoreBtn: {
    color: '#3B5998',
    fontSize: 14,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  scheduleImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleHospital: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  hospitalText: {
    fontSize: 10,
    color: '#3B82F6',
    marginLeft: 2,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  specialtyText: {
    fontSize: 12,
    color: '#6B7280',
  },
  scheduleTimeInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  recommendationList: {
    flexDirection: 'row',
  },
  recommendationCard: {
    marginRight: 16,
    width: 120,
  },
  recImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#D1D5DB', // darker gray for doctors
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  recSpec: {
    fontSize: 12,
    color: '#6B7280',
  },
});
