// @typescript-eslint/no-unused-vars
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AvailbilityServices } from './availbility.services';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createAvailbility: RequestHandler = catchAsync(async (req, res) => {
  const availabilityData = req.body;
  console.log(availabilityData,'999999')
  const providerId = req?.provider?.providerId

  const availabilities = await Promise.all(
    Object.entries(availabilityData).map(async ([day, slots]) => {
      return AvailbilityServices.createAvailbility({ day, slots: slots as string[],providerId });
    })
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Availbility created successfully',
    data: availabilities,
  });
});



const getAllAvailbility: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.query?.providerId as string;
  const availabilities = await AvailbilityServices.getAllAvailbility(providerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Availbility fetched successfully',
    data: availabilities,
  });
});
const getAllAvailbilityForProvider: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId as string;
  const availabilities = await AvailbilityServices.getAllAvailbility(providerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Availbility fetched successfully for provider',
    data: availabilities,
  });
});


const deleteAvailbility: RequestHandler = catchAsync(async (req, res) => {

  const { day, slot } = req.body;
  
  if (!day || !slot) {
    return res.status(400).json({
      success: false,
      message: 'Day and slot are required fields',
    });
  }
  const availabilities = await AvailbilityServices.deleteAvailbility(day, slot);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Availbility deleted successfully',
    data: availabilities,
  });
});



export const AvailbilityController = {
  createAvailbility,
  getAllAvailbility,
  getAllAvailbilityForProvider,
  deleteAvailbility
};
