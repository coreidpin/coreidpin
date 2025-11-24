import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const app = new Hono();

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "OPTIONS"],
  credentials: false,
}));

app.post("/", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.parseBody();
    const file = formData['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error('Missing API key');
      return c.json({ error: 'Server configuration error: Missing AI API Key' }, 500);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Data = btoa(String.fromCharCode(...uint8Array));

    // Determine MIME type
    let mimeType = file.type;
    if (!mimeType || mimeType === '') {
      // Fallback based on extension
      if (file.name.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (file.name.endsWith('.txt')) {
        mimeType = 'text/plain';
      } else if (file.name.endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    }

    console.log('Using MIME type:', mimeType);

    const prompt = `You are an expert CV parser. Extract the following information from this resume and return it in STRICT JSON format only, with no additional text or markdown formatting.

Required JSON Structure (MUST be valid JSON):
{
  "work_experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or empty string if current",
      "current": false,
      "description": "Brief summary of responsibilities"
    }
  ],
  "skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY-MM"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    console.log('Sending to Gemini API...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const textResponse = response.text();
    
    console.log('Gemini response:', textResponse.substring(0, 200));

    // Clean up markdown code blocks if present
    let jsonStr = textResponse.trim();
    jsonStr = jsonStr.replace(/^```json\s*/gm, '');
    jsonStr = jsonStr.replace(/^```\s*/gm, '');
    jsonStr = jsonStr.replace(/```$/gm, '');
    jsonStr = jsonStr.trim();

    const extractedData = JSON.parse(jsonStr);
    console.log('Successfully parsed data');

    return c.json({ success: true, extractedData });

  } catch (error: any) {
    console.error('CV Parse Error:', error);
    console.error('Error stack:', error.stack);
    return c.json({ 
      error: 'Failed to parse CV: ' + error.message,
      details: error.stack
    }, 500);
  }
});

Deno.serve(app.fetch);
