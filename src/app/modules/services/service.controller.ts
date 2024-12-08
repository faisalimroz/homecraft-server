import { RequestHandler } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { ServiceFilterableFields, queryFields } from './service.constant';
import httpStatus from 'http-status';
import { ServiceServices } from './service.service';

const insertIntoDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId
  const result = await ServiceServices.insertIntoDB(req.body,providerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service created successfully',
    data: result,
  });
});

const getAllFromDB: RequestHandler = catchAsync(async (req, res) => {
  const filters = pick(req.query, ServiceFilterableFields);
  const queryOptions = pick(req.query, queryFields);


  const result = await ServiceServices.getAllFromDB(filters, queryOptions);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleProviderServiceFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.getSingleProviderServiceFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'provider fetched successfully',
    data: result,
  });
});
const getAllProviderServiceFromDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId
  const result = await ServiceServices.getAllProviderServiceFromDB(providerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});


const getAllOfferedServicesProvidersFromDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId
  const result = await ServiceServices.getAllOfferedServicesProvidersFromDB(providerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Service fetched successfully',
    data: result
  });
});
const getAllOfferedServicesFromDB: RequestHandler = catchAsync(async (req, res) => {
 
  const result = await ServiceServices.getAllOfferedServicesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Service fetched successfully',
    data: result
  });
});
const getMostPopularServicesFromDB: RequestHandler = catchAsync(async (req, res) => {
 
  const result = await ServiceServices.getMostPopularServicesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Most Popular Service fetched successfully',
    data: result
  });
});


const deleteOfferedServiceFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.deleteOfferedServiceFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Service deleted successfully',
    data: result,
  });
});


const updateServicePriceByOffer: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {offerId} = req.body;
  const result = await ServiceServices.updateServicePriceByOffer(id,offerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer applied successfully',
    data: result,
  });
});
const getByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service fetched successfully',
    data: result,
  });
});
const updateOneInDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.updateOneInDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service updated successfully',
    data: result,
  });
});

const deleteByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.deleteByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service deleted successfully',
    data: result,
  });
});

const getOverview: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId
  const result = await ServiceServices.getOverview(providerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'overview fetched successfully',
    data: result,
  });
});

const getAdditionalServiceFromDB: RequestHandler = catchAsync(async (req, res) => {
  const serviceId  = req.query.serviceId as string;
  const result = await ServiceServices.getAdditionalServiceFromDB(serviceId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Latest Blogs fetched successfully',
    data: result,
  });
});

const getRelatedServiceFromDB: RequestHandler = catchAsync(async (req, res) => {
  console.log(req.query,'41')
  const categoryId = req.query.categoryId as string;
  const serviceId  = req.query.serviceId as string;
  const result = await ServiceServices.getRelatedServiceFromDB(categoryId,serviceId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Similar Blogs fetched successfully',
    data: result,
  });
});

export const ServiceController = {
  insertIntoDB,
  getAllFromDB,
  getSingleProviderServiceFromDB,
  getAllProviderServiceFromDB,
  getAllOfferedServicesProvidersFromDB,
  getAllOfferedServicesFromDB,
  deleteOfferedServiceFromDB,
  updateServicePriceByOffer,
  getByIdFromDB,
  getAdditionalServiceFromDB,
  getRelatedServiceFromDB,
  getMostPopularServicesFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  getOverview,
};
