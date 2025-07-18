export async function enhancedTranscription(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  // You can add export_srt if needed
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/enhanced-transcription/process`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Enhanced transcription failed');
  return await response.json();
}

export async function translateText(text: string, source_language: string, target_language: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      source_language,
      target_language,
      model: 'sarvam-translate:v1',
    }),
  });
  if (!response.ok) throw new Error('Translation failed');
  return await response.json();
} 