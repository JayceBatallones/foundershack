import { NextResponse } from "next/server";
import axios from "axios";

type Req = {
  prompt: string;
  question: string;
  correctAnswer: string;
  choices: string;
};

export async function POST(req: Request) {
  try {
    const { prompt, question, correctAnswer, choices }: Req = await req.json();

    if (!prompt || !question || !correctAnswer || !choices) {
      return NextResponse.json(
        {
          error:
            "The prompt, question, correct answer and choices must be provided.",
        },
        { status: 400 }
      );
    }

    const openAIResponse = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: `${prompt}\n\nQuestion: ${question}\nCorrect Answer: ${correctAnswer}\nChoices: ${choices}\nExplanation:`,
        max_tokens: 150,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const explanation = openAIResponse.data.choices[0].text.trim();

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return NextResponse.json(
      { error: "Failed to fetch explanation" },
      { status: 500 }
    );
  }
}
