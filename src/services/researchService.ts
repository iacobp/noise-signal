import { fetchPerplexityData } from './perplexityService';
import { fetchExaData } from './exaService';
import { classifyData, enhanceQuery } from './openaiService';
import { ResearchData, ClassifiedData } from '@/types';

// Fetch research data from multiple sources and combine them
export async function fetchResearchData(query: string): Promise<ResearchData[]> {
  console.log('[RESEARCH] Starting research data fetch for query:', query);
  
  try {
    // Enhance query using OpenAI
    console.log('[RESEARCH] Enhancing query...');
    const startEnhance = Date.now();
    const enhancedQuery = await enhanceQuery(query);
    console.log(`[RESEARCH] Query enhanced in ${Date.now() - startEnhance} ms`);
    console.log('[RESEARCH] Original:', query);
    console.log('[RESEARCH] Enhanced:', enhancedQuery);
    
    // Run API calls in parallel
    console.log('[RESEARCH] Fetching data from Perplexity and Exa APIs in parallel...');
    const startFetch = Date.now();
    
    const [perplexityData, exaData] = await Promise.all([
      fetchPerplexityData(enhancedQuery).catch(error => {
        console.error('[RESEARCH] Error fetching from Perplexity:', error);
        return [];
      }),
      fetchExaData(enhancedQuery).catch(error => {
        console.error('[RESEARCH] Error fetching from Exa:', error);
        return [];
      })
    ]);
    
    console.log(`[RESEARCH] Data fetched in ${Date.now() - startFetch} ms`);
    console.log('[RESEARCH] Perplexity returned', perplexityData.length, 'items');
    console.log('[RESEARCH] Exa returned', exaData.length, 'items');
    
    if (perplexityData.length > 0) {
      console.log('[RESEARCH] Perplexity sample:', perplexityData[0]);
    }
    
    if (exaData.length > 0) {
      console.log('[RESEARCH] Exa sample:', exaData[0]);
    }
    
    // Combine research data
    let combinedData = [...perplexityData, ...exaData];
    
    // Limit to 25 total sources for optimal processing
    const MAX_TOTAL_SOURCES = 25;
    if (combinedData.length > MAX_TOTAL_SOURCES) {
      console.log(`[RESEARCH] Limiting combined sources from ${combinedData.length} to ${MAX_TOTAL_SOURCES}`);
      
      // Sort by confidence to prioritize higher quality sources
      combinedData = combinedData
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, MAX_TOTAL_SOURCES);
    }
    
    console.log('[RESEARCH] Combined', combinedData.length, 'items');
    
    return combinedData;
  } catch (error) {
    console.error('[RESEARCH] Error fetching research data:', error);
    return [];
  }
}

// Process the research query and classify data
export async function processResearchQuery(query: string): Promise<ClassifiedData> {
  console.log('[RESEARCH-PROCESS] Starting research process for query:', query);
  const startTime = Date.now();
  
  try {
    // Fetch the raw research data
    console.log('[RESEARCH-PROCESS] Fetching research data...');
    const researchData = await fetchResearchData(query);
    console.log('[RESEARCH-PROCESS] Received', researchData.length, 'research data items');
    
    if (researchData.length === 0) {
      console.warn('[RESEARCH-PROCESS] No research data found for query');
      return {
        signals: [],
        noise: [],
        strategicDecision: `No research data found for: ${query}`
      };
    }
    
    // Classify the data into signal and noise
    console.log('[RESEARCH-PROCESS] Classifying research data...');
    const classificationStartTime = Date.now();
    const classifiedData = await classifyData(researchData, query);
    const classificationTime = Date.now() - classificationStartTime;
    console.log('[RESEARCH-PROCESS] Classification completed in', classificationTime, 'ms');
    
    console.log('[RESEARCH-PROCESS] Classification results:');
    console.log('[RESEARCH-PROCESS] Signals:', classifiedData.signals.length);
    console.log('[RESEARCH-PROCESS] Noise:', classifiedData.noise.length);
    console.log('[RESEARCH-PROCESS] Strategic decision preview:', 
      classifiedData.strategicDecision?.substring(0, 100) + '...');
    
    const totalTime = Date.now() - startTime;
    console.log('[RESEARCH-PROCESS] Total processing time:', totalTime, 'ms');
    
    return classifiedData;
  } catch (error) {
    console.error('[RESEARCH-PROCESS] Error processing research query:', error);
    return {
      signals: [],
      noise: [],
      strategicDecision: `Error processing query: ${error}`
    };
  }
} 