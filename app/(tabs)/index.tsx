import React from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

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
                  <Text style={styles.userName}>Jacob Jones</Text>
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
          <Text style={styles.sectionTitle}>Schedule today</Text>
          <TouchableOpacity style={styles.scheduleCard} onPress={() => router.push('/doctor/1' as any)}>
            <View style={styles.scheduleImagePlaceholder}>
              <MaterialIcons name="image" size={32} color="#555" />
            </View>
            <View style={styles.scheduleInfo}>
              <View style={styles.scheduleHospital}>
                <MaterialIcons name="location-on" size={14} color="#3B82F6" />
                <Text style={styles.hospitalText}>Cengkareng Hospital</Text>
              </View>
              <Text style={styles.doctorName}>dr. Zubaidah</Text>
              <Text style={styles.specialtyText}>Radiology specialist</Text>
            </View>
            <View style={styles.scheduleTimeInfo}>
              <Text style={styles.dateText}>7 Juli 2023</Text>
              <Text style={styles.timeText}>09: 00 Am</Text>
            </View>
          </TouchableOpacity>

          {/* Doctor's Recommendation */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Doctor's recommendation</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreBtn}>See more</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationList}>
            <DoctorRecommendationCard name="dr. Jenny" spec="Ophthalmologist" />
            <DoctorRecommendationCard name="dr. Jhon" spec="General" />
            <DoctorRecommendationCard name="dr. Betty" spec="Radiology" />
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

function DoctorRecommendationCard({ name, spec }: { name: string, spec: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push('/doctor/1' as any)} style={styles.recommendationCard}>
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
