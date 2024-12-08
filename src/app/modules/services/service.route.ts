import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ServiceController } from './service.controller';
import { ServiceValidation } from './services.validate';

const router = express.Router();

router.patch(
  '/:id',
  validateRequest(ServiceValidation.updateServiceZodSchema),
  auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER),
  ServiceController.updateOneInDB
);
router.patch(
  '/:id/apply-offer',
  // validateRequest(ServiceValidation.updateServiceZodSchema),
  // auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER),
  ServiceController.updateServicePriceByOffer
);


router.get('/overview',auth(ENUM_USER_ROLE.PROVIDER,ENUM_USER_ROLE.ADMIN), ServiceController.getOverview);
router.get('/', ServiceController.getAllFromDB);
router.get('/single-provider/:id', ServiceController.getSingleProviderServiceFromDB);
router.get('/provider', auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER), ServiceController.getAllProviderServiceFromDB);

router.get('/offer-service/provider',  auth(ENUM_USER_ROLE.PROVIDER,ENUM_USER_ROLE.ADMIN), ServiceController.getAllOfferedServicesProvidersFromDB);

router.get('/offer-service', ServiceController.getAllOfferedServicesFromDB);
router.get('/popular-service', ServiceController.getMostPopularServicesFromDB);

router.delete(
  '/:id/delete-offer-service',
  auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER),
  ServiceController.deleteOfferedServiceFromDB
);

router.post(
  '/',
  // validateRequest(ServiceValidation.createServiceZodSchema),
  auth(ENUM_USER_ROLE.PROVIDER,ENUM_USER_ROLE.ADMIN),
  ServiceController.insertIntoDB
);

// router.get('/:categoryId/category', BookController.getByCategoryIdFromDB);

router.get('/additional', ServiceController.getAdditionalServiceFromDB);
router.get('/:id', ServiceController.getByIdFromDB);


router.get('/category/similar', ServiceController.getRelatedServiceFromDB);


router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER),
  ServiceController.deleteByIdFromDB
);


export const ServiceRoutes = router;
