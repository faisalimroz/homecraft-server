import { z } from 'zod';
const reviewZodSchema = z.object({
  body: z.object({
 
    serviceId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string(),
  }),
});

export const ReviewValidation = {
  reviewZodSchema,
};
