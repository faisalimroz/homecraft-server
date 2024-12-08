import { RequestHandler } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OfferService } from './offer.service';

const insertIntoDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId;
  const result = await OfferService.insertIntoDB(req.body,providerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Offer created successfully',
    data: result,
  });
});

const getAllFromDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId;
  const result = await OfferService.getAllFromDB(providerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Offer fetched successfully',
    data: result,
  });
});


const updateOneInDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OfferService.updateOneInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Offer updated successfully',
    data: result,
  });
});

const deleteByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OfferService.deleteByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Offer deleted successfully',
    data: result,
  });
});

export const OfferController = {
  insertIntoDB,
  getAllFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
