import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { bookAppointment, getDoctorById, getBookedTimeSlots } from '../../../api/firebase/appointments';
import { useEffect } from 'react';

export default function DoctorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [doctor, setDoctor] = useState<any>(null);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (id) {
        const docData = await getDoctorById(id as string);
        if (docData) {
          setDoctor(docData);
          if (docData.availability) {
            const days = Object.keys(docData.availability);
            setAvailableDays(days);
            if (days.length > 0) {
              setSelectedDate(days[0]);
              setAvailableTimes(docData.availability[days[0]] || []);
              if (docData.availability[days[0]]?.length > 0) {
                setSelectedTime(docData.availability[days[0]][0]);
              }
            }
          }
        }
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (id && selectedDate) {
        const booked = await getBookedTimeSlots(id as string, selectedDate);
        setBookedTimes(booked);
      }
    };

    if (doctor && doctor.availability && selectedDate) {
      const times = doctor.availability[selectedDate] || [];
      setAvailableTimes(times);
      fetchBookedTimes();
      
      if (!times.includes(selectedTime) && times.length > 0) {
        setSelectedTime(times[0]);
      }
    }
  }, [selectedDate, doctor, id]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a valid date and time.");
      return;
    }
    if (bookedTimes.includes(selectedTime)) {
      alert("This time slot has already been booked. Please choose another one.");
      return;
    }
    setLoading(true);
    try {
      const doctorId = (id as string) || 'dummy_doctor_id';
      const doctorName = doctor ? doctor.name : 'Unknown Doctor';
      
      await bookAppointment(doctorId, doctorName, selectedDate, selectedTime);
      alert('Appointment booked successfully!');
      router.back();
    } catch (error: any) {
      alert('Error booking appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading doctor details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Blue Header Section */}
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="chevron-left" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.doctorProfileHeader}>
            {doctor.profileImageUrl ? (
              <Image source={{ uri: doctor.profileImageUrl }} style={styles.doctorImage} />
            ) : (
              <View style={styles.doctorImagePlaceholder}>
                <MaterialIcons name="person" size={40} color="#555" />
              </View>
            )}
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpec}>{doctor.specialty || 'General Practitioner'}</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Main Content Card (overlapping header) */}
      <View style={styles.mainContent}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.experience || '0'} <Text style={styles.statLabelSm}>yrs</Text></Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.patientsCount || '0'}</Text>
            <Text style={styles.statLabel}>Patient</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.rating?.toFixed(1) || '5.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text> 
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About doctor</Text>
            <Text style={styles.aboutText}>
              {doctor.about || 'No description available for this doctor.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {availableDays.map((day) => (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.dateItem, selectedDate === day && styles.dateItemActive]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text style={[styles.dateDay, selectedDate === day && styles.dateTextActive]}>{day}</Text>
                </TouchableOpacity>
              ))}
              {availableDays.length === 0 && (
                <Text style={{ color: '#6B7280' }}>No days available.</Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.timeGrid}>
              {availableTimes.map((time) => {
                const isBooked = bookedTimes.includes(time);
                return (
                  <TouchableOpacity 
                    key={time} 
                    style={[
                      styles.timeItem, 
                      selectedTime === time && !isBooked && styles.timeItemActive,
                      isBooked && styles.timeItemDisabled
                    ]}
                    onPress={() => !isBooked && setSelectedTime(time)}
                    disabled={isBooked}
                  >
                    <Text style={[
                      styles.timeText, 
                      selectedTime === time && !isBooked && styles.timeTextActive,
                      isBooked && styles.timeTextDisabled
                    ]}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
              {availableTimes.length === 0 && (
                <Text style={{ color: '#6B7280' }}>No times available.</Text>
              )}
            </View>
          </View>

        </ScrollView>
        
        {/* Bottom Button */}
        <View style={styles.bottomFooter}>
          <TouchableOpacity 
            style={[styles.confirmBtn, loading && { opacity: 0.7 }]} 
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm Schedule</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    backgroundColor: '#3B5998',
    paddingBottom: 80, // give space for overlapping card
  },
  headerTop: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -8,
  },
  doctorProfileHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  doctorImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  doctorImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doctorSpec: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'relative',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B5998',
    marginBottom: 4,
  },
  statLabelSm: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Space for footer
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateItem: {
    width: 65,
    height: 75,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  dateItemActive: {
    backgroundColor: '#3B5998',
    borderColor: '#3B5998',
  },
  dateDay: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateTextActive: {
    color: '#FFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeItem: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  timeItemActive: {
    borderColor: '#3B5998',
  },
  timeItemDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeTextActive: {
    color: '#3B5998',
  },
  timeTextDisabled: {
    color: '#D1D5DB',
    textDecorationLine: 'line-through',
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confirmBtn: {
    backgroundColor: '#3B5998',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
