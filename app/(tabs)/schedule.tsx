import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const filters = ['All', 'Upcoming', 'Completed', 'Cancel'];

export default function ScheduleScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Search Bar */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Find schedule"
              placeholderTextColor="#9CA3AF"
            />
            <MaterialIcons name="search" size={24} color="#4B5563" />
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList} contentContainerStyle={styles.filterContent}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scheduleList}>
          <ScheduleCard 
            doctorName="dr. Zubaidah"
            specialty="Radiology specialist"
            hospital="Cengkareng Hospital"
            date="7 Juli 2023"
            time="09: 00 Am"
            status="Cancel"
            statusColor="#EF4444"
            statusBg="#FEE2E2"
            buttonLabel="Reschedule" // Though in design it's a blue button
          />
          
          <ScheduleCard 
            doctorName="drg. Claire"
            specialty="Dentistry"
            hospital="Cengkareng Hospital"
            date=""
            time=""
            status="Complete"
            statusColor="#10B981"
            statusBg="#D1FAE5"
            buttonLabel="Make new appointment"
            hideTime
          />

          <ScheduleCard 
            doctorName="dr Harold"
            specialty="ENT"
            hospital="Cengkareng Hospital"
            date="7 Juli 2023"
            time="09: 00 Am"
            status="Upcoming"
            statusColor="#38BDF8"
            statusBg="#E0F2FE"
            buttonLabel="Reschedule"
          />

          <ScheduleCard 
            doctorName="dr. Serenity"
            specialty="Radiology specialist"
            hospital="Cengkareng Hospital"
            date="7 Juli 2023"
            time="09: 00 Am"
            status="Upcoming"
            statusColor="#F59E0B"
            statusBg="#FEF3C7"
            buttonLabel=""
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ScheduleCard({ 
  doctorName, specialty, hospital, date, time, status, statusColor, statusBg, buttonLabel, hideTime 
}: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardImagePlaceholder}>
          <MaterialIcons name="image" size={32} color="#555" />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: '#FFF' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
          </View>
          <Text style={styles.specialtyText}>{specialty}</Text>
          <View style={styles.hospitalRow}>
            <MaterialIcons name="location-on" size={14} color="#3B82F6" />
            <Text style={styles.hospitalText}>{hospital}</Text>
          </View>
        </View>
      </View>
      
      {!hideTime && (
        <View style={styles.timeSection}>
          <View style={styles.timeRow}>
            <MaterialIcons name="access-time" size={16} color="#6B7280" />
            <Text style={styles.timeLabel}>{time}</Text>
          </View>
          <View style={styles.timeRow}>
            <MaterialIcons name="event" size={16} color="#6B7280" />
            <Text style={styles.timeLabel}>{date}</Text>
          </View>
          {buttonLabel ? (
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{buttonLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {hideTime && buttonLabel && (
        <View style={styles.fullActionBtnRow}>
           <TouchableOpacity style={styles.actionBtnFull}>
              <Text style={styles.actionBtnText}>{buttonLabel}</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterList: {
    flexDirection: 'row',
  },
  filterContent: {
    paddingRight: 20,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  filterPillActive: {
    backgroundColor: '#3B5998',
    borderColor: '#3B5998',
  },
  filterText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  scheduleList: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  specialtyText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  timeSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  actionBtn: {
    backgroundColor: '#3B5998',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  fullActionBtnRow: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  actionBtnFull: {
    backgroundColor: '#3B5998',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
