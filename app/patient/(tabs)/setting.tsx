import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser } from '../../../api/firebase/auth';

export default function SettingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <SettingItem 
          icon="person" 
          title="My Profile"
          onPress={() => router.push('/patient/profile' as any)} 
        />
        <SettingItem 
          icon="notifications" 
          title="Notifications" 
          onPress={() => {}} 
        />
        <SettingItem 
          icon="security" 
          title="Privacy & Security" 
          onPress={() => {}} 
        />
        <SettingItem 
          icon="help-outline" 
          title="Help & Support" 
          onPress={() => {}} 
        />
        
        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.signOutBtn}
          onPress={async () => {
            try {
              await logoutUser();
              // RootLayout will automatically handle the redirect
            } catch (error) {
              console.error(error);
            }
          }}
        >
          <MaterialIcons name="logout" size={24} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SettingItem({ icon, title, onPress }: { icon: any, title: string, onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconWrapper}>
        <MaterialIcons name={icon} size={24} color="#4B5563" />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 2,
  },
  settingIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  divider: {
    height: 20,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 16,
  },
});
