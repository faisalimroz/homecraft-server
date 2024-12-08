"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRelationalFieldsMapper = exports.ServiceRelationalFields = exports.ServiceSearchableFields = exports.queryFields = exports.ServiceFilterableFields = void 0;
exports.ServiceFilterableFields = [
    'searchTerm',
    'category',
    'location',
    'rating',
    'minPrice',
    'maxPrice',
];
exports.queryFields = ['limit', 'page', 'sortBy', 'sortOrder'];
exports.ServiceSearchableFields = ['serviceName', 'location'];
exports.ServiceRelationalFields = ['category', 'categoryName'];
exports.ServiceRelationalFieldsMapper = {
    category: 'category',
};
