"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const comment_validate_1 = require("./comment.validate");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const comment_controller_1 = require("./comment.controller");
const router = express_1.default.Router();
router.post('/', (0, validateRequest_1.default)(comment_validate_1.CommentValidation.commentZodSchema), (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), comment_controller_1.CommentController.postComment);
router.get('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), comment_controller_1.CommentController.getCommentByBlogId);
router.get('/', comment_controller_1.CommentController.getAllComment);
exports.CommentRoutes = router;
