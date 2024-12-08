import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import { ReviewServices } from './review.service';
import catchAsync from '../../../shared/catchAsync';
import { RequestHandler } from 'express';

const postReview: RequestHandler = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  console.log(userId,'10')
  const result = await ReviewServices.postReview(req.body,userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review post successfully',
    data: result,
  });
});
const postProviderReview: RequestHandler = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
 
  const result = await ReviewServices.postProviderReview(req.body,userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider Review post successfully',
    data: result,
  });
});



const getAllReview: RequestHandler = catchAsync(async (req, res) => {
  const result = await ReviewServices.getAllReview();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review post successfully',
    data: result,
  });
});
const getReviewByServiceId: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewServices.getReviewByServiceId(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review retrived successfully',
    data: result,
  });
});
const getReviewByProviderId: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewServices.getReviewByProviderId(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review Provider retrived successfully',
    data: result,
  });
});
const deleteReviewFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewServices.deleteReviewFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  postReview,
  postProviderReview,
  getAllReview,
  getReviewByServiceId,
  getReviewByProviderId,
  deleteReviewFromDB
};
