import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

interface ImageData {
    base64: string;
    mimeType: string;
}

export const analyzePathologyImages = async (
    images: ImageData[],
    userPrompt: string
): Promise<string> => {
    const systemPrompt = `You are an expert histopathologist assistant AI. Your task is to analyze the provided histopathology images in conjunction with the clinical information provided by the user, and generate a concise report in VIETNAMESE.

**Clinical Context provided by user:**
${userPrompt || 'Không có bối cảnh bổ sung.'}

If multiple images are provided, treat them as a series representing the same case. Correlate your findings from the images with the clinical context.

Your entire response MUST be in VIETNAMESE.

First, on a new line, write this mandatory disclaimer:
**Lưu ý:** Phân tích này được tạo bởi AI và chỉ mang tính chất tham khảo, không thể thay thế cho chẩn đoán của bác sĩ chuyên khoa.

Then, structure your analysis using markdown format exactly as follows:

## Chẩn đoán phân biệt
List the 5 most likely differential diagnoses according to the latest WHO classification. Only provide the name of the diagnosis. Do not add any descriptions or explanations.

Your tone must be professional and objective. Do not provide a definitive diagnosis. The output should be strictly limited to the format above.`;

    try {
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        const textPart = {
            text: systemPrompt,
        };
        
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [...imageParts, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};