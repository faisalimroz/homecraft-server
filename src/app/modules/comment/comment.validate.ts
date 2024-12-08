import { z } from 'zod';
const commentZodSchema = z.object({
  body: z.object({
 
    blogId: z.string().uuid(),
    comment: z.string(),
  }),
});

export const CommentValidation = {
  commentZodSchema,
};
