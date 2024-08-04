import { NextResponse } from "next/server";
import axios from "axios";

// Define the type for the request body to ensure proper structure and type checking
type Req = {
  prompt: string;
  question: string;
  correctAnswer: string;
  choices: string;
};

/**
 * Handles the POST request to fetch an explanation from the OpenAI API.
 *
 * @param {Request} req - The request object containing the prompt, question, correct answer, and choices.
 * @returns {Promise<Response>} - The response object containing the explanation or an error message.
 */
export async function POST(req: Request) {
  try {
    // Parse and destructure the request body
    const { prompt, question, correctAnswer, choices }: Req = await req.json();

    // Validate the request body
    if (!prompt || !question || !correctAnswer || !choices) {
      return NextResponse.json(
        {
          error:
            "The prompt, question, correct answer and choices must be provided.",
        },
        { status: 400 }
      );
    }

    // Make a POST request to the OpenAI API to fetch the explanation
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

    // Extract and trim the explanation from the API response
    const explanation = openAIResponse.data.choices[0].text.trim();

    // Return the explanation as a JSON response
    return NextResponse.json({ explanation });
  } catch (error) {
    // Log the error and return an error response
    console.error("Error fetching explanation:", error);
    return NextResponse.json(
      { error: "Failed to fetch explanation" },
      { status: 500 }
    );
  }
}
