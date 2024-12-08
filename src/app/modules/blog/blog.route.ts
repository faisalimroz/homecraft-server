import express from 'express';
import validateRequest from '../../middlewares/validateRequest';

import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { BlogController } from './blog.controller';
import { BlogValidation } from './blog.validation';

const router = express.Router();
router.post(
  '/',
  // validateRequest(BlogValidation.createBlogZodSchema),
  auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER),
  BlogController.insertIntoDB
);
router.get('/category/similar', BlogController.getBlogsByCategoryFromDB);

router.get('/', BlogController.getAllFromDB);
router.get('/provider', auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER), BlogController.getAllProviderBlogFromDB);
router.get('/latest', BlogController.getLatestTenFromDB);

router.get('/:id', BlogController.getByIdFromDB);


router.patch(
  '/:id',
  validateRequest(BlogValidation.updateBlogZodSchema),
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  BlogController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  BlogController.deleteByIdFromDB
);

export const BlogRoutes = router;
