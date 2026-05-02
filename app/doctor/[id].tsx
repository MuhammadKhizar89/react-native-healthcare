import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const dates = [
  { day: 'Mon', date: '03' },
  { day: 'Tue', date: '04' },
  { day: 'Wed', date: '05' },
  { day: 'Thu', date: '06' },
  { day: 'Fri', date: '07' },
  { day: 'Sat', date: '08' },
];

const times = [
  '09:00 am', '10:00 am', '11:00 am', '12:00 am',
  '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm'
];

export default function DoctorDetailScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('07');
  const [selectedTime, setSelectedTime] = useState('09:00 am');

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
            <View style={styles.doctorImagePlaceholder}>
              <MaterialIcons name="image" size={40} color="#555" />
            </View>
            <Text style={styles.doctorName}>drg. Claire anjani Sp.Pros</Text>
            <Text style={styles.doctorSpec}>Dentistry specialist</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Main Content Card (overlapping header) */}
      <View style={styles.mainContent}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>20 <Text style={styles.statLabelSm}>yrs</Text></Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1000</Text>
            <Text style={styles.statLabel}>Patient</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5.0</Text>
            <Text style={styles.statLabel}>Experience</Text> 
            {/* Note: Screenshot says "Experience" here too, but normally it's Rating */}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About doctor</Text>
            <Text style={styles.aboutText}>
              Focusing on dealing with the problem of replacing missing teeth. Such as the manufacture of fixed dentures in the form of crowns and bridges as well...
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((item) => (
                <TouchableOpacity 
                  key={item.date} 
                  style={[styles.dateItem, selectedDate === item.date && styles.dateItemActive]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text style={[styles.dateDay, selectedDate === item.date && styles.dateTextActive]}>{item.day}</Text>
                  <Text style={[styles.dateNum, selectedDate === item.date && styles.dateTextActive]}>{item.date}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.timeGrid}>
              {times.map((time) => (
                <TouchableOpacity 
                  key={time} 
                  style={[styles.timeItem, selectedTime === time && styles.timeItemActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>
        
        {/* Bottom Button */}
        <View style={styles.bottomFooter}>
          <TouchableOpacity style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>Confirm Schedule</Text>
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
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeTextActive: {
    color: '#3B5998',
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
