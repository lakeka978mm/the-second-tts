import { GoogleGenAI, Modality } from "@google/genai";
import { GeminiVoiceName } from "../types";

export const generateGeminiAudio = async (text: string, voice: GeminiVoiceName): Promise<string> => {
  // Use process.env.API_KEY as required. This variable is assumed to be injected by the runtime environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("Failed to generate audio content.");
  }

  return base64Audio;
};