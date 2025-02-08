import { NextResponse } from 'next/server';
import OpenAI from 'openai'
import { getJson } from "serpapi";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serpApi = async (query: string) => {
  const results = await getJson({
    q: query,
    api_key: process.env.SERP_API_KEY,
    engine: "google",
    num: 3
  });
  
  return results.organic_results?.slice(0, 3) || [];
};

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    console.log('query', query);

    // 1. Get search results from SerpAPI
    const searchResults = await serpApi(query);
    console.log('searchResults', searchResults);
    
    // 2. Create prompt with search results
    const prompt = `Question: ${query}\n\nRelevant sources:\n${
      searchResults.map((result: any, index: number) => 
        `[${index + 1}] ${result.title}\n${result.snippet}\nURL: ${result.link}`
      ).join('\n\n')
    }\n\nPlease provide a comprehensive answer to the question, citing the sources where appropriate using [1], [2], etc.`;

    // 3. Get response from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini"
    });

    return NextResponse.json({
      answer: completion.choices[0].message.content,
      sources: searchResults
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 