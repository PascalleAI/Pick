// ─── Pick — App Config ────────────────────────────────────────────────────────
// Change API_BASE here. One place, applies everywhere.

const DEV_IP = '10.0.0.51'; // ← update this to your Mac's local IP when on dev

export const API_BASE = __DEV__
  ? `http://${DEV_IP}:3001`
  : 'https://YOUR_PRODUCTION_URL'; // ← swap before App Store submission
