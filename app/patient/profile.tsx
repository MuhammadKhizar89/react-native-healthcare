import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../api/firebase/config';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {/* Blue Header Section */}
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="chevron-left" size={32} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={{ width: 40 }} /> {/* Spacer to center title */}
          </View>

          <View style={styles.profileHeader}>
            {userData?.profileImageUrl ? (
              <Image source={{ uri: userData.profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={50} color="#555" />
              </View>
            )}
            <Text style={styles.profileName}>{userData?.name || 'Loading...'}</Text>
            <Text style={styles.profileEmail}>{userData?.email || auth.currentUser?.email}</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <InfoRow icon="person" label="Full Name" value={userData?.name || 'N/A'} />
            <InfoRow icon="email" label="Email" value={userData?.email || auth.currentUser?.email || 'N/A'} />
            <InfoRow icon="phone" label="Phone Number" value={userData?.phone || 'Not set'} />
            <InfoRow icon="bloodtype" label="Blood Type" value={userData?.bloodType || 'Not set'} />
            <InfoRow icon="cake" label="Date of Birth" value={userData?.dob || 'Not set'} noBorder />
          </View>

          <TouchableOpacity style={styles.editBtn}>
            <MaterialIcons name="edit" size={20} color="#FFF" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, noBorder }: { icon: any, label: string, value: string, noBorder?: boolean }) {
  return (
    <View style={[styles.infoRow, !noBorder && styles.borderBottom]}>
      <View style={styles.infoIconWrapper}>
        <MaterialIcons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
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
    paddingBottom: 60, // give space for overlapping card
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  scrollContent: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  editBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
