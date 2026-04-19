import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with the provided key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages, codeContext } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key not configured." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format the history for Gemini
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    // Build the prompt context
    let prompt = lastMessage;
    if (codeContext) {
      prompt = `Here is the current code the user is working on in the editor:
\`\`\`javascript
${codeContext}
\`\`\`

User's message:
${lastMessage}`;
    }

    // Add a system prompt equivalent by making it the first message or prepending context
    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are Lumi, a friendly, encouraging AI coding tutor for a platform called AICodeQuest. Keep answers brief (max 2 paragraphs). Be extremely motivating. Do not just give the direct answer to coding problems immediately; offer hints first unless directly asked to code. Use emojis. You are talking to a beginner learning React." }]
        },
        {
           role: "model",
           parts: [{ text: "Got it! I am Lumi, ready to help the student learn! 🌟 Let's code!" }]
        },
        ...history
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ message: responseText });
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong in the AI Tutor." },
      { status: 500 }
    );
  }
}
