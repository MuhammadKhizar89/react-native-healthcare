import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { subscribeToUserChats, ChatSession } from '../../../api/firebase/chat';
import { getPatientAppointments } from '../../../api/firebase/appointments';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function MessageScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToUserChats((data) => {
      setChats(data);
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchContacts = async () => {
        setLoading(true);
        try {
          const appointments = await getPatientAppointments();
          const uniqueDoctors = new Map();
          appointments.forEach(app => {
            if (!uniqueDoctors.has(app.doctorId)) {
              uniqueDoctors.set(app.doctorId, { id: app.doctorId, name: app.doctorName });
            }
          });
          if (isActive) setContacts(Array.from(uniqueDoctors.values()));
        } catch (error) {
          console.error("Error fetching contacts", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchContacts();
      return () => { isActive = false; };
    }, [])
  );

  const displayList = contacts.map(contact => {
    const activeChat = chats.find(c => c.otherUser?.id === contact.id);
    return {
      id: contact.id,
      name: contact.name,
      lastMessage: activeChat ? activeChat.lastMessage : 'Tap to start chatting',
    };
  });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.chatCard}
      onPress={() => router.push(`/chat/${item.id}` as any)}
    >
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={28} color="#9CA3AF" />
      </View>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading messages...</Text>
      ) : displayList.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>No scheduled doctors to chat with yet.</Text>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listContent: {
    paddingTop: 8,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
});
