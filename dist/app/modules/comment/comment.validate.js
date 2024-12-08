"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentValidation = void 0;
const zod_1 = require("zod");
const commentZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        blogId: zod_1.z.string().uuid(),
        comment: zod_1.z.string(),
    }),
});
exports.CommentValidation = {
    commentZodSchema,
};
