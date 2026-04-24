import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const API_BASE = 'http://10.0.0.51:3001';

export async function analyzeImages(items) {
  const payloadItems = (await Promise.all(items.slice(0, 9).map(async (item) => {
    try {
      const manipulated = await manipulateAsync(
        item.uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.8, format: SaveFormat.JPEG, base64: true }
      );
      return { id: item.id, uri: item.uri, base64: manipulated.base64, type: item.type };
    } catch(e) {
      console.warn('resize failed', item.id, e.message);
      return null;
    }
  }))).filter(Boolean);

  if (!payloadItems.length) throw new Error('No valid images.');

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: payloadItems })
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.results.map(r => ({ ...r, uri: payloadItems.find(i => i.id === r.id)?.uri || null }));
}
