"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboPackRoutes = void 0;
const express_1 = __importDefault(require("express"));
// import { CommentValidation } from './comment.validate';
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const combo_pack_controller_1 = require("./combo-pack.controller");
const router = express_1.default.Router();
router.post('/', 
//   validateRequest(CommentValidation.commentZodSchema),
(0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), combo_pack_controller_1.ComboPackController.insertIntoDB);
router.get('/provider', combo_pack_controller_1.ComboPackController.getAllFromDBForProvider);
router.get('/', combo_pack_controller_1.ComboPackController.getAllFromDB);
router.get('/:id', combo_pack_controller_1.ComboPackController.getSingleServiceFromDB);
router.patch('/:id', combo_pack_controller_1.ComboPackController.UpdateOneIntoDB);
router.delete('/delete/:id', combo_pack_controller_1.ComboPackController.deleteByIdFromDB);
exports.ComboPackRoutes = router;
