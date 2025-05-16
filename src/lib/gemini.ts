// Core functionality for interacting with Google's Gemini API

// Types for our roadmap data structure
export interface Resource {
  type: string;
  label: string;
  url: string;
  free: boolean;
  discount?: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  image?: {
    url: string;
    alt: string;
    caption?: string;
  };
  children: RoadmapNode[];
  parentId?: string;
  resources: Resource[];
}

export interface RoadmapData {
  title: string;
  rootNode: RoadmapNode;
}

/**
 * Processes PDF structured content and generates a hierarchical roadmap using Gemini API
 * @param {Array<{type: string, text: string}>} structuredContent - The extracted structured content from the PDF
 * @param {string} title - The document title
 * @returns {Promise<RoadmapData>} - A hierarchical roadmap object
 */
export async function generateRoadmap(structuredContent: Array<{type: string, text: string}>, title: string): Promise<RoadmapData> {
  try {
    // Convert structured content to a readable string for the prompt
    const contentForPrompt = structuredContent.map(item => {
      return item.type === 'heading' ? `\n# ${item.text}\n` : item.text;
    }).join(' ');
    // Handle cases where content is too large
    const chunks = chunkContent(contentForPrompt, 10000); // Split into chunks of ~10k chars
    // We'll use the first chunk for initial analysis, then refine with more if needed
    const response = await sendRoadmapPrompt(chunks[0], title);
    console.log('Raw Gemini API response:', response);
    // Parse and validate the response
    const roadmapData = validateRoadmapData(response);
    console.log('Parsed roadmap data before validation:', roadmapData);
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
 * @param {string} textContent - Structured text content to analyze
 * @param {string} title - Document title for context
 * @returns {Promise<any>} - Raw API response
 */
async function sendRoadmapPrompt(textContent: string, title: string): Promise<any> {
  const GEMINI_API_KEY = 'AIzaSyDpohz7Vh-WRMO8XUOBoYNP1yc5EnAQLFs'; // Replace with your actual key
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
Given the following structured content from a PDF, generate a hierarchical learning roadmap as a JSON object with this exact structure:

{
  "title": "<roadmap title>",
  "rootNode": {
    "id": "node-1",
    "title": "<root topic>",
    "description": "<short description>",
    "detailedDescription": "<detailed explanation of the topic, including what it is, why it matters, and any important context or examples>",
    "image": {
      "url": "<URL to a relevant image that helps explain the concept visually>",
      "alt": "<descriptive alt text for the image>",
      "caption": "<optional caption explaining the image>"
    },
    "resources": [
      {
        "type": "article|video|course|documentation|other",
        "label": "<resource title>",
        "url": "<resource url>",
        "free": true|false,
        "discount": "<optional discount or note>"
      }
    ],
    "children": [
      {
        "id": "node-2",
        "title": "<subtopic>",
        "description": "<short description>",
        "detailedDescription": "<detailed explanation of the subtopic>",
        "image": {
          "url": "<URL to a relevant image that helps explain the concept visually>",
          "alt": "<descriptive alt text for the image>",
          "caption": "<optional caption explaining the image>"
        },
        "resources": [ ... ],
        "children": [ ... ]
      }
    ]
  }
}

- For each topic (node), provide BOTH a concise 'description' (1-2 sentences) and a much more in-depth 'detailedDescription' (several sentences or a paragraph) that explains the topic, its importance, and any relevant context or examples.
- For topics that would benefit from visual explanation, include an 'image' object with a URL to a relevant image, descriptive alt text, and an optional caption. The image should be educational and help clarify the concept. Only use images from Wikimedia Commons, Unsplash, or other open/free sources that allow direct linking and hotlinking. Do not use images from sites that block hotlinking or require authentication.
- For each topic (node), provide a list of 2-4 learning resources (articles, videos (especially YouTube videos, make sure to search for that as students like that resource, and give the correct YouTube URL), courses, documentation, etc.) with their type, label, url, free (true/false), and optional discount.
- For each Topic (node), make sure if the topic has talked about some different subtopics or examples/implementations/applications/functions/etc, you assign a subnode to each one of those subtopics.
- Assign sequential "id" values ("node-1", "node-2", etc.) ensuring each node has a unique ID
- Make the descriptions learner-focused, by referring to online resources, so that you would be able to perfectly and concisely explain both WHAT the topic is about in detail and do not overlook any mentioned information in the content and WHY that topic matters, if the information is incomplete or lacks details you add those details
- For the number of levels the hierarchical tree would have there are no limits, it would depend on the complexity of the content and the depth of the topic.
- Return ONLY the JSON with NO additional explanation or text

Structured PDF Content:
${textContent}
`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
      console.error("Invalid response structure from Gemini API", data);
      throw new Error("Invalid response structure from Gemini API: " + JSON.stringify(data));
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
      console.error("Failed to parse Gemini response:", parseError, textResponse);
      throw new Error("Failed to parse roadmap data from API response: " + (parseError instanceof Error ? parseError.message : parseError));
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

    // Ensure detailedDescription exists
    if (!node.detailedDescription) {
      node.detailedDescription = "";
    }
    // Preserve image if present
    if (node.image && typeof node.image === 'object') {
      node.image = {
        url: node.image.url || '',
        alt: node.image.alt || '',
        caption: node.image.caption || ''
      };
    } else {
      node.image = undefined;
    }
    
    // Initialize children array if not present
    if (!Array.isArray(node.children)) {
      node.children = [];
    }
    
    // Ensure resources array exists
    if (!Array.isArray(node.resources)) {
      node.resources = [];
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
