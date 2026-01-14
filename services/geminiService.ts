import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found in environment variables");
    }
    return new GoogleGenAI({ apiKey });
};

// Helper to convert base64 string to standard format if needed, 
// basically ensuring we strip the data:image/png;base64, prefix if passed to the API incorrectly,
// but the new SDK usually handles parts structure well.
const extractBase64 = (dataUrl: string): string => {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
        return matches[2];
    }
    return dataUrl;
};

// Helper to extract mime type from data URL
const extractMimeType = (dataUrl: string): string => {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,/);
    if (matches && matches.length === 2) {
        return matches[1];
    }
    return 'image/png'; // Default
};

export const editImageWithGemini = async (
    imageBase64: string, 
    prompt: string
): Promise<string> => {
    const ai = getAiClient();
    const cleanBase64 = extractBase64(imageBase64);
    const mimeType = extractMimeType(imageBase64);

    try {
        // Use gemini-2.5-flash-image for broader access and general editing tasks.
        // gemini-3-pro-image-preview is restricted and often causes permission errors on standard keys.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: prompt
                    },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: cleanBase64
                        }
                    }
                ]
            }
        });

        // Parse the response to find the image
        const parts = response.candidates?.[0]?.content?.parts;
        
        if (!parts) {
            throw new Error("No content generated");
        }

        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
        
        // If only text returned (error or refusal)
        const textPart = parts.find(p => p.text);
        if (textPart) {
            throw new Error(`AI returned text instead of image: ${textPart.text}`);
        }

        throw new Error("No image data found in response");

    } catch (error) {
        console.error("Gemini Image Edit Error:", error);
        throw error;
    }
};