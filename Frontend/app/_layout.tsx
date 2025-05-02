import { Tabs } from 'expo-router/tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#fff9c4',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView 
              tint="light" 
              intensity={80} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                backgroundColor: 'rgba(255, 249, 196, 0.7)' 
              }} 
            />
          ) : null,
        tabBarActiveTintColor: '#f9a825',
        tabBarInactiveTintColor: '#795548',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="camera" 
        options={{ 
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="result" 
        options={{ 
          title: 'Results',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}