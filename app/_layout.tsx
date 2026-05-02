import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const flag = await AsyncStorage.getItem('isAuthenticated');
      setIsLoggedIn(!!flag);
      setIsReady(true);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const checkAndRedirect = async () => {
      const flag = await AsyncStorage.getItem('isAuthenticated');
      const inAuthGroup = segments[0] === 'signin' || segments[0] === 'signup';

      if (!flag && !inAuthGroup) {
        // Redirect to the sign-in page.
        router.replace('/signin' as any);
      } else if (flag && inAuthGroup) {
        // Redirect to tabs if logged in and trying to access auth screens
        router.replace('/(tabs)/' as any);
      } else if (flag && (segments.length === 0 || segments[0] === 'index')) {
        // Redirect from root index to tabs if logged in
        router.replace('/(tabs)/' as any);
      }
    };

    checkAndRedirect();
  }, [isReady, segments]);

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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="doctor/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}