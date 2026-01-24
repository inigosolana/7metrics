import { GoogleGenAI } from "@google/genai";

const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || '';

let aiInstance: any = null;
const getAI = () => {
  const key = getApiKey();
  if (!key) throw new Error("API Key not found. Please set VITE_GEMINI_API_KEY in .env.local");
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export const generateResponse = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[] = []
) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: "You are an elite handball analytics assistant for 7metrics. You help coaches with tactics, admins with system queries, and players with performance stats. Be concise, professional, and data-driven.",
      tools: [{ googleSearch: {} }],
    }
  });

  const result = await chat.sendMessageStream({ message: prompt });
  return result;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const key = getApiKey();
  if (!key) throw new Error("API Key not found");

  // Check if user has selected their own key for Veo
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      return null;
    }
  }

  const paidAi = new GoogleGenAI({ apiKey: key });

  let operation = await paidAi.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Handball drill or play: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  return operation;
};

export const pollVideoOperation = async (operation: any) => {
  const paidAi = new GoogleGenAI({ apiKey: getApiKey() });
  return await paidAi.operations.getVideosOperation({ operation });
}

export const analyzeImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt }
      ]
    }
  });

  return response.text;
};