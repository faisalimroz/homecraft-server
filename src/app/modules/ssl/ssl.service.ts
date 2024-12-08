import httpStatus from 'http-status';
import axios from 'axios';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';




/**
 * Initialize payment for standard payments.
 */
const initPayment = async (payload: any) => {
  try {
    const data = {
      store_id: config.ssl.storeId,
      store_passwd: config.ssl.storePass,
      total_amount: payload.total_amount,
      currency: 'USD',
      tran_id: payload.tran_id, // use unique tran_id for each api call
      success_url: 'https://home-crafter-backend.vercel.app/api/v1/payment/success',
      fail_url: 'https://home-crafter-backend.vercel.app/fail',
      cancel_url: 'https://home-crafter-backend.vercel.app/cancel',
      ipn_url: 'http://localhost:3030/ipn',
      shipping_method: 'N/A',
      product_name: 'Service Payment',
      product_category: 'Payment',
      product_profile: 'User',
      cus_name: payload.cus_name,
      cus_email: payload.cus_email,
      cus_add1: payload.cus_add1,
      cus_city: payload.cus_city,
      cus_state: payload.cus_state,
      cus_postcode: payload.zipCode,
      cus_country: payload.cus_country,
      cus_phone: payload.cus_phone,
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    };

    const response = await axios({
      method: 'post',
      url: config.ssl.sslPaymentUrl,
      data: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment error');
  }
};

/**
 * Initialize payment for combo packages.
 */
const initPaymentForCombo = async (payload: any) => {
  try {
    const data = {
      store_id: config.ssl.storeId,
      store_passwd: config.ssl.storePass,
      total_amount: payload.total_amount,
      currency: 'USD',
      tran_id: payload.tran_id, // use unique tran_id for each api call
      success_url: 'https://home-crafter-backend.vercel.app/api/v1/payment/success/combo',
      fail_url: 'https://home-crafter-backend.vercel.app/fail',
      cancel_url: 'https://home-crafter-backend.vercel.app/cancel',
      ipn_url: 'http://localhost:3030/ipn',
      shipping_method: 'N/A',
      product_name: 'Service Payment',
      product_category: 'Payment',
      product_profile: 'User',
      cus_name: payload.cus_name,
      cus_email: payload.cus_email,
      cus_add1: payload.cus_add1,
      cus_city: payload.cus_city,
      cus_state: payload.cus_state,
      cus_postcode: payload.zipCode,
      cus_country: payload.cus_country,
      cus_phone: payload.cus_phone,
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    };

    const response = await axios({
      method: 'post',
      url: config.ssl.sslPaymentUrl,
      data: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment error');
  }
};

/**
 * Validate the payment.
 */
const validate = async (data: any) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${config.ssl.sslValidationUrl}?val_id=${data.val_id}&store_id=${config.ssl.storeId}&store_passwd=${config.ssl.storePass}&format=json`,
    });
    return response.data;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment validation error');
  }
};

export const sslService = {
  initPayment,
  initPaymentForCombo,
  validate,
};
