import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface DetectedFood {
  name: string;
  portion: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function analyzeFoodImage(imageFile: File): Promise<DetectedFood[]> {
  if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'your_key_here') {
    throw new Error('OpenAI API key not configured. Please add your API key to .env file.');
  }

  const base64Image = await fileToBase64(imageFile);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and identify all food items. For each item, estimate the portion size and provide nutritional information.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "name": "food name",
    "portion": "estimated serving (e.g., '6 oz', '1 cup', '2 slices')",
    "confidence": 0.85,
    "calories": 280,
    "protein": 53,
    "carbs": 0,
    "fat": 6
  }
]

Rules:
- Include ALL visible food items
- Use standard USDA portion sizes
- Confidence between 0-1
- Provide accurate nutritional values per portion
- Return ONLY the JSON array, no other text`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const foods = JSON.parse(cleanedContent);

    if (!Array.isArray(foods)) {
      throw new Error('Invalid response format from AI');
    }

    return foods;
  } catch (error: any) {
    console.error('GPT-4 Vision error:', error);

    if (error.message?.includes('API key')) {
      throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
    }

    if (error.message?.includes('quota')) {
      throw new Error('OpenAI API quota exceeded. Please check your OpenAI account.');
    }

    if (error.message?.includes('rate limit')) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    }

    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. Please try again.');
    }

    throw new Error(error.message || 'Failed to analyze image. Please try again or add manually.');
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
  });
}
