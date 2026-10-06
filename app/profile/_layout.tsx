import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="team" />
      <Stack.Screen name="security" />
    </Stack>
  );
}
