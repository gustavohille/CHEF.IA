import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, preferences } = body;

    // Build the AI prompt
    let aiPrompt = `Crie um drink detalhado: ${prompt}`;

    // Add preferences context
    if (preferences && preferences.drinks && preferences.drinks.length > 0) {
      aiPrompt += `\nPreferências de drinks: ${preferences.drinks.join(', ')}`;
    }

    aiPrompt += `\n\nRetorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com esta estrutura exata:
{
  "name": "Nome do drink",
  "ingredients": ["ingrediente 1", "ingrediente 2"],
  "calories": 180,
  "type": "Cítrico",
  "instructions": ["passo 1", "passo 2"]
}`;

    // Call OpenAI API
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
            content: 'Você é um bartender profissional especializado em criar drinks incríveis. Sempre retorne JSON válido sem markdown.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate drink');
    }

    const data = await response.json();
    let drinkText = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    drinkText = drinkText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const drink = JSON.parse(drinkText);

    // Generate image for the drink using DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Uma foto profissional e atraente de ${drink.name}, drink em copo elegante, iluminação de bar, fundo desfocado, alta qualidade, 4k, instagramável`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      drink.image = imageData.data[0].url;
    } else {
      drink.image = '';
    }

    return NextResponse.json({ drink });
  } catch (error) {
    console.error('Error generating drink:', error);
    return NextResponse.json(
      { error: 'Failed to generate drink' },
      { status: 500 }
    );
  }
}
