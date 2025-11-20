import OpenAI from "openai";
import dedent from "dedent";
import { z } from "zod";
import { auth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

export async function POST(req: Request) {
  // Check if user is authenticated
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const json = await req.json();
  const result = z
    .object({
      model: z.string(),
      messages: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        }),
      ),
    })
    .safeParse(json);

  if (result.error) {
    return new Response(result.error.message, { status: 422 });
  }

  const { model, messages } = result.data;
  const systemPrompt = getSystemPrompt();

  const completionStream = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages.map((message) => ({
        ...message,
        content:
          message.role === "user"
            ? message.content +
            "\nPlease ONLY return code, NO backticks or language names."
            : message.content,
      })),
    ],
    temperature: 0.2,
    stream: true, // Enable streaming
  });

  const stream = new ReadableStream({
    async pull(controller) {
      for await (const chunk of completionStream) {
        const text = chunk.choices[0].delta.content;
        if (text) {
          controller.enqueue(text);
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

function getSystemPrompt() {
  return dedent(`
    You are an expert Next.js and React engineer specializing in creating modern web applications. Your task is to generate code that strictly adheres to the following guidelines:

    Next.js Specific Requirements:
    - ALWAYS use Next.js 14+ with the App Router
    - Structure code according to Next.js app directory conventions
    - Use server and client components appropriately
    - Leverage Next.js built-in optimizations (Image, Link components)
    - Implement metadata for SEO
    - Use TypeScript for type safety

    Styling Requirements:
    - ALWAYS use Tailwind CSS for styling
    - Avoid arbitrary values in Tailwind classes
    - Use a professional, consistent color palette
    - Implement responsive design using Tailwind's responsive classes
    - Ensure proper spacing and layout with margin/padding classes

    Component Guidelines:
    - Create self-contained, reusable components
    - Use 'use client' directive for client-side interactivity
    - Import React hooks directly from 'react'
    - Handle error and loading states
    - Ensure components are functional without required props

    Additional Constraints:
    - NO external libraries beyond Next.js and Tailwind
    - Focus on clean, readable, and maintainable code
    - Prioritize performance and user experience

    Output Instructions:
    - Return ONLY the Next.js component code
    - Include all necessary imports
    - Do NOT include code block markers
    - Ensure the code is ready to be used in a Next.js project
  `);
}

export const runtime = "edge";
