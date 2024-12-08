import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.post('/success', PaymentController.paymentVerify);
router.post('/success/combo', PaymentController.paymentVerifyForCombo);
router.post('/init', PaymentController.initPayment);
router.post('/init/combo', PaymentController.initPaymentForCombo);

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  PaymentController.getAllFromDB
);
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  PaymentController.deleteFromDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  PaymentController.deleteFromDB
);



export const PaymentRoutes = router;
