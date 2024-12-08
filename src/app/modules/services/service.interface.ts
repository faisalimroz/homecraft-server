export type IServiceFilters = {
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string | string[];
  location?: string;
  rating?: string;
};
