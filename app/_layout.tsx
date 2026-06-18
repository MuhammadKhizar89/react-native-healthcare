import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { auth, db } from '../api/firebase/config';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [isReady, setIsReady] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch role from Firestore if available
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            setUserRole(role);
            await AsyncStorage.setItem('role', role);
          } else {
            // Fallback to local storage if document doesn't exist yet
            const localRole = await AsyncStorage.getItem('role');
            setUserRole(localRole || 'patient');
          }
        } catch (error) {
          const localRole = await AsyncStorage.getItem('role');
          setUserRole(localRole || 'patient');
        }
      } else {
        setUserRole(null);
        await AsyncStorage.removeItem('role');
      }
      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments.length > 1 && (segments[1] === 'signin' || segments[1] === 'signup');
    const isRootIndex = segments.length === 0 || segments[0] === 'index';

    if (!userRole) {
      // User is NOT logged in.
      // If they are not on an auth screen and not on root, kick them to root
      if (!isRootIndex && !inAuthGroup) {
        router.replace('/' as any);
      }
    } else {
      // User IS logged in.
      // If they are on root or an auth screen, push them to their dashboard
      if (isRootIndex || inAuthGroup) {
        router.replace(`/${userRole}/(tabs)/` as any);
      }
    }
  }, [userRole, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B5998" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="patient" options={{ headerShown: false }} />
        <Stack.Screen name="doctor" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}