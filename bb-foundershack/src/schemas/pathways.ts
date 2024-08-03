import { z } from "zod";

export const pathwaySchema = z.object({
    pathwayId: z.string(),
    userId: z.string()

})
