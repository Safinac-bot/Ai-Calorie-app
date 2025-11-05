import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  confidence: number;
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
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
- Return ONLY the JSON array, no other text`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse food data from response');
    }

    const foodItems: FoodItem[] = JSON.parse(jsonMatch[0]);
    return foodItems;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
}
