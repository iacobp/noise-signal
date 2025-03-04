import { OpenAI } from 'openai';
import { ResearchData, ClassifiedData } from '@/types';

// This would be stored in environment variables in a real app
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allows usage in frontend, though this should be done server-side in production
});

// Constants
// Removing unused constants
// const MAX_BATCH_SIZE = 10;
// const CHUNK_SIZE = 10;

// System prompt for OpenAI
const SYSTEM_PROMPT = `You are a strategic market intelligence analyst with expertise in extracting valuable insights from large volumes of research data.

Your task is to analyze the provided market research items and:

1. Classify EVERY item as either SIGNAL (high-value, verified, impactful) or NOISE (less relevant, unverified, low-impact)
2. COMPLETELY REWRITE both signal and noise content to improve readability and clarity
3. For SIGNAL items: Reformat and enhance content as 3-5 well-formatted bullet points
4. For NOISE items: Rewrite as coherent, readable paragraphs with proper grammar and sentence structure
5. Extract key statistics and metrics from SIGNAL items
6. Create a strategic recommendation based on the SIGNAL items

Follow these rules when processing the data:
- Be confident and decisive in your classification - if you're uncertain about an item, it's NOISE
- IMPORTANT: You MUST classify EVERY item in the input as either SIGNAL or NOISE - do not skip any items
- Evaluate each item on its individual merit regardless of source
- SIGNALS must contain specific data, metrics, or actionable insights - general information is NOISE
- REWRITE ALL content to ensure highest readability regardless of original quality - do not simply copy original text
- For SIGNAL items: Create clear, impactful bullet points highlighting key information
- For NOISE items: Write 1-2 coherent paragraphs that summarize the content professionally
- NEVER include phrases like "Referenced as in the analysis" or "Confidence: X%" in your output
- Do not include references to markdown formatting or analysis numbering
- Ensure all text is well-formatted with complete sentences and proper punctuation
- Identify high-quality signals based strictly on content value, not quantity targets
- For URLs, ensure they are properly attributed and direct links (not search links)

Your response must be valid JSON with this exact structure:
{
  "signals": [
    {
      "index": 0,
      "content": "• First important bullet point with complete sentence.\n• Second important bullet point with key insight.\n• Third bullet point that completes the thought.",
      "reason": "Explanation of why this is a signal"
    }
  ],
  "noise": [
    {
      "index": 3,
      "content": "A cohesive, well-written paragraph summarizing this less relevant information. This should be completely rewritten from the original text to ensure maximum readability and professional quality. Include relevant details while maintaining clear sentence structure.",
      "reason": "Explanation of why this is noise"
    }
  ],
  "statistics": [
    "Statistic 1: Specific numerical data point extracted from signals",
    "Statistic 2: Another specific numerical data point"
  ],
  "strategicDecision": "Provide a specific, actionable strategic recommendation based on ALL research sources that includes:\n\n1) A clear directive on what action to take\n2) Key factors from the data supporting this decision\n3) Specific implementation steps or focus areas\n4) Potential risks or considerations to be aware of\n\nFormat this as 3-5 well-structured paragraphs with clear line breaks between paragraphs. The recommendation should be practical, focused on immediate actionability, and avoid generic advice."
}`;

// Helper function to derive a query if none is provided
export function deriveQueryFromResearchData(researchData: ResearchData[]): string | null {
  console.log('[OPENAI-PROCESS] Attempting to derive query from research data');
  
  if (!researchData.length) return null;
  
  // Extract the most common words from all content to guess the topic
  const allContent = researchData.map(item => item.content || '').join(' ');
  const words = allContent.toLowerCase().split(/\W+/).filter(word => 
    word.length > 3 && 
    !['about', 'there', 'their', 'would', 'should', 'could', 'while', 'these', 'those', 'have', 'this', 'that'].includes(word)
  );
  
  // Find most frequent words
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort words by frequency
  const sortedWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  if (sortedWords.length) {
    const derivedQuery = `Latest market trends about ${sortedWords.join(' ')}`;
    console.log('[OPENAI-PROCESS] Derived query:', derivedQuery);
    return derivedQuery;
  }
  
  console.log('[OPENAI-PROCESS] Failed to derive meaningful query');
  return null;
}

// Main function to process research data with OpenAI
export async function processResearchData(
  researchData: ResearchData[],
  query?: string
): Promise<ClassifiedData> {
  console.log('[OPENAI-PROCESS] Starting OpenAI processing for', researchData.length, 'items');
  console.log('[OPENAI-PROCESS] Using query:', query);
  
  // Fallback if no OpenAI key is available or no data to process
  if (!OPENAI_API_KEY) {
    console.warn('[OPENAI-PROCESS] OpenAI API key not found. Using simple categorization.');
    return simpleCategorization(researchData);
  }
  
  try {
    // If no query was provided, try to derive one from the content
    const queryToUse = query || deriveQueryFromResearchData(researchData) || 'market research';
    
    // Limit to 25 sources to ensure proper processing
    const MAX_SOURCES = 25;
    let limitedResearchData = researchData;
    
    if (researchData.length > MAX_SOURCES) {
      console.log(`[OPENAI-PROCESS] Limiting sources from ${researchData.length} to ${MAX_SOURCES} for optimal processing`);
      // Sort by confidence to prioritize higher quality sources
      limitedResearchData = [...researchData]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_SOURCES);
    }
    
    // Prepare research data for the prompt
    console.log('[OPENAI-PROCESS] Preparing data for OpenAI processing');
    const formattedData = limitedResearchData.map((item, index) => {
      return `Item ${index + 1}:
Source: ${item.source || 'Unknown'}
Content: ${item.content || 'No content available'}
URL: ${item.url || 'N/A'}
From: ${item.fetchedBy || 'Unknown service'}
`;
    }).join('\n\n');
    
    console.log('[OPENAI-PROCESS] Request data prepared, size:', formattedData.length, 'characters');
    
    // If we have a large number of items, we need to process them in chunks
    const MAX_ITEMS_PER_REQUEST = 25;
    let signals: any[] = [];
    let noise: any[] = [];
    let statistics: string[] = [];
    let strategicDecision = '';
    
    // Process in chunks if needed
    if (limitedResearchData.length > MAX_ITEMS_PER_REQUEST) {
      console.log(`[OPENAI-PROCESS] Large dataset (${limitedResearchData.length} items) - processing in chunks`);
      
      // Process items in chunks
      for (let i = 0; i < limitedResearchData.length; i += MAX_ITEMS_PER_REQUEST) {
        const chunkData = limitedResearchData.slice(i, i + MAX_ITEMS_PER_REQUEST);
        console.log(`[OPENAI-PROCESS] Processing chunk ${i/MAX_ITEMS_PER_REQUEST + 1} with ${chunkData.length} items`);
        
        // If this is the last chunk and it only has very few items (less than 3), 
        // merge it with strategic decision from first chunk instead of processing separately
        if (i > 0 && i + MAX_ITEMS_PER_REQUEST >= limitedResearchData.length && chunkData.length < 3) {
          console.log(`[OPENAI-PROCESS] Last chunk has only ${chunkData.length} items - using simplified processing`);
          const simpleResult = simpleCategorizeChunk(chunkData);
          signals = [...signals, ...simpleResult.signals];
          noise = [...noise, ...simpleResult.noise];
          continue;
        }
        
        const chunkFormattedData = chunkData.map((item, index) => {
          return `Item ${i + index + 1}:
Source: ${item.source || 'Unknown'}
Content: ${item.content || 'No content available'}
URL: ${item.url || 'N/A'}
From: ${item.fetchedBy || 'Unknown service'}
`;
        }).join('\n\n');
        
        // Process this chunk
        const chunkResult = await processChunk(chunkFormattedData, queryToUse, i);
        
        // Combine results
        signals = [...signals, ...chunkResult.signals];
        noise = [...noise, ...chunkResult.noise];
        
        // Only use statistics and strategic decision from the first chunk
        if (i === 0) {
          statistics = chunkResult.statistics || [];
          strategicDecision = chunkResult.strategicDecision || '';
        }
      }
      
      console.log('[OPENAI-PROCESS] Successfully processed all chunks with', 
        signals.length, 'total signals and', 
        noise.length, 'total noise items');
    } else {
      // Process all at once for smaller datasets
      const result = await processChunk(formattedData, queryToUse, 0);
      signals = result.signals || [];
      noise = result.noise || [];
      statistics = result.statistics || [];
      strategicDecision = result.strategicDecision || '';
    }
    
    // Process the results
    console.log('[OPENAI-PROCESS] Successfully parsed response with', 
      signals.length, 'signals and', 
      noise.length, 'noise items');
    
    if (statistics) {
      console.log('[OPENAI-PROCESS] Extracted', statistics.length, 'statistics');
    }
    
    // Map the enhanced signals back to research data
    const enhancedSignals: ResearchData[] = signals
      .map((signal: {index: number, content: string, reason: string}) => {
        const originalItem = limitedResearchData[signal.index];
        if (originalItem) {
          // Use the enhanced content from GPT if available, otherwise use original
          return {
            ...originalItem,
            content: formatSignalContent(signal.content) || originalItem.content,
            confidence: 0.95 // High confidence for AI-enhanced signals
          };
        }
        return null;
      })
      .filter((item: ResearchData | null): item is ResearchData => item !== null);
    
    // Map the noise items with improved formatting
    const noiseItems: ResearchData[] = noise
      .map((noise: {index: number, reason: string, content?: string}) => {
        const originalItem = researchData[noise.index];
        if (originalItem) {
          // Use the enhanced content from GPT if available, otherwise format the original
          const noiseContent = noise.content 
            ? noise.content 
            : formatNoiseContent(originalItem.content);
          
          return {
            ...originalItem,
            content: noiseContent,
            confidence: 0.4 // Lower confidence for noise
          };
        }
        return null;
      })
      .filter((item: ResearchData | null): item is ResearchData => item !== null);
    
    // Add statistics if available
    const formattedStatistics: ResearchData[] = statistics.map((stat: string, i: number) => {
      // Find a good source to attribute this to - pick from our signals if possible
      const attributionSource = enhancedSignals.length > 0 
        ? enhancedSignals[Math.min(i, enhancedSignals.length - 1)] 
        : (researchData.length > 0 ? researchData[Math.min(i, researchData.length - 1)] : null);
      
      if (attributionSource) {
        return {
          source: `Statistical Analysis: ${attributionSource.source}`,
          content: stat,
          url: attributionSource.url,
          confidence: 0.99,
          fetchedBy: attributionSource.fetchedBy || 'perplexity',
          timestamp: new Date().toISOString()
        };
      } else {
        // Fallback if we somehow have no sources
        return {
          source: 'Market Analysis Statistics',
          content: stat,
          url: '',
          confidence: 0.99,
          fetchedBy: 'perplexity',
          timestamp: new Date().toISOString()
        };
      }
    });
    
    console.log('[OPENAI-PROCESS] Final processed data:', 
      enhancedSignals.length, 'enhanced signals,', 
      noiseItems.length, 'noise items,',
      formattedStatistics.length, 'statistics');
    
    // Return the classified and enhanced data
    return {
      signals: [...enhancedSignals, ...formattedStatistics],
      noise: noiseItems,
      strategicDecision: strategicDecision || `Insufficient data to provide a strategic decision for "${queryToUse}".`
    };
  } catch (error) {
    console.error('[OPENAI-PROCESS] Error in OpenAI processing:', error);
    console.log('[OPENAI-PROCESS] Falling back to simple categorization');
    return simpleCategorization(researchData);
  }
}

// Simple categorization as a fallback
function simpleCategorization(researchData: ResearchData[]): ClassifiedData {
  console.log('[OPENAI-PROCESS] Using simple categorization for', researchData.length, 'items');
  
  // Sort by confidence first
  const sortedData = [...researchData].sort((a, b) => b.confidence - a.confidence);
  
  // Aim for approximately 60% signals, 40% noise with a minimum of 5 signals if possible
  const targetSignalCount = Math.max(5, Math.ceil(sortedData.length * 0.6));
  
  // Simple approach based on content length, confidence, and source
  const signals = sortedData
    .filter((item, index) => {
      // Items with longer content and from reliable sources tend to be more valuable
      const contentLength = (item.content || '').length;
      const hasContent = contentLength > 100;
      const hasUrl = !!item.url;
      const highConfidence = item.confidence > 0.5;
      
      // Either high confidence or good content and URL
      return (highConfidence || (hasContent && hasUrl)) && index < targetSignalCount;
    });
  
  // Everything else is noise
  const noise = sortedData
    .filter(item => !signals.some(s => s.source === item.source && s.content === item.content));
  
  console.log(`[OPENAI-PROCESS] Simple categorization: ${signals.length} signals, ${noise.length} noise`);
  
  return {
    signals,
    noise,
    strategicDecision: signals.length > 0 
      ? 'Based on the available data, we recommend proceeding with caution while gathering more specific market information to validate these initial findings.'
      : 'Insufficient high-quality data available to make a strategic decision. Recommend conducting more targeted research.'
  };
}

// Helper function for simple categorization of small chunks
function simpleCategorizeChunk(chunkData: ResearchData[]): any {
  console.log('[OPENAI-PROCESS] Using simple categorization for small chunk');
  
  // Sort by confidence first
  const sortedData = [...chunkData].sort((a, b) => b.confidence - a.confidence);
  
  // Aim for approximately 60% signals, 40% noise
  const targetSignalCount = Math.ceil(sortedData.length * 0.6);
  
  // Simple approach based on content length and source quality
  const signals = sortedData
    .filter((item, index) => {
      // Items with longer content and from reliable sources tend to be more valuable
      const contentLength = (item.content || '').length;
      return (contentLength > 200 || item.confidence > 0.5) && index < targetSignalCount;
    })
    .map(item => {
      // Create simplified enhanced content - just use original with minor formatting
      return {
        source: item.source || 'Unknown Source',
        content: item.content || 'No content available',
        url: item.url || '',
        confidence: item.confidence || 0.5,
        fetchedBy: item.fetchedBy || 'perplexity',
        timestamp: item.timestamp || new Date().toISOString()
      };
    });
  
  // Everything else is noise
  const noise = sortedData
    .filter(item => !signals.some(s => s.source === item.source && s.content === item.content));
  
  console.log(`[OPENAI-PROCESS] Simple chunk categorization: ${signals.length} signals, ${noise.length} noise`);
  
  return {
    signals,
    noise
  };
}

// Helper function to process a chunk of research data
async function processChunk(formattedData: string, queryToUse: string, startIndex: number): Promise<any> {
  try {
    const startTime = Date.now();
    // Count how many items are in the input
    const itemCount = (formattedData.match(/Item \d+:/g) || []).length;
    console.log(`[OPENAI-PROCESS] Processing chunk with ${itemCount} items`);
    
    // Make the OpenAI request
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Query: ${queryToUse}\n\nResearch Items:\n\n${formattedData}`
        }
      ]
    });
    
    const timeTaken = Date.now() - startTime;
    console.log(`[OPENAI-PROCESS] Chunk processed in ${timeTaken} ms`);
    
    // Parse the response
    const responseContent = response.choices[0]?.message?.content || '{}';
    
    try {
      // First attempt to parse the response directly
      let result = JSON.parse(responseContent);
      
      // Log the classification coverage
      const signalCount = result.signals?.length || 0;
      const noiseCount = result.noise?.length || 0;
      console.log(`[OPENAI-PROCESS] Classification coverage: ${signalCount + noiseCount}/${itemCount} items classified (${signalCount} signals, ${noiseCount} noise)`);
      
      // Adjust the indices for chunked processing
      if (startIndex > 0 && result.signals) {
        result.signals = result.signals.map((signal: any) => ({
          ...signal,
          index: signal.index + startIndex
        }));
      }
      
      if (startIndex > 0 && result.noise) {
        result.noise = result.noise.map((noise: any) => ({
          ...noise,
          index: noise.index + startIndex
        }));
      }
      
      return result;
    } catch (parseError) {
      console.error('[OPENAI-PROCESS] Error parsing chunk response:', parseError);
      return { signals: [], noise: [], statistics: [], strategicDecision: '' };
    }
  } catch (error) {
    console.error('[OPENAI-PROCESS] Error processing chunk:', error);
    return { signals: [], noise: [], statistics: [], strategicDecision: '' };
  }
}

// Helper function to format signal content with proper bullet points
function formatSignalContent(content: string): string {
  if (!content) return '';

  // Remove statistical analysis prefixes
  content = content.replace(/^Statistical Analysis:\s*/gm, '');
  
  // Remove reference numbers like "[1]", "[2]", etc.
  content = content.replace(/\[(\d+)\]\s*/g, '');

  // If content already has bullet points, ensure they're properly formatted
  if (content.includes('•') || content.includes('-') || content.includes('*')) {
    return content
      .split(/[\n\r]+/)
      .map(line => {
        // Clean up existing bullet points
        line = line.trim();
        
        // Skip empty lines
        if (line.length === 0) return '';
        
        // Skip lines that are just URLs or confidence indicators
        if (line.match(/^https?:\/\//) || line.match(/^Confidence: \d+%$/)) {
          return '';
        }
        
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          // Ensure proper spacing and consistent bullet character
          line = line.replace(/^[•\-*]\s*/, '• ');
          
          // Extract the actual content after the bullet
          const bulletContent = line.substring(2).trim();
          
          // Skip if it's empty after removing the bullet
          if (bulletContent.length === 0) return '';
          
          // Capitalize first letter if it's not
          const firstChar = bulletContent.charAt(0);
          const restOfLine = bulletContent.slice(1);
          line = '• ' + firstChar.toUpperCase() + restOfLine;
          
          // Ensure ending with proper punctuation if it's a sentence
          if (line.length > 10 && !line.endsWith('.') && !line.endsWith('!') && !line.endsWith('?')) {
            line += '.';
          }
        } else {
          // Non-bulleted lines might need to be bulleted
          if (line.length > 10) {
            // Capitalize first letter
            line = '• ' + line.charAt(0).toUpperCase() + line.slice(1);
            
            // Ensure ending with proper punctuation
            if (!line.endsWith('.') && !line.endsWith('!') && !line.endsWith('?')) {
              line += '.';
            }
          }
        }
        return line;
      })
      .filter(line => line.length > 0)
      .join('\n');
  }

  // If content doesn't have bullet points, add them
  // First split into paragraphs, then into sentences
  const paragraphs = content.split(/[\n\r]+/);
  const formattedBullets = [];
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) continue;
    
    // If it's a short paragraph, treat it as one bullet
    if (paragraph.length < 100) {
      let bullet = '• ' + paragraph.trim();
      
      // Capitalize first letter
      bullet = bullet.charAt(0) + bullet.charAt(1).toUpperCase() + bullet.slice(2);
      
      // Ensure proper ending punctuation
      if (!bullet.endsWith('.') && !bullet.endsWith('!') && !bullet.endsWith('?')) {
        bullet += '.';
      }
      
      formattedBullets.push(bullet);
    } else {
      // For longer paragraphs, split into sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (sentence.trim().length === 0) continue;
        
        let bullet = '• ' + sentence.trim();
        
        // Capitalize first letter
        bullet = bullet.charAt(0) + bullet.charAt(1).toUpperCase() + bullet.slice(2);
        
        // Ensure proper ending punctuation
        if (!bullet.endsWith('.') && !bullet.endsWith('!') && !bullet.endsWith('?')) {
          bullet += '.';
        }
        
        formattedBullets.push(bullet);
      }
    }
  }
  
  return formattedBullets.join('\n');
}

// Helper function to format noise content to be more readable
function formatNoiseContent(content: string): string {
  if (!content) return '';

  // Check if the content is just a URL placeholder
  if (content.includes('Content summary not available for this resource') || 
      content.includes('Please visit the source directly:')) {
    const urlMatch = content.match(/https?:\/\/[^\s\n.]+\.[^\s\n]+/);
    const url = urlMatch ? urlMatch[0] : '';
    return `This resource requires direct access to view its content. You can find it at: ${url}`;
  }

  // Remove any Source/References/URL sections at the end that often appear in AI-generated content
  content = content.replace(/\n+Sources:[\s\S]*$/, '');
  content = content.replace(/\n+References:[\s\S]*$/, '');
  content = content.replace(/\n+URLs?:[\s\S]*$/, '');
  
  // Remove reference numbers like "[1]", "[2]", etc.
  content = content.replace(/\[(\d+)\](?:\s*|\:)/g, '');
  
  // Remove recurring patterns that appear in the text
  content = content.replace(/Referenced as (?:\[\d+\]|[^.]+) in the analysis\.\s*/g, '');
  content = content.replace(/Referenced as in the analysis\.\s*/g, '');
  content = content.replace(/Confidence: \d+%\s*/g, '');
  
  // Remove any repeated sections that appear multiple times
  let prevContent = '';
  while (prevContent !== content) {
    prevContent = content;
    // Find repeated phrases of 10+ characters that appear multiple times
    const phrases = content.match(/([A-Za-z][^.!?]{10,}[.!?])\s+\1/g);
    if (phrases) {
      for (const phrase of phrases) {
        const singlePhrase = phrase.match(/([A-Za-z][^.!?]{10,}[.!?])/)?.[1] || '';
        if (singlePhrase) {
          // Replace repeated phrase with single occurrence
          content = content.replace(new RegExp(escapeRegExp(phrase), 'g'), singlePhrase);
        }
      }
    }
  }
  
  // Remove bullet points (•, -, *) at the beginning of lines but keep the text
  content = content.replace(/^[•\-*]\s*/gm, '');
  
  // Smart paragraph handling - split by multiple newlines
  let paragraphs = content.split(/\n{2,}/);
  
  // Process each paragraph
  paragraphs = paragraphs.map(paragraph => {
    // Skip empty paragraphs
    if (!paragraph.trim()) return '';
    
    // Skip paragraphs that are just URLs
    if (paragraph.trim().match(/^https?:\/\//)) return '';
    
    // Clean up any multiple spaces
    paragraph = paragraph.replace(/\s{2,}/g, ' ');
    
    // Handle any single line breaks within a paragraph
    paragraph = paragraph.replace(/\n/g, ' ');
    
    // Trim whitespace
    paragraph = paragraph.trim();
    
    // Skip if after all cleaning it's too short
    if (paragraph.length < 10) return '';
    
    // Ensure proper capitalization of first letter
    paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
    
    // Ensure paragraph ends with proper punctuation
    if (!paragraph.endsWith('.') && !paragraph.endsWith('!') && !paragraph.endsWith('?')) {
      paragraph += '.';
    }
    
    return paragraph;
  }).filter(p => p); // Remove empty paragraphs
  
  // Combine short paragraphs that might be related
  const combinedParagraphs: string[] = [];
  let currentParagraph = '';
  
  for (const paragraph of paragraphs) {
    if (paragraph.length < 60 && currentParagraph && 
        !currentParagraph.endsWith(':') && !paragraph.includes('http')) {
      // If current paragraph is short and doesn't end with a colon, combine with previous
      currentParagraph += ' ' + paragraph;
    } else {
      // Otherwise start a new paragraph
      if (currentParagraph) {
        combinedParagraphs.push(currentParagraph);
      }
      currentParagraph = paragraph;
    }
  }
  
  // Add the last paragraph
  if (currentParagraph) {
    combinedParagraphs.push(currentParagraph);
  }
  
  // If we have no paragraphs after processing, try to salvage by treating sentences individually
  if (combinedParagraphs.length === 0) {
    const sentences = content.replace(/\n/g, ' ').split(/(?<=[.!?])\s+/);
    return sentences.filter(s => s.trim().length > 15).map(s => {
      // Ensure proper capitalization and ending punctuation
      let sentence = s.trim();
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      if (!sentence.endsWith('.') && !sentence.endsWith('!') && !sentence.endsWith('?')) {
        sentence += '.';
      }
      return sentence;
    }).join(' ');
  }
  
  // Final cleanup of any remaining markup-like artifacts
  return combinedParagraphs.join('\n\n')
    .replace(/\[\s*...\s*\]/g, '') // Remove "[...]"
    .replace(/\s+\./g, '.') // Fix spaces before periods
    .replace(/\.\s+\./g, '.') // Fix double periods
    .replace(/\s{2,}/g, ' '); // Final cleanup of multiple spaces
}

// Helper function to escape special characters in strings for use in RegExp
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 