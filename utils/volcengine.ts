import { VolcVoiceName, DoubaoCredentials } from "../types";

const V3_ENDPOINT = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";

/**
 * Build the standard V3 request headers.
 */
function buildHeaders(credentials: DoubaoCredentials): Record<string, string> {
  // Doubao V3 TTS requires both App ID and Token
  // Note: Standard Volcengine Bearer format requires a semicolon after Bearer.
  return {
    "Content-Type": "application/json",
    "X-Api-App-Id": credentials.appId,
    "Authorization": `Bearer;${credentials.apiKey}`,
    "X-Api-Resource-Id": "volc.service_type.10029",
  };
}

/**
 * Build the request payload for Volcengine / Doubao TTS V3.
 */
function buildPayload(text: string, voice: VolcVoiceName, speedRatio: number = 1.0) {
  return {
    app: {
      appid: "dafei-tts",
      token: "access_token",
      cluster: "volcano_tts",
    },
    user: {
      uid: "user_dafei_tts",
    },
    audio: {
      voice_type: voice,
      encoding: "mp3",
      speed_ratio: speedRatio,
      volume_ratio: 1.0,
      pitch_ratio: 1.0,
    },
    request: {
      reqid: crypto.randomUUID(),
      text: text,
      text_type: "plain",
      operation: "query",
    },
  };
}

/**
 * Read a chunked/streaming HTTP response and return the full body as a Uint8Array.
 */
async function readStreamToArrayBuffer(response: Response): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response body reader");
  }

  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  // Merge all chunks into a single Uint8Array
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Generate audio using the Doubao V3 HTTP Chunked API.
 * Returns an audio Blob (MP3 format) ready for playback or download.
 */
export const generateVolcAudioV3 = async (
  text: string,
  voice: VolcVoiceName,
  credentials: DoubaoCredentials,
  speedRatio: number = 1.0
): Promise<Blob> => {
  if (!credentials.apiKey) {
    throw new Error("Missing Doubao API Key. Please configure your API Key in settings.");
  }

  const payload = buildPayload(text, voice, speedRatio);
  const headers = buildHeaders(credentials);

  const response = await fetch(V3_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Doubao API Error: ${response.status} - ${errText}`);
  }

  // Check content type to determine response format
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    // V3 may return JSON with base64 data (fallback/error case or non-streaming response)
    const data = await response.json();
    if (data.code && data.code !== 3000) {
      throw new Error(`Doubao Error: ${data.message || "Unknown error"}`);
    }
    if (data.data) {
      // base64 encoded audio
      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: "audio/mp3" });
    }
    throw new Error("No audio data received from Doubao API.");
  }

  // Chunked binary audio response
  const audioData = await readStreamToArrayBuffer(response);
  if (audioData.length === 0) {
    throw new Error("Empty audio data received from Doubao API.");
  }

  return new Blob([audioData as any], { type: "audio/mp3" });
};

// Legacy V1 function kept for reference but deprecated
/** @deprecated Use generateVolcAudioV3 instead */
export const generateVolcAudio = generateVolcAudioV3;