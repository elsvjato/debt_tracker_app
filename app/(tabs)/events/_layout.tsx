import { Stack } from 'expo-router';

export default function EventLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="add-participant" />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="expense/[expenseId]" />
      <Stack.Screen name="edit-expense/[expenseId]" />
    </Stack>
  );
}