"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryValidation = void 0;
const zod_1 = require("zod");
const createCategoryZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z.string({
            required_error: 'Title is required',
        }),
        categoryImg: zod_1.z.string({
            required_error: 'Image URL is required',
        }),
    }),
});
const updateCategoryZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z.string({
            required_error: 'categoryName is required',
        }),
    }),
});
exports.CategoryValidation = {
    createCategoryZodSchema,
    updateCategoryZodSchema,
};
