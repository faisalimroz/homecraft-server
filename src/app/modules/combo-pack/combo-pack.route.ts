import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
// import { CommentValidation } from './comment.validate';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { ComboPackController } from './combo-pack.controller';
const router = express.Router();
router.post(
  '/',
//   validateRequest(CommentValidation.commentZodSchema),
  auth( ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  ComboPackController.insertIntoDB
);

router.get('/provider', ComboPackController.getAllFromDBForProvider);
router.get('/', ComboPackController.getAllFromDB);
router.get('/:id', ComboPackController.getSingleServiceFromDB);
router.patch('/:id', ComboPackController.UpdateOneIntoDB);
router.delete('/delete/:id', ComboPackController.deleteByIdFromDB);

export const ComboPackRoutes = router;
