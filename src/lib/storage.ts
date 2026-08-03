const NAMESPACE = 'inventiondeck';

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, UI shows autosave error separately
  }
}

export function removeJSON(key: string): void {
  localStorage.removeItem(`${NAMESPACE}:${key}`);
}
