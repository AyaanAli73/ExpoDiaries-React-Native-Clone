import { Stack } from 'expo-router';

export default function LeadsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="export" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
