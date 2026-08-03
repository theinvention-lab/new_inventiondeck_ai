// NOTE: This is a lightweight client-side obfuscation for a local demo
// (no backend exists in this build). It is NOT cryptographically secure
// and must never be used for real credential storage.
export function mockHash(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return `h${(hash >>> 0).toString(36)}_${value.length}`;
}
