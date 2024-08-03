"use client";

import React from "react";
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
          ({ CorrectAnswer, Explanation, Description, userAnswer }, index) => {
            const isCorrect = CorrectAnswer === userAnswer;

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
                      <span>Expand</span>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <span className="font-semibold">
                          Further Explanation:
                        </span>
                        <div className="bg-gray-100 my-2 p-3 rounded">
                          {/* TODO: Change to AI-generated explanation */}
                          This section will show the AI-generated explanation.
                          This section will show the AI-generated explanation.
                          This section will show the AI-generated explanation.
                          This section will show the AI-generated explanation.
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
