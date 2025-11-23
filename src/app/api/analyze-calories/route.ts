import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Call OpenAI Vision API to analyze the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um nutricionista especializado em análise de alimentos. Analise a imagem e retorne APENAS um JSON válido (sem markdown) com as informações nutricionais.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta imagem de comida e retorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com esta estrutura exata:
{
  "totalCalories": 450,
  "protein": 25,
  "carbs": 50,
  "fat": 15,
  "foodItems": ["item 1", "item 2", "item 3"]
}

Seja preciso nas estimativas de calorias e macronutrientes. Liste todos os alimentos visíveis na imagem.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    let analysisText = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(analysisText);
    analysis.image = image;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing calories:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
