import { GoogleGenAI, Type } from "@google/genai";
import { Detection, RiskLevel, ScanResult } from '../types';

// Initialize Gemini Client
// Note: In a production app, we wouldn't expose the key directly, but rely on env vars.
// For this environment, we assume process.env.API_KEY is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImagePrivacy = async (base64Image: string): Promise<ScanResult> => {
  try {
    // Remove header if present to get raw base64
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER, description: "Privacy safety score from 0 (dangerous) to 100 (safe)" },
        contextAnalysis: { type: Type.STRING, description: "A brief sentence explaining the privacy context (e.g., 'This appears to be a financial document containing sensitive account numbers.')" },
        detections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              risk: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
              ymin: { type: Type.NUMBER, description: "Bounding box ymin (0-1000)" },
              xmin: { type: Type.NUMBER, description: "Bounding box xmin (0-1000)" },
              ymax: { type: Type.NUMBER, description: "Bounding box ymax (0-1000)" },
              xmax: { type: Type.NUMBER, description: "Bounding box xmax (0-1000)" },
              description: { type: Type.STRING }
            },
            required: ["label", "risk", "ymin", "xmin", "ymax", "xmax"]
          }
        },
        suggestedAction: { type: Type.STRING, enum: ["none", "blur_faces", "redact_text", "block_upload"] }
      },
      required: ["score", "contextAnalysis", "detections", "suggestedAction"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image for privacy risks. Identify sensitive data like faces, PII (emails, phones, IDs), credit cards, or financial info. Return bounding boxes (0-1000 scale). Assess the context."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are PrivAI, an advanced privacy protection AI. You are strict about personal data protection. Identify any text or visual element that could compromise user privacy."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    // Transform to our internal type
    const detections: Detection[] = data.detections.map((d: any, index: number) => ({
      id: `det-${index}`,
      label: d.label,
      risk: d.risk as RiskLevel,
      bbox: {
        ymin: d.ymin,
        xmin: d.xmin,
        ymax: d.ymax,
        xmax: d.xmax
      },
      description: d.description
    }));

    return {
      score: data.score,
      contextAnalysis: data.contextAnalysis,
      detections: detections,
      suggestedAction: data.suggestedAction as any
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback mock response for demo if API fails or quota exceeded
    return {
      score: 45,
      contextAnalysis: "Analysis failed (Fallback). Potential sensitive document detected.",
      detections: [
        {
          id: 'fallback-1',
          label: 'Potential PII',
          risk: RiskLevel.HIGH,
          bbox: { ymin: 300, xmin: 200, ymax: 400, xmax: 800 },
          description: 'Detected text block that may contain personal info.'
        }
      ],
      suggestedAction: 'redact_text'
    };
  }
};
