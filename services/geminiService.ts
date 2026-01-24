import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateResponse = async (
  prompt: string, 
  history: { role: string; parts: { text: string }[] }[] = []
) => {
  if (!apiKey) throw new Error("API Key not found");
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: "You are an elite handball analytics assistant for 7metrics. You help coaches with tactics, admins with system queries, and players with performance stats. Be concise, professional, and data-driven.",
      tools: [{googleSearch: {}}],
    }
  });

  const result = await chat.sendMessageStream({ message: prompt });
  return result;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  if (!apiKey) throw new Error("API Key not found");

  // Check if user has selected their own key for Veo (as per requirements for paid models)
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Create new instance with potentially new key environment
          return null; // Let the UI handle the retry or re-init
      }
  }

  // Create a new instance to ensure we pick up any user-selected keys
  const paidAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Create a new instance to ensure we pick up any user-selected keys
    const paidAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await paidAi.operations.getVideosOperation({ operation });
}


export const analyzeImage = async (base64Image: string, prompt: string) => {
  if (!apiKey) throw new Error("API Key not found");
  
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