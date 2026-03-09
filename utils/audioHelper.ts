/**
 * Decodes a Base64 string into a Int16Array (PCM data).
 * Used if we need to process raw PCM.
 */
function decodeBase64ToInt16(base64: string): Int16Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const buffer = new ArrayBuffer(len);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    view[i] = binaryString.charCodeAt(i);
  }
  return new Int16Array(buffer);
}

/**
 * Simply converts a Base64 string (assuming it is already MP3 data) into a Blob.
 * This is used for Volcengine which returns encoded MP3 directly.
 */
export function createMp3BlobDirectly(base64Data: string): Blob {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'audio/mp3' });
}

/**
 * Encodes raw PCM data to MP3 using LameJS.
 * Kept for backward compatibility or if using an API that returns PCM.
 */
export function createMp3BlobFromBase64(base64Data: string, sampleRate: number = 24000): Blob {
  const pcmData = decodeBase64ToInt16(base64Data);
  const channels = 1;
  const kbps = 128; 

  // Access the global lamejs object loaded via <script> tag
  // @ts-ignore
  const lame = window.lamejs;

  if (!lame) {
    throw new Error("lamejs library not loaded. Please ensure the script tag is in index.html");
  }

  const mp3encoder = new lame.Mp3Encoder(channels, sampleRate, kbps);
  
  const mp3Data: Int8Array[] = [];
  
  // Encode the buffer
  // lamejs expects Int16Array for signed 16-bit integers
  const mp3buf = mp3encoder.encodeBuffer(pcmData);
  if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
  }
  
  // Flush the buffer
  const endBuf = mp3encoder.flush();
  if (endBuf.length > 0) {
      mp3Data.push(endBuf);
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}