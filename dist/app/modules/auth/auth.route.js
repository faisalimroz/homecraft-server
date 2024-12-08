"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_validate_1 = require("./auth.validate");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.post('/signup', 
// validateRequest(AuthValidation.signupZodSchema),
auth_controller_1.AuthController.createUser);
router.post('/provider/signup', 
// validateRequest(AuthValidation.signupZodSchema),
auth_controller_1.AuthController.ProviderSignup);
router.post('/login', 
// validateRequest(AuthValidation.loginZodSchema),
auth_controller_1.AuthController.loginUser);
router.post('/provider/login', 
// validateRequest(AuthValidation.loginZodSchema),
auth_controller_1.AuthController.loginProvider);
router.post('/refresh-token', (0, validateRequest_1.default)(auth_validate_1.AuthValidation.refreshTokenZodSchema), auth_controller_1.AuthController.refreshToken);
router.patch('/change-password/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER, user_1.ENUM_USER_ROLE.USER), (0, validateRequest_1.default)(auth_validate_1.AuthValidation.changePasswordZodSchema), auth_controller_1.AuthController.changePassword);
router.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', auth_controller_1.AuthController.resetPassword);
exports.AuthRoutes = router;
