import { VolcVoiceName, DoubaoCredentials } from "../types";

// 本地开发通过 Vite 代理到火山接口，避免浏览器直接跨域请求
// 见 vite.config.ts 中 /doubao-tts 的代理配置
const V3_ENDPOINT = "/doubao-tts";

/**
 * 构造 Doubao V3 HTTP Chunked 请求头
 * 这里统一走 2.0 资源，以避免 1.0 资源未开通导致的 403。
 */
function buildHeaders(credentials: DoubaoCredentials): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Api-App-Id": credentials.appId,
    "X-Api-Access-Key": credentials.apiKey,
    "X-Api-Resource-Id": "seed-tts-2.0",
  };
}

/**
 * 构造 Doubao V3 HTTP Chunked 请求 Body
 * 对齐官方文档结构：
 * {
 *   "user": { "uid": "xxx" },
 *   "req_params": {
 *      "text": "...",
 *      "speaker": "BVxxx",
 *      "audio_params": { "format": "mp3", "sample_rate": 24000 }
 *   }
 * }
 */
function buildPayload(
  text: string,
  voice: VolcVoiceName,
  _credentials: DoubaoCredentials,
  _speedRatio: number = 1.0
) {
  return {
    user: {
      uid: "user_dafei_tts",
    },
    req_params: {
      text,
      // 使用前端选择的音色 ID（需确保是你账号有权限的 2.0 / bigtts 音色）
      speaker: voice,
      audio_params: {
        format: "mp3",
        sample_rate: 24000,
      },
    },
  };
}

/**
 * 解析 Doubao 返回的文本（可能包含多行 JSON），提取所有 data 字段里的 base64 音频。
 * 这样不用真正“流式”读取，简化调试，也兼容 HTTP Chunked / SSE 文本模式。
 */
function parseDoubaoTextStream(rawText: string): Uint8Array {
  const audioChunks: Uint8Array[] = [];

  const lines = rawText.split(/\r?\n/);
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line) continue;

    const jsonText = line.startsWith("data:")
      ? line.slice("data:".length).trim()
      : line;

    try {
      const obj = JSON.parse(jsonText) as {
        code?: number;
        message?: string;
        data?: string | null;
      };

      if (obj.code && obj.code !== 0 && obj.code !== 20000000) {
        throw new Error(obj.message || `Doubao error code: ${obj.code}`);
      }

      if (obj.data) {
        const base64 = obj.data;
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i += 1) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioChunks.push(bytes);
      }
    } catch {
      // 不是 JSON 行，忽略即可
      continue;
    }
  }

  // 合并所有音频片段
  let totalLength = 0;
  for (const chunk of audioChunks) {
    totalLength += chunk.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of audioChunks) {
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
  if (!credentials.apiKey || !credentials.appId) {
    throw new Error("Missing Doubao App ID or API Key. Please configure them in settings.");
  }

  const payload = buildPayload(text, voice, credentials, speedRatio);
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

  // 拉取完整文本，再按行解析 JSON（data 字段为 base64 音频）
  const rawText = await response.text();
  const audioData = parseDoubaoTextStream(rawText);
  if (audioData.length === 0) {
    // 为了方便排查问题，把前 200 字符打印到控制台
    console.error("Doubao raw response (no audio data):", rawText.slice(0, 200));
    throw new Error("Empty audio data received from Doubao API.");
  }

  return new Blob([audioData as any], { type: "audio/mp3" });
};

// Legacy V1 function kept for reference but deprecated
/** @deprecated Use generateVolcAudioV3 instead */
export const generateVolcAudio = generateVolcAudioV3;