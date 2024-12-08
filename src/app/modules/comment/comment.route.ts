import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CommentValidation } from './comment.validate';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { CommentController } from './comment.controller';
const router = express.Router();
router.post(
  '/',
  validateRequest(CommentValidation.commentZodSchema),
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  CommentController.postComment
);
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  CommentController.getCommentByBlogId
);
router.get('/', CommentController.getAllComment);

export const CommentRoutes = router;
