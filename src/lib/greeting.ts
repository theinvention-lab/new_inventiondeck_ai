export function timeGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return '늦은 밤이네요 🌙';
  if (hour < 12) return '좋은 아침이에요 ☀️';
  if (hour < 18) return '좋은 오후예요 👋';
  return '좋은 저녁이에요 🌆';
}
