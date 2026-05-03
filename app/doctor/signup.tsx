import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUpDoctor } from '../../api/firebase/auth';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [hospital, setHospital] = useState('');
  const [about, setAbout] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      await signUpDoctor(email, password, name, availability, specialty, experience, hospital, about, bloodType, dob.toISOString().split('T')[0]);
      router.replace('/doctor/(tabs)/' as any);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Specialty</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="local-hospital" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Cardiologist"
                placeholderTextColor="#9CA3AF"
                value={specialty}
                onChangeText={setSpecialty}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Years of Experience</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="work" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 10"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={experience}
                onChangeText={setExperience}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hospital/Clinic Name</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="business" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. City General Hospital"
                placeholderTextColor="#9CA3AF"
                value={hospital}
                onChangeText={setHospital}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>About Me</Text>
            <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
              <MaterialIcons name="info" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="Brief description about yourself..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={about}
                onChangeText={setAbout}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Blood Type</Text>
            <View style={[styles.inputContainer, { paddingHorizontal: 0 }]}>
              <MaterialIcons name="bloodtype" size={20} color="#9CA3AF" style={[styles.inputIcon, { marginLeft: 12 }]} />
              <Picker
                selectedValue={bloodType}
                onValueChange={(itemValue) => setBloodType(itemValue)}
                style={{ flex: 1, height: 50, color: '#1F2937' }}
                dropdownIconColor="#9CA3AF"
              >
                <Picker.Item label="A+" value="A+" />
                <Picker.Item label="A-" value="A-" />
                <Picker.Item label="B+" value="B+" />
                <Picker.Item label="B-" value="B-" />
                <Picker.Item label="AB+" value="AB+" />
                <Picker.Item label="AB-" value="AB-" />
                <Picker.Item label="O+" value="O+" />
                <Picker.Item label="O-" value="O-" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => Platform.OS === 'web' ? null : setShowDatePicker(true)}
            >
              <MaterialIcons name="cake" size={20} color="#9CA3AF" style={styles.inputIcon} />
              {Platform.OS === 'web' ? (
                <input 
                  type="date"
                  value={dob.toISOString().split('T')[0]}
                  onChange={(e) => setDob(new Date(e.target.value))}
                  style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#1F2937', fontSize: 16, height: 50, fontFamily: 'system-ui' }}
                />
              ) : (
                <Text style={[styles.input, { paddingTop: 14 }]}>
                  {dob.toISOString().split('T')[0]}
                </Text>
              )}
            </TouchableOpacity>
            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={dob}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setDob(selectedDate);
                }}
                maximumDate={new Date()}
              />
            )}
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

          <TouchableOpacity 
            style={[styles.signUpBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.signUpBtnText}>Sign Up as Doctor</Text>
            )}
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
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
