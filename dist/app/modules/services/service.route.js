"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const service_controller_1 = require("./service.controller");
const services_validate_1 = require("./services.validate");
const router = express_1.default.Router();
router.patch('/:id', (0, validateRequest_1.default)(services_validate_1.ServiceValidation.updateServiceZodSchema), (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), service_controller_1.ServiceController.updateOneInDB);
router.patch('/:id/apply-offer', 
// validateRequest(ServiceValidation.updateServiceZodSchema),
// auth(ENUM_USER_ROLE.ADMIN,ENUM_USER_ROLE.PROVIDER),
service_controller_1.ServiceController.updateServicePriceByOffer);
router.get('/overview', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PROVIDER, user_1.ENUM_USER_ROLE.ADMIN), service_controller_1.ServiceController.getOverview);
router.get('/', service_controller_1.ServiceController.getAllFromDB);
router.get('/single-provider/:id', service_controller_1.ServiceController.getSingleProviderServiceFromDB);
router.get('/provider', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), service_controller_1.ServiceController.getAllProviderServiceFromDB);
router.get('/offer-service/provider', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PROVIDER, user_1.ENUM_USER_ROLE.ADMIN), service_controller_1.ServiceController.getAllOfferedServicesProvidersFromDB);
router.get('/offer-service', service_controller_1.ServiceController.getAllOfferedServicesFromDB);
router.get('/popular-service', service_controller_1.ServiceController.getMostPopularServicesFromDB);
router.delete('/:id/delete-offer-service', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), service_controller_1.ServiceController.deleteOfferedServiceFromDB);
router.post('/', 
// validateRequest(ServiceValidation.createServiceZodSchema),
(0, auth_1.default)(user_1.ENUM_USER_ROLE.PROVIDER, user_1.ENUM_USER_ROLE.ADMIN), service_controller_1.ServiceController.insertIntoDB);
// router.get('/:categoryId/category', BookController.getByCategoryIdFromDB);
router.get('/additional', service_controller_1.ServiceController.getAdditionalServiceFromDB);
router.get('/:id', service_controller_1.ServiceController.getByIdFromDB);
router.get('/category/similar', service_controller_1.ServiceController.getRelatedServiceFromDB);
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), service_controller_1.ServiceController.deleteByIdFromDB);
exports.ServiceRoutes = router;
