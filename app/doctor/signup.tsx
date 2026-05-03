import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUpDoctor } from '../../api/firebase/auth';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  '09:00 am', '10:00 am', '11:00 am', '12:00 pm',
  '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm'
];

export default function DoctorSignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      alert("Please fill all fields");
      return;
    }
    if (Object.keys(availability).length === 0) {
      alert("Please select at least one available day and time slot");
      return;
    }
    
    // Ensure at least one time slot is selected for selected days
    const hasEmptyDays = Object.values(availability).some(times => times.length === 0);
    if (hasEmptyDays) {
      alert("Please select at least one time slot for each selected day, or unselect the day.");
      return;
    }

    try {
      await signUpDoctor(email, password, name, availability);
      router.replace('/doctor/(tabs)/' as any);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const toggleDay = (day: string) => {
    setAvailability(prev => {
      const newAvail = { ...prev };
      if (newAvail[day]) {
        delete newAvail[day]; // Turn off
      } else {
        newAvail[day] = []; // Turn on, initially no times selected
      }
      return newAvail;
    });
  };

  const toggleTimeForDay = (day: string, time: string) => {
    setAvailability(prev => {
      const newAvail = { ...prev };
      const dayTimes = newAvail[day] || [];
      if (dayTimes.includes(time)) {
        newAvail[day] = dayTimes.filter(t => t !== time);
      } else {
        newAvail[day] = [...dayTimes, time];
      }
      return newAvail;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={32} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Doctor Registration</Text>
          <Text style={styles.subtitle}>Sign up to offer your services</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Dr. John Doe"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="doctor@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Set Custom Availability</Text>
          <Text style={styles.helperText}>Select the days and specific times you are available.</Text>
          
          <View style={styles.daysContainer}>
            {DAYS.map(day => {
              const isSelected = !!availability[day];
              return (
                <View key={day} style={styles.dayGroup}>
                  <TouchableOpacity 
                    style={[styles.dayItem, isSelected && styles.dayItemActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <MaterialIcons 
                      name={isSelected ? "check-circle" : "radio-button-unchecked"} 
                      size={20} 
                      color={isSelected ? "#FFF" : "#9CA3AF"} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.dayTextItem, isSelected && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>

                  {isSelected && (
                    <View style={styles.timeGrid}>
                      {TIME_SLOTS.map(time => {
                        const isTimeSelected = availability[day].includes(time);
                        return (
                          <TouchableOpacity 
                            key={time}
                            style={[styles.timeItem, isTimeSelected && styles.timeItemActive]}
                            onPress={() => toggleTimeForDay(day, time)}
                          >
                            <Text style={[styles.timeText, isTimeSelected && styles.timeTextActive]}>{time}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
            <Text style={styles.signUpBtnText}>Sign Up as Doctor</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/doctor/signin' as any)}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: {
    marginLeft: -8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  daysContainer: {
    marginBottom: 24,
  },
  dayGroup: {
    marginBottom: 12,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  dayItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayTextItem: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#FFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingLeft: 12,
  },
  timeItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    marginRight: 8,
    marginBottom: 8,
  },
  timeItemActive: {
    borderColor: '#3B5998',
    backgroundColor: '#EFF6FF',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeTextActive: {
    color: '#3B5998',
  },
  signUpBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  signUpBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
