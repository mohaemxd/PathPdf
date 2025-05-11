// Core functionality for interacting with Google's Gemini API

// Types for our roadmap data structure
export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  children: RoadmapNode[];
  parentId?: string;
}

export interface RoadmapData {
  title: string;
  rootNode: RoadmapNode;
}

/**
 * Processes PDF text content and generates a hierarchical roadmap using Gemini API
 * @param {string} pdfText - The extracted text content from the PDF
 * @param {string} title - The document title
 * @returns {Promise<RoadmapData>} - A hierarchical roadmap object
 */
export async function generateRoadmap(pdfText: string, title: string): Promise<RoadmapData> {
  try {
    // Handle cases where PDF content is too large
    const chunks = chunkContent(pdfText, 10000); // Split into chunks of ~10k chars
    
    // We'll use the first chunk for initial analysis, then refine with more if needed
    const response = await sendRoadmapPrompt(chunks[0], title);
    
    // Parse and validate the response
    const roadmapData = validateRoadmapData(response);
    
    // If we have multiple chunks and want to enhance the roadmap with more content
    // This could be implemented as a second pass refinement
    if (chunks.length > 1) {
      // This would be a more advanced implementation
      // Could use a second prompt to enhance specific branches with content from later chunks
    }
    
    return roadmapData;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw new Error("Failed to generate roadmap from PDF content");
  }
}

/**
 * Sends a prompt to Gemini API to generate roadmap structure
 * @param {string} textContent - Text content to analyze
 * @param {string} title - Document title for context
 * @returns {Promise<any>} - Raw API response
 */
async function sendRoadmapPrompt(textContent: string, title: string): Promise<any> {
  // Use the hard-coded API key
  const GEMINI_API_KEY = 'AIzaSyDpohz7Vh-WRMO8XUOBoYNP1yc5EnAQLFs';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  const prompt = `
You are an expert system for analyzing educational content and creating hierarchical learning roadmaps.

I'm providing the text content from a PDF document about "${title}".

Your task:
1. Identify the main topic/concept of this document
2. Identify 3-7 major sub-topics or concepts
3. For each sub-topic, identify further nested sub-topics (up to 3 levels deep)
4. For each node, provide a brief (1-2 sentence) description that will help a student understand what this concept covers
5. Make sure the hierarchy makes logical sense for learning progression

Format your response as a strict JSON object following this structure exactly:
{
  "title": "Main Topic Name",
  "rootNode": {
    "id": "node-1",
    "title": "Main Topic Name",
    "description": "Brief description of the main topic",
    "children": [
      {
        "id": "node-2",
        "title": "Sub-topic 1",
        "description": "Brief description of sub-topic 1",
        "children": []
      }
    ]
  }
}

Use "id" values like "node-1", "node-2", etc. Make sure every node has a unique ID.
Make descriptions concise but informative for students trying to understand the topic.
Return ONLY the JSON with NO additional explanation or text.

PDF Content:
${textContent}
`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text content from Gemini's response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response structure from Gemini API");
    }
    
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Find and parse the JSON in the response
    try {
      // Extract JSON object - handle case where API might return markdown code blocks
      const jsonMatch = textResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                         textResponse.match(/{[\s\S]*}/);
                         
      const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n?|```/g, '') : textResponse;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      throw new Error("Failed to parse roadmap data from API response");
    }
  } catch (error) {
    console.error("Gemini API request failed:", error);
    throw error;
  }
}

/**
 * Validates and fixes roadmap data
 * @param {any} data - The roadmap data to validate
 * @returns {RoadmapData} - Validated and potentially fixed roadmap data
 */
function validateRoadmapData(data: any): RoadmapData {
  // Basic validation
  if (!data || !data.title || !data.rootNode) {
    throw new Error("Invalid roadmap data structure");
  }
  
  // Ensure all nodes have unique IDs
  const ids = new Set<string>();
  const validateNode = (node: any, parentId: string | null = null): RoadmapNode => {
    // Ensure node has an ID
    if (!node.id) {
      node.id = `node-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Check for duplicate IDs
    if (ids.has(node.id)) {
      node.id = `node-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    ids.add(node.id);
    
    // Ensure other required properties
    if (!node.title) {
      node.title = "Untitled Node";
    }
    
    if (!node.description) {
      node.description = "No description available.";
    }
    
    // Initialize children array if not present
    if (!Array.isArray(node.children)) {
      node.children = [];
    }
    
    // Add parent reference for easier navigation
    if (parentId) {
      node.parentId = parentId;
    }
    
    // Recursively validate children
    node.children.forEach((child: any) => validateNode(child, node.id));
    
    return node as RoadmapNode;
  };
  
  // Start validation from root node
  validateNode(data.rootNode);
  
  return data as RoadmapData;
}

/**
 * Splits content into manageable chunks for API processing
 * @param {string} content - The content to split
 * @param {number} maxLength - Maximum chunk length
 * @returns {Array<string>} - Array of content chunks
 */
function chunkContent(content: string, maxLength: number): string[] {
  if (!content || content.length <= maxLength) {
    return [content];
  }
  
  const chunks: string[] = [];
  
  // Try to split on paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxLength) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      // If current paragraph would exceed chunk size
      
      // Save current chunk if not empty
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      
      // Handle case where single paragraph exceeds max length
      if (paragraph.length > maxLength) {
        // Split by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= maxLength) {
            currentChunk += (currentChunk ? " " : "") + sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
            }
            currentChunk = sentence.length <= maxLength ? sentence : sentence.substring(0, maxLength);
            if (currentChunk !== sentence) {
              chunks.push(currentChunk);
              currentChunk = "";
            }
          }
        }
      } else {
        currentChunk = paragraph;
      }
    }
  }
  
  // Add the last chunk if not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Enhances existing roadmap with more details from additional content
 * This would be a more advanced feature for future implementation
 */
export async function enhanceRoadmap(existingRoadmap: RoadmapData, additionalContent: string): Promise<RoadmapData> {
  // Implementation for future enhancement
  return existingRoadmap;
}
