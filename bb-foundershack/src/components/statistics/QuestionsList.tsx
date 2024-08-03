"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma } from "@prisma/client";
import { MathJaxHtml } from "mathjax3-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import ExpandButton from "@/components/statistics/ExpandButton";
import axios from "axios";

type Props = {
  attempt: {
    quizId: number;
    answers: string[];
  };
  testQuestion: {
    QuestionID: string;
    Description: string | null;
    Explanation: string | null;
    CorrectAnswer: string | null;
    Choices: Prisma.JsonValue;
  }[];
};

const QuestionsList = ({ attempt, testQuestion }: Props) => {
  // Combine attempt answers with test questions
  const combinedData = testQuestion.map((question, index) => ({
    ...question,
    userAnswer: attempt.answers[index],
  }));

  const [explanations, setExplanations] = useState<string[]>([]);

  /**
   * TODO:
   * 1. get student's answer
   * 2. unpack choices, only selection description not image
   * 3. rephrase prompt to ask why the student's answer is:
   *    a) correct
   *    b) incorrect -> what is the correct answer
   * 4. change fetch explanation to only post request if chevron icon is clicked
   * 5. use usestate to store already requested explanation
   *    - key: index of question
   *    - value: explanation
   */

  const fetchExplanation = async (
    question: string,
    correctAnswer: string,
    choices: string,
    index: number
  ) => {
    try {
      const response = await axios.post("/api/aiAssistance", {
        prompt:
          "As a tutor, explain the following quiz question, why the provided correct answer is correct, and why the other choices are not correct",
        question,
        correctAnswer,
        choices,
      });
      const explanation = response.data.explanation;
      setExplanations((prev) => {
        const newExplanations = [...prev];
        newExplanations[index] = explanation;
        return newExplanations;
      });
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
    }
  };

  return (
    <Table className="mt-4">
      <TableCaption>End of list.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">No.</TableHead>
          <TableHead>Question & Correct Answer</TableHead>
          <TableHead>Your Answer</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinedData.map(
          (
            { CorrectAnswer, Explanation, Description, userAnswer, Choices },
            index
          ) => {
            const isCorrect = CorrectAnswer === userAnswer;

            const unpackedChoices = Choices as {
              [key: string]: { image: any; description: any };
            };
            console.log(unpackedChoices);

            return (
              <Collapsible asChild>
                <>
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {Description && <MathJaxHtml html={Description} />}
                      <span className="italics mb-1">
                        {Explanation && (
                          <div className="italic mb-1">
                            <MathJaxHtml html={Explanation} />
                          </div>
                        )}
                      </span>
                      <span className="font-semibold">
                        Correct Answer: {CorrectAnswer}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`${
                        isCorrect ? "text-green-600" : "text-red-600"
                      } font-semibold`}
                    >
                      {userAnswer}
                    </TableCell>
                    <TableCell>
                      <ExpandButton
                        index={index}
                        // onClick={() =>
                        //   fetchExplanation(
                        //     Description ?? "",
                        //     CorrectAnswer ?? "",
                        //     JSON.stringify(Choices),
                        //     index
                        //   )
                        // }
                      />
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <span className="font-semibold">
                          Further Explanation:
                        </span>
                        <div className="bg-gray-100 my-2 p-3 rounded">
                          {/* {explanations[index] || "Loading explanation..."} */}
                          {/* TODO: Change to AI-generated explanation */}
                          To explain this quiz question, let's start by
                          understanding the relationship described: "A quantity,
                          M, varies as the square of another quantity, N." This
                          means that M is directly proportional to 𝑁 2 N 2 .
                          Mathematically, we can express this as: 𝑀 = 𝑘 𝑁 2 M=kN
                          2 where 𝑘 k is a constant of proportionality.
                          Step-by-Step Solution Determine the constant 𝑘 k: We
                          are given that 𝑀 = 448 M=448 when 𝑁 = 8 N=8. Plugging
                          these values into the equation: 448 = 𝑘 ⋅ 8 2 448=k⋅8
                          2 Simplify the equation: 448 = 𝑘 ⋅ 64 448=k⋅64 Solve
                          for 𝑘 k: 𝑘 = 448 64 k= 64 448 ​ 𝑘 = 7 k=7 Calculate 𝑀
                          M when 𝑁 = 5 N=5: Now that we have the constant 𝑘 k,
                          we can find the value of 𝑀 M for 𝑁 = 5 N=5: 𝑀 = 𝑘 ⋅ 5
                          2 M=k⋅5 2 Substitute 𝑘 = 7 k=7: 𝑀 = 7 ⋅ 25 M=7⋅25 𝑀 =
                          175 M=175 Therefore, the correct answer is A. 175.
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            );
          }
        )}
      </TableBody>
    </Table>
  );
};

export default QuestionsList;
