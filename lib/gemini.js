import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GOOGLE_GEMINI_API_KEY

if (!apiKey) {
  throw new Error('Missing environment variable')
}

const genAI = new GoogleGenAI({ apiKey })

export async function generatePlanJson(prompt) {
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  })

  return response.text
}