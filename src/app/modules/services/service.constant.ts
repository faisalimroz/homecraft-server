export const ServiceFilterableFields = [
  'searchTerm',
  'category',
  'location',
  'rating',
  'minPrice',
  'maxPrice',
];

export const queryFields = ['limit', 'page', 'sortBy', 'sortOrder'];

export const ServiceSearchableFields = ['serviceName', 'location'];

export const ServiceRelationalFields = ['category', 'categoryName'];
export const ServiceRelationalFieldsMapper: { [key: string]: string } = {
  category: 'category',
};