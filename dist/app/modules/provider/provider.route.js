"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const provider_controller_1 = require("./provider.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const router = express_1.default.Router();
router.patch('/:id/status', 
//   validateRequest(UserValidation.userUpdateZodSchema),
(0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), provider_controller_1.ProviderController.updateStatusInDB);
router.get('/', provider_controller_1.ProviderController.getAllFromDB);
router.get('/admin', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), provider_controller_1.ProviderController.getAllFromDBForAdmin);
router.get('/:id', provider_controller_1.ProviderController.getByIdFromDB);
router.patch('/:id', 
//   validateRequest(UserValidation.userUpdateZodSchema),
(0, auth_1.default)(user_1.ENUM_USER_ROLE.PROVIDER, user_1.ENUM_USER_ROLE.ADMIN), provider_controller_1.ProviderController.updateOneInDB);
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), provider_controller_1.ProviderController.deleteByIdFromDB);
exports.ProviderRoutes = router;
