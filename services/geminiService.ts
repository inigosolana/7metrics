import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Helper to check for API key in a demo environment
const ensureApiKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }
};

const getAIClient = async () => {
    await ensureApiKey();
    // In a real env, process.env.API_KEY is populated. 
    // In the demo env, the key might be injected or handled by the proxy.
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateCoachResponse = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
    const ai = await getAIClient();
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: `You are an elite sports performance coach named "Coach AI". 
            You specialize in handball and team sports analytics. 
            Keep your answers concise, tactical, and data-driven. 
            Use terminology like "xG", "Defensive Efficiency", "Fast Break Conversion".
            If asked about recent events, use your search tool.`,
            tools: [{ googleSearch: {} }]
        }
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    
    // Check for grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let text = response.text || "I couldn't generate a response.";

    if (groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
            .map((chunk: any) => chunk.web?.uri ? `[${chunk.web.title}](${chunk.web.uri})` : '')
            .filter(Boolean)
            .join(', ');
        if (sources) {
            text += `\n\nSources: ${sources}`;
        }
    }

    return text;
};

export const analyzeMatchImage = async (base64Image: string, mimeType: string) => {
    const ai = await getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                    }
                },
                {
                    text: "Analyze this sports scene. Identify the formation, potential tactical advantage, and key player positions. Return a JSON with 'tacticalAnalysis' (string) and 'detectedTags' (array of strings)."
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tacticalAnalysis: { type: Type.STRING },
                    detectedTags: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });

    return JSON.parse(response.text || '{}');
};

export const generateTrainingVideo = async (prompt: string) => {
    const ai = await getAIClient();
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        return operation;
    } catch (e: any) {
        // Handle "Requested entity was not found" by prompting for key again as per instructions
        if (e.toString().includes('Requested entity was not found') && typeof window !== 'undefined' && (window as any).aistudio) {
             await (window as any).aistudio.openSelectKey();
             // Retry once with new client
             const newAi = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
             return await newAi.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9'
                }
            });
        }
        throw e;
    }
};

export const pollVideoOperation = async (operation: any) => {
    const ai = await getAIClient();
    return await ai.operations.getVideosOperation({ operation: operation });
};