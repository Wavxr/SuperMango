import { Tabs } from 'expo-router/tabs';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="camera" options={{ title: 'Camera' }} />
      <Tabs.Screen name="result" options={{ title: 'Result' }} />
    </Tabs>
  );
}