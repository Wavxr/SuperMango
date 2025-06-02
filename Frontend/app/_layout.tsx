import { Tabs } from 'expo-router/tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function InnerLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#FDE68A',
          elevation: 8,
          shadowColor: '#F59E0B',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          position: 'absolute',
          bottom: 0,
        },
        tabBarBackground: () => null,
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIconStyle: { 
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "scan" : "scan-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: 'Result',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "analytics" : "analytics-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved-trees"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "folder" : "folder-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="how-to-scan"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="summary"
        options={{ href: null }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <InnerLayout />
    </SafeAreaProvider>
  );
}