import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="exhibitor/[id]" />
      <Stack.Screen name="itinerary/[id]" />
      <Stack.Screen name="floor/[id]" />
      <Stack.Screen name="new" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
