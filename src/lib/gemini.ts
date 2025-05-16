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
  children: RoadmapNode[];
  parentId?: string;
  resources: Resource[];
}

export interface RoadmapData {
  title: string;
  rootNode: RoadmapNode;
}

// Define a function that returns the prompt template (using a parameter instead of an undefined variable)
function getPrompt(content: string) {
  return `
Given the following structured content from a PDF, generate a hierarchical learning roadmap as a JSON object with this exact structure:

{
  "title": "<roadmap title>",
  "rootNode": {
    "id": "node-1",
    "title": "<root topic>",
    "description": "<description>",
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
        "description": "<description>",
        "resources": [ ... ],
        "children": [ ... ]
      }
    ]
  }
}

- For each topic (node), provide a list of 2-4 learning resources (articles, videos, courses, documentation, etc.) with their type, label, url, free (true/false), and optional discount.
- For video resources, especially YouTube videos:
  * Use the format: https://www.youtube.com/watch?v=VIDEO_ID
  * Only use valid YouTube video IDs (11 characters)
  * Ensure the video exists and is publicly accessible
  * Do not use shortened URLs or embed URLs
- For each Topic (node), make sure if the topic has talked about some different subtopics or examples/implementations/applications/functions/etc, you assign a subnode to each one of those subtopics.
- Assign sequential "id" values ("node-1", "node-2", etc.) ensuring each node has a unique ID
- Make the descriptions learner-focused, by referring to online resources, so that you would be able to perfectly and concisely explain both WHAT the topic is about in detail and do not overlook any mentioned information in the content and WHY that topic matters, if the information is incomplete or lacks details you add those details
- For the number of levels the hierarchical tree would have there are no limits, it would depend on the complexity of the content and the depth of the topic.
- Return ONLY the JSON with NO additional explanation or text

Structured PDF Content:
${content}
`;
}

import { fetchAndUploadImage } from '../utils/imageUpload';

// --- Gemini API Call and Validation Logic ---

async function sendRoadmapPrompt(textContent: string, title: string): Promise<any> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = getPrompt(textContent);

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
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error("Invalid response structure from Gemini API", data);
      throw new Error("Invalid response structure from Gemini API: " + JSON.stringify(data));
    }
    const textResponse = data.candidates[0].content.parts[0].text;
    try {
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

function validateRoadmapData(data: any): RoadmapData {
  if (!data || !data.title || !data.rootNode) {
    throw new Error("Invalid roadmap data structure");
  }
  const ids = new Set<string>();
  const validateNode = (node: any, parentId: string | null = null): RoadmapNode => {
    if (!node.id) {
      node.id = `node-${Math.random().toString(36).substr(2, 9)}`;
    }
    if (ids.has(node.id)) {
      node.id = `node-${Math.random().toString(36).substr(2, 9)}`;
    }
    ids.add(node.id);
    if (!node.title) {
      node.title = "Untitled Node";
    }
    if (!node.description) {
      node.description = "No description available.";
    }
    if (!node.detailedDescription) {
      node.detailedDescription = "";
    }
    if (node.image && typeof node.image === 'object') {
      node.image = {
        url: node.image.url || '',
        alt: node.image.alt || '',
        caption: node.image.caption || ''
      };
    } else {
      node.image = undefined;
    }
    if (!Array.isArray(node.children)) {
      node.children = [];
    }
    if (!Array.isArray(node.resources)) {
      node.resources = [];
    }
    if (parentId) {
      node.parentId = parentId;
    }
    node.children.forEach((child: any) => validateNode(child, node.id));
    return node as RoadmapNode;
  };
  validateNode(data.rootNode);
  return data as RoadmapData;
}

async function processNodeImages(node: any) {
  if (node.image && node.image.url) {
    const ext = node.image.url.split('.').pop().split('?')[0];
    const fileName = `images/${node.id}.${ext}`;
    try {
      node.image.url = await fetchAndUploadImage(node.image.url, fileName);
    } catch (e) {
      console.error('Image fetch/upload failed:', e);
      node.image.url = '';
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await processNodeImages(child);
    }
  }
}

export async function generateRoadmap(content: any, title: string) {
  // 1. Call Gemini API
  const rawResponse = await sendRoadmapPrompt(content, title);
  // 2. Validate and parse the roadmap
  const roadmapData = validateRoadmapData(rawResponse);
  // 3. Process images
  await processNodeImages(roadmapData.rootNode);
  // 4. Return the processed roadmap
  return roadmapData;
} 