import { z } from "zod";

export const addAnswerSchema = z.object({
    userAnswer: z.string(),
    attemptId: z.string()
})
