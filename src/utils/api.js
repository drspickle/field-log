import { authToken } from './supabase';

export async function extractWorkout(base64, mimeType) {
  const token = await authToken();
  const response = await fetch('/api/extract-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  if (!response.ok) throw new Error('Extraction request failed');
  return await response.json();
}

export async function estimateNutritionPhoto(base64, mimeType) {
  const token = await authToken();
  const response = await fetch('/api/estimate-nutrition-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  if (!response.ok) throw new Error('Photo estimate request failed');
  return await response.json();
}

export async function estimateNutritionText(foodText) {
  const token = await authToken();
  const response = await fetch('/api/estimate-nutrition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ foodText }),
  });
  if (!response.ok) throw new Error('Estimate request failed');
  return await response.json();
}
