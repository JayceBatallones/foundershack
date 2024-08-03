import { z } from "zod";

export const pathwaySchema = z.object({
    pathwayId: z.string(),
    userId: z.string()

})

export const topicMapSchema = z.record(z.string(), z.number());


export const checkCorrectAnswersSchema = z.object({
    type: z.enum(["topics", "subTopics", "skills"]),
    name: z.string(),
    threshold: z.number(),
    nodeAmount: z.number(),
    topicMap: topicMapSchema,
    userPathwayId: z.string(),
    currentQuestionIndex: z.number(),
    currentTopicIndex: z.number(),
})

export const getCurrentNodeSchema = z.object({
    userPathwayId: z.string()
})

export const createPathwayQuizSchema = z.object({
    type: z.enum(["topics", "subTopics", "skills"]),
    name: z.string(),
})