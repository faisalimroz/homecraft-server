import express from 'express';
import validateRequest from '../../middlewares/validateRequest';

import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { OfferController } from './offer.controller';


const router = express.Router();
router.post(
  '/',
 
  auth(ENUM_USER_ROLE.PROVIDER,ENUM_USER_ROLE.ADMIN),
  OfferController.insertIntoDB
);

router.get('/', auth(ENUM_USER_ROLE.PROVIDER,ENUM_USER_ROLE.ADMIN), OfferController.getAllFromDB);


router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.PROVIDER),
  OfferController.updateOneInDB
);

router.delete(
  '/:id',
  OfferController.deleteByIdFromDB
);

export const OfferRoutes = router;
