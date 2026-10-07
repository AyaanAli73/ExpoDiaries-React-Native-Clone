import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="me" />
      <Stack.Screen name="company" />
      <Stack.Screen name="card" />
      <Stack.Screen name="qr" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="data" />
      <Stack.Screen name="account" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="team" />
      <Stack.Screen name="team-detail" />
      <Stack.Screen name="crm" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="security" />
    </Stack>
  );
}
