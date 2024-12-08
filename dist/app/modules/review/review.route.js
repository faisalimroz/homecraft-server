"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const review_validate_1 = require("./review.validate");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const review_controller_1 = require("./review.controller");
const router = express_1.default.Router();
router.post('/', (0, validateRequest_1.default)(review_validate_1.ReviewValidation.reviewZodSchema), (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER), review_controller_1.ReviewController.postReview);
router.post('/provider', 
// validateRequest(ReviewValidation.reviewZodSchema),
(0, auth_1.default)(user_1.ENUM_USER_ROLE.USER), review_controller_1.ReviewController.postProviderReview);
router.get('/', review_controller_1.ReviewController.getAllReview);
router.get('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), review_controller_1.ReviewController.getReviewByServiceId);
router.get('/provider/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER, user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), review_controller_1.ReviewController.getReviewByProviderId);
router.get('/', review_controller_1.ReviewController.getAllReview);
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), review_controller_1.ReviewController.deleteReviewFromDB);
exports.ReviewRoutes = router;
