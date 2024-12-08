import { RequestHandler } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ComboBookingService } from './combo-booking.service';

const insertIntoDB: RequestHandler = catchAsync(async (req, res) => {
  const result = await ComboBookingService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Combo Booking created successfully',
    data: result,
  });
});

const getAllFromDB: RequestHandler = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const result = await ComboBookingService.getAllFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking fetched successfully',
    data: result,
  });
});
const getAllFromDBForProvider: RequestHandler = catchAsync(async (req, res) => {
 
  const providerId = req?.provider?.providerId;
  const result = await ComboBookingService.getAllFromDBForProvider(providerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking fetched successfully',
    data: result,
  });
});



const getByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ComboBookingService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Combo Booking fetched successfully',
    data: result,
  });
});

const updateComboBookingStatus: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ComboBookingService.updateComboBookingStatus(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking updated successfully',
    data: result,
  });
});

const deleteByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ComboBookingService.deleteByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking deleted successfully',
    data: result,
  });
});


export const ComboBookingController = {
  insertIntoDB,
  getAllFromDB,
  getAllFromDBForProvider,
  getByIdFromDB,
  updateComboBookingStatus,
  deleteByIdFromDB
};
