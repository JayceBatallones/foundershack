import { z } from "zod";

const testQuestionSchema = z.object({
    QuestionID: z.string(),
    Description: z.string().nullable(),
    Explanation: z.string().nullable(),
    Choices: z.any().nullable(), // Assuming Choices is a JSON field and could be any valid JSON

    CorrectAnswer: z.string().nullable(),
    Subject: z.string().nullable(),
    Topic: z.string().nullable(),
    SubTopic: z.string().nullable(),
  });
  
  export const statsSchema = z.object({
    attemptId: z.string(),
    testQuestions: z.array(testQuestionSchema),
    timeEnded: z.string().transform((str) => new Date(str))
  });