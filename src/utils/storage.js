import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDED: 'pick:onboarded',
  PERMISSION_STATUS: 'pick:permission_status',
  FREE_PICKS_USED: 'pick:free_picks_used',
  FREE_PICKS_RESET_DATE: 'pick:free_picks_reset_date',
  HISTORY: 'pick:history',
  APPEARANCE: 'pick:appearance',
};

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function getOnboardingComplete() {
  try {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete() {
  await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function getPermissionStatus() {
  try {
    return await AsyncStorage.getItem(KEYS.PERMISSION_STATUS);
  } catch {
    return null;
  }
}

export async function setPermissionStatus(status) {
  await AsyncStorage.setItem(KEYS.PERMISSION_STATUS, status);
}

// ─── Free picks ───────────────────────────────────────────────────────────────

export async function getFreePicksUsed() {
  try {
    const val = await AsyncStorage.getItem(KEYS.FREE_PICKS_USED);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export async function incrementFreePicksUsed() {
  const current = await getFreePicksUsed();
  const next = current + 1;
  await AsyncStorage.setItem(KEYS.FREE_PICKS_USED, String(next));
  return next;
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getHistory() {
  try {
    const val = await AsyncStorage.getItem(KEYS.HISTORY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(entry) {
  // entry: { id, date, leadTitle, leadReason, leadLabel, thumbnailUri, allIds, posted }
  const history = await getHistory();
  const updated = [entry, ...history].slice(0, 50); // cap at 50
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}

export async function markHistoryEntryPosted(entryId) {
  const history = await getHistory();
  const updated = history.map((h) => h.id === entryId ? { ...h, posted: true } : h);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}

// ─── Appearance ───────────────────────────────────────────────────────────────

export async function getAppearance() {
  try {
    return await AsyncStorage.getItem(KEYS.APPEARANCE) || 'light';
  } catch {
    return 'light';
  }
}

export async function setAppearance(mode) {
  await AsyncStorage.setItem(KEYS.APPEARANCE, mode);
}

// ─── Full reset (for testing / account deletion) ─────────────────────────────

export async function resetAllData() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
