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
          height: 60, // Reduced from 70px to 60px
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 4, // Added subtle elevation for Android
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          position: 'absolute',
          bottom: 0,
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView 
              tint="light" 
              intensity={95} // Increased blur intensity for a more modern look
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)' // Changed to white with transparency
              }} 
            />
          ) : null,
        tabBarActiveTintColor: '#4CAF50', // Changed to a green color to match the app theme
        tabBarInactiveTintColor: '#9E9E9E', // Changed to a neutral gray
        tabBarLabelStyle: {
          fontSize: 11, // Reduced font size
          fontWeight: '500',
          marginBottom: 5, // Reduced margin
        },
        tabBarIconStyle: {
          marginTop: 5, // Reduced margin
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