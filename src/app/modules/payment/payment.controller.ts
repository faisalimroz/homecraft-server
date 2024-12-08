// @typescript-eslint/no-unused-vars
import { NextFunction, Request, Response } from 'express';
import { PaymentService } from './payment.service';
import httpStatus from 'http-status';
import { paymentFilterableFields } from './payment.constants';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';

const initPayment = async (req: Request, res: Response) => {
  const userId = req?.user?.userId;
  const result = await PaymentService.initPayment(req.body,userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment init successfully',
    data: result,
  });
};
const initPaymentForCombo = async (req: Request, res: Response) => {
  const userId = req?.user?.userId;
  const result = await PaymentService.initPaymentForCombo(req.body,userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment init successfully',
    data: result,
  });
};

const paymentVerify = async (req: Request, res: Response) => {
  const id = req.query;
  const { transectionId } = id;
  
  const result = await PaymentService.paymentVerify(transectionId);
  console.log(result,'35')
  if (result && result.count > 0) {
  
   
    
    res.redirect('https://home-crafter.vercel.app/booking-done');
  } else {
    // Handle the case where the update failed
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Payment verification failed',
    });
  }
};
const paymentVerifyForCombo = async (req: Request, res: Response) => {
  const id = req.query;
  const { transectionId } = id;
  
  const result = await PaymentService.paymentVerifyForCombo(transectionId);
  if (result && result.count > 0) {
    const redirectUrl = 'https://home-crafter.vercel.app/combo-booking-done'
   
    res.redirect(redirectUrl);
  } else {
    // Handle the case where the update failed
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Payment verification failed',
    });
  }
};



const getAllFromDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const providerId = req?.provider?.providerId
    const result = await PaymentService.getAllFromDB(providerId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payments fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteFromDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await PaymentService.deleteFromDB(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment delete successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const PaymentController = {
  initPayment,
  initPaymentForCombo,
  paymentVerify,
  paymentVerifyForCombo,
  getAllFromDB,
  deleteFromDB,
};
