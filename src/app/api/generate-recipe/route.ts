import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, ingredients, preferences } = body;

    // Build the AI prompt
    let aiPrompt = '';
    
    if (prompt) {
      aiPrompt = `Crie uma receita detalhada para: ${prompt}`;
    } else if (ingredients) {
      aiPrompt = `Crie uma receita usando os seguintes ingredientes: ${ingredients}`;
    }

    // Add preferences context
    if (preferences) {
      if (preferences.restrictions && preferences.restrictions.length > 0) {
        aiPrompt += `\nRestrições alimentares: ${preferences.restrictions.join(', ')}`;
      }
      if (preferences.goal) {
        aiPrompt += `\nObjetivo: ${preferences.goal}`;
      }
      if (preferences.maxTime) {
        aiPrompt += `\nTempo máximo: ${preferences.maxTime} minutos`;
      }
    }

    aiPrompt += `\n\nRetorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com esta estrutura exata:
{
  "name": "Nome da receita",
  "ingredients": ["ingrediente 1", "ingrediente 2"],
  "calories": 350,
  "protein": 25,
  "carbs": 30,
  "fat": 10,
  "time": 30,
  "difficulty": "Fácil",
  "instructions": ["passo 1", "passo 2"],
  "tips": ["dica 1", "dica 2"]
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
            content: 'Você é um chef profissional especializado em criar receitas detalhadas e saudáveis. Sempre retorne JSON válido sem markdown.'
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
      throw new Error('Failed to generate recipe');
    }

    const data = await response.json();
    let recipeText = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const recipe = JSON.parse(recipeText);

    // Generate image for the recipe using DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Uma foto profissional e apetitosa de ${recipe.name}, estilo fotografia gastronômica, iluminação natural, fundo clean, alta qualidade, 4k`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      recipe.image = imageData.data[0].url;
    } else {
      recipe.image = '';
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}
