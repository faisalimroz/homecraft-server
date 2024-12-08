import { RequestHandler } from 'express';
import { ProfileService } from './profile.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';

const getProfile: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId
  const userId = req?.user?.userId
  console.log(req?.user,'10')
  const result = await ProfileService.getProfile(providerId,userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

export const ProfileController = {
  getProfile
};
