import OpenAI from 'openai';
import { ResearchData, ClassifiedData } from '@/types';
import { processResearchData } from './openAiProcessingService';

// This would be stored in environment variables in a real app
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allows usage in frontend, though this should be done server-side in production
});

// Enhance the user's query for better search results
export async function enhanceQuery(query: string): Promise<string> {
  try {
    console.log('[OPENAI-ENHANCE] Starting query enhancement for:', query);
    
    if (!OPENAI_API_KEY) {
      console.warn('[OPENAI-ENHANCE] OpenAI API key not found. Using original query.');
      return query;
    }
    
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a market research optimization assistant. Your job is to enhance user queries for better search results. 
          
Focus on:
1. Adding relevant industry terms and specific metrics that would improve search results
2. Making the query more specific and searchable
3. Maintaining the core intent of the original query

DO NOT:
1. Add arbitrary timeframes or dates that weren't in the original query
2. Change the fundamental meaning or intent of the query
3. Add explanations or commentary
4. Add any content that wasn't implied by the original query

Return ONLY the enhanced query text with no additional explanation.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    const enhancedQuery = response.choices[0]?.message?.content?.trim() || query;
    const timeTaken = Date.now() - startTime;
    
    console.log('[OPENAI-ENHANCE] Enhancement completed in', timeTaken, 'ms');
    console.log('[OPENAI-ENHANCE] Original query:', query);
    console.log('[OPENAI-ENHANCE] Enhanced query:', enhancedQuery);
    
    return enhancedQuery;
  } catch (error) {
    console.error('[OPENAI-ENHANCE] Error enhancing query:', error);
    console.log('[OPENAI-ENHANCE] Falling back to original query');
    return query; // Fall back to original query if enhancement fails
  }
}

// Classify research data into Signal and Noise using our improved processor
export async function classifyData(
  researchData: ResearchData[],
  query: string
): Promise<ClassifiedData> {
  try {
    console.log('[OPENAI-CLASSIFY] Starting data classification for', researchData.length, 'items');
    console.log('[OPENAI-CLASSIFY] Query:', query);
    
    if (!OPENAI_API_KEY || !researchData.length) {
      console.warn('[OPENAI-CLASSIFY] OpenAI API key not found or no research data. Using mock classification.');
      return mockClassification(researchData, query);
    }
    
    // First pass: Use our new processing service to categorize and improve the content
    console.log('[OPENAI-CLASSIFY] Attempting to use new processing service first');
    const startProcessingTime = Date.now();
    
    try {
      const processedData = await processResearchData(researchData, query);
      const processingTime = Date.now() - startProcessingTime;
      console.log('[OPENAI-CLASSIFY] New processing completed in', processingTime, 'ms');
      
      // If we have reasonable results from the processor, use them directly
      if (processedData.signals.length > 0 || processedData.noise.length > 0) {
        console.log('[OPENAI-CLASSIFY] New processing service returned valid results:',
          processedData.signals.length, 'signals,',
          processedData.noise.length, 'noise items');
        return processedData;
      }
      
      console.log('[OPENAI-CLASSIFY] New processing service returned no valid results, falling back to legacy method');
    } catch (processingError) {
      console.error('[OPENAI-CLASSIFY] Error in new processing service:', processingError);
      console.log('[OPENAI-CLASSIFY] Falling back to legacy classification method');
    }
    
    // Fallback: Use the original classification if the processor didn't work well
    return classifyDataLegacy(researchData, query);
  } catch (error) {
    console.error('[OPENAI-CLASSIFY] Error in classification process:', error);
    console.log('[OPENAI-CLASSIFY] Falling back to legacy classification');
    // If the new processing fails, fall back to the legacy approach
    return classifyDataLegacy(researchData, query);
  }
}

// Legacy classification method as a fallback
async function classifyDataLegacy(
  researchData: ResearchData[],
  query: string
): Promise<ClassifiedData> {
  try {
    console.log('[OPENAI-LEGACY] Starting legacy classification for', researchData.length, 'items');
    
    if (!OPENAI_API_KEY || !researchData.length) {
      console.warn('[OPENAI-LEGACY] OpenAI API key not found or no research data. Using mock classification.');
      return mockClassification(researchData, query);
    }
    
    // Format research data for the prompt
    console.log('[OPENAI-LEGACY] Formatting research data for prompt');
    const formattedData = researchData.map((item, index) => {
      return `Item ${index + 1}:
Source: ${item.source}
Content: ${item.content}
URL: ${item.url || 'N/A'}
`;
    }).join('\n\n');
    
    // Create a prompt for classification
    console.log('[OPENAI-LEGACY] Sending request to OpenAI');
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a market intelligence analyst with expertise in filtering high-value insights from large volumes of data.
          
You'll analyze market research results and classify each item as either:
1. SIGNAL: High-impact, verified insights with significant strategic value
2. NOISE: Less relevant, unverified, or low-impact information

Important classification guidelines:
- Evaluate each item on its individual content quality and relevance, regardless of its source
- Sources from both research services should be judged equally - some from each may be signals, others noise
- Focus on factual information, clear insights, and actionable data when identifying signals
- Include specific sources that provide unique perspectives or valuable data points
- A mix of sources in both signals and noise categories is expected

Then, you'll provide a strategic decision recommendation based solely on the SIGNAL items.

Your output must follow this exact JSON format:
{
  "signals": [
    {"index": 0, "reason": "Explanation of why this is a signal"},
    {"index": 1, "reason": "Explanation of why this is a signal"}
  ],
  "noise": [
    {"index": 2, "reason": "Explanation of why this is noise"},
    {"index": 3, "reason": "Explanation of why this is noise"}
  ],
  "strategicDecision": "Provide a specific, actionable strategic recommendation (3-5 sentences) based on ALL research sources (both signals and noise) that includes: 1) A clear directive on what action to take, 2) Key factors from ALL the data supporting this decision, 3) Specific implementation steps or focus areas, and 4) Potential risks or considerations to be aware of. The recommendation should be practical, focused on immediate actionability, and avoid generic advice. Consider the entirety of the research, not just the signals."
}

Focus on providing a confident, clear strategic decision that would be useful for business leaders.`
        },
        {
          role: 'user',
          content: `Query: ${query}\n\nResearch Items:\n\n${formattedData}`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 2000
    });
    
    const timeTaken = Date.now() - startTime;
    console.log('[OPENAI-LEGACY] OpenAI response received in', timeTaken, 'ms');
    
    // Extract the classification results
    console.log('[OPENAI-LEGACY] Parsing OpenAI response');
    const responseContent = response.choices[0]?.message?.content || '{}';
    
    try {
      const result = JSON.parse(responseContent);
      
      // Log the basic structure of the result
      console.log('[OPENAI-LEGACY] Successfully parsed response JSON');
      console.log('[OPENAI-LEGACY] Signal count:', result.signals?.length || 0);
      console.log('[OPENAI-LEGACY] Noise count:', result.noise?.length || 0);
      console.log('[OPENAI-LEGACY] Has strategic decision:', !!result.strategicDecision);
      
      if (!result.signals || !result.noise) {
        console.warn('[OPENAI-LEGACY] Response missing required fields, falling back to mock classification');
        return mockClassification(researchData, query);
      }
      
      // Map the results back to the original research data
      console.log('[OPENAI-LEGACY] Mapping results back to original research data');
      const signals: ResearchData[] = (result.signals || [])
        .map((signal: {index: number, reason: string}) => {
          const item = researchData[signal.index];
          if (item) {
            console.log('[OPENAI-LEGACY] Signal reason for item', signal.index, ':', signal.reason.substring(0, 100) + '...');
            return {
              ...item,
              content: enhanceContentFormatting(item.content || '')
            };
          }
          return null;
        })
        .filter((item: ResearchData | null): item is ResearchData => item !== null);
      
      const noise: ResearchData[] = (result.noise || [])
        .map((noise: {index: number, reason: string}) => {
          const item = researchData[noise.index];
          if (item) {
            return {
              ...item,
              content: item.content
            };
          }
          return null;
        })
        .filter((item: ResearchData | null): item is ResearchData => item !== null);
      
      console.log('[OPENAI-LEGACY] Mapped', signals.length, 'signals and', noise.length, 'noise items');
      
      return {
        signals,
        noise,
        strategicDecision: result.strategicDecision || `Not enough data to provide a strategic decision for "${query}".`
      };
    } catch (parseError) {
      console.error('[OPENAI-LEGACY] Error parsing OpenAI response:', parseError);
      console.log('[OPENAI-LEGACY] Response content preview:', responseContent.substring(0, 200) + '...');
      console.log('[OPENAI-LEGACY] Falling back to mock classification');
      return mockClassification(researchData, query);
    }
  } catch (error) {
    console.error('[OPENAI-LEGACY] Error in legacy classification:', error);
    console.log('[OPENAI-LEGACY] Falling back to mock classification');
    return mockClassification(researchData, query);
  }
}

// Helper function to improve content formatting
function enhanceContentFormatting(content: string): string {
  // Simple content formatting improvements
  // Remove repetitive phrases
  let improved = content
    .replace(/(?:additionally|furthermore|moreover|in addition|besides),?\s+/gi, '')
    .replace(/(?:specifically|particularly|especially|in particular),?\s+/gi, '')
    .replace(/(?:generally|typically|usually|commonly|frequently|often),?\s+/gi, '')
    .replace(/it is (important|worth noting|notable|significant) (that|to note)?,?\s*/gi, '')
    .replace(/notably,?\s*/gi, '')
    .replace(/in conclusion,?\s*/gi, '')
    .replace(/to summarize,?\s*/gi, '')
    .replace(/in summary,?\s*/gi, '');
  
  // Ensure sentences end with proper punctuation
  if (!improved.match(/[.!?]$/)) {
    improved += '.';
  }
  
  return improved;
}

// Mock classification for testing and fallback
function mockClassification(researchData: ResearchData[], query: string): ClassifiedData {
  console.log('[OPENAI-MOCK] Using mock classification for', researchData.length, 'items');
  
  // Sort by confidence and filter out items without URLs
  const validData = researchData.filter(item => item.url && item.source);
  const sortedData = [...validData].sort((a, b) => b.confidence - a.confidence);
  
  // Take top 60% as signals if they meet minimum criteria
  const signalCount = Math.max(1, Math.floor(sortedData.length * 0.6));
  const signals = sortedData
    .slice(0, signalCount)
    .filter(item => item.confidence >= 0.5);
  
  // Rest are noise
  const noise = sortedData
    .slice(signalCount)
    .concat(sortedData.slice(0, signalCount).filter(item => item.confidence < 0.5));
  
  let strategicDecision = `Not enough high-confidence data available for "${query}" to make a strategic decision.`;
  
  if (signals.length > 0) {
    strategicDecision = `Based on high-confidence market research for "${query}", we recommend proceeding with market expansion while monitoring competitor consolidation trends. Strategic opportunities exist in differentiation through product innovation and targeted marketing to the most receptive customer segments identified in the data.`;
  }
  
  console.log('[OPENAI-MOCK] Mock classification complete -', signals.length, 'signals,', noise.length, 'noise items');
  
  return {
    signals,
    noise,
    strategicDecision,
  };
} 