import { NextResponse } from 'next/server';
import OpenAI from 'openai'
import { getJson } from "serpapi";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serpApi = async (query: string) => {
  // Get text results
  const textResults = await getJson({
    q: query,
    api_key: process.env.SERP_API_KEY,
    engine: "google",
    num: 3
  });
  
  // Get image results
  const imageResults = await getJson({
    q: query,
    api_key: process.env.SERP_API_KEY,
    engine: "google_images",
    num: 2
  });
  
  return {
    organic_results: textResults.organic_results?.slice(0, 3) || [],
    image_results: imageResults.images_results?.slice(0, 2) || []
  };
};

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    console.log('query', query);
    
    // 1. Get search results from SerpAPI
    const { organic_results, image_results } = await serpApi(query);
    console.log('organic_results', organic_results);
    console.log('image_results', image_results);
    
    // 2. Create prompt with search results and images
    const prompt = `Question: ${query}\n\n` +
      `Relevant sources:\n${
        organic_results.map((result: any, index: number) => 
          `[${index + 1}] ${result.title}\n${result.snippet}\nURL: ${result.link}`
        ).join('\n\n')
      }\n\n` +
      `Related images:\n${
        image_results.map((img: any) => img.original).join('\n')
      }\n\n` +
      `Please provide a comprehensive answer to the question, citing the sources where appropriate using [1], [2], etc. Include relevant images in your response if they help illustrate the answer.`;

    console.log('prompt', prompt);

    // 3. Get response from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    console.log('completion', completion);

    return NextResponse.json({
      answer: completion.choices[0].message.content,
      sources: organic_results,
      images: image_results.map((img: any) => ({
        url: img.original,
        alt: img.title || query
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export const config = {
  maxDuration: 60, // Maximum duration in seconds
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}; 