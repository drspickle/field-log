import { authToken } from './supabase';

async function throwWithDetail(response, fallbackMessage) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // response wasn't JSON; ignore
  }
  const detail = body ? ` (${response.status}: ${body.detail || body.error || JSON.stringify(body)})` : ` (${response.status})`;
  throw new Error(fallbackMessage + detail);
}

export async function extractWorkout(base64, mimeType) {
  const token = await authToken();
  const response = await fetch('/api/extract-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  if (!response.ok) await throwWithDetail(response, 'Extraction request failed');
  return await response.json();
}

export async function estimateNutritionPhoto(base64, mimeType) {
  const token = await authToken();
  const response = await fetch('/api/estimate-nutrition-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  if (!response.ok) await throwWithDetail(response, 'Photo estimate request failed');
  return await response.json();
}

export async function estimateNutritionText(foodText) {
  const token = await authToken();
  const response = await fetch('/api/estimate-nutrition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ foodText }),
  });
  if (!response.ok) await throwWithDetail(response, 'Estimate request failed');
  return await response.json();
}
