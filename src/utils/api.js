import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_BASE } from '../constants/config';

export async function analyzeImages(items) {
  const payloadItems = (
    await Promise.all(
      items.slice(0, 9).map(async (item) => {
        // Skip anything that isn't a photo — videos can't be base64'd via manipulator
        if (item.type === 'video') return null;
        try {
          const manipulated = await manipulateAsync(
            item.uri,
            [{ resize: { width: 1000 } }],
            { compress: 0.8, format: SaveFormat.JPEG, base64: true }
          );
          return { id: item.id, uri: item.uri, base64: manipulated.base64, type: item.type };
        } catch (e) {
          console.warn('resize failed', item.id, e.message);
          return null;
        }
      })
    )
  ).filter(Boolean);

  if (!payloadItems.length) throw new Error('No valid images to analyse.');

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: payloadItems }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analysis failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  // Map URIs back from original items using the ID the server assigned
  return data.results.map((r) => ({
    ...r,
    uri: payloadItems.find((i) => i.id === r.id)?.uri || null,
  }));
}
