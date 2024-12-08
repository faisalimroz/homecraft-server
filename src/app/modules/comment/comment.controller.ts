import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import { CommentService } from './comment.service';
import catchAsync from '../../../shared/catchAsync';
import { RequestHandler } from 'express';

const postComment: RequestHandler = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const result = await CommentService.postComment(req.body,userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment post successfully',
    data: result,
  });
});

const getAllComment: RequestHandler = catchAsync(async (req, res) => {
  const result = await CommentService.getAllComment();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment post successfully',
    data: result,
  });
});
const getCommentByBlogId: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentService.getCommentByBlogId(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment retrived successfully',
    data: result,
  });
});

export const CommentController = {
  postComment,
  getAllComment,
  getCommentByBlogId,
};
