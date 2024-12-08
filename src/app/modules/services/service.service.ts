// @typescript-eslint/no-explicit-any
import { offerStatus, ProviderRole, Service } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { queryHelpers } from '../../../helpers/queryHelpers';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  ServiceRelationalFields,
  ServiceRelationalFieldsMapper,
  ServiceSearchableFields,
} from './service.constant';
import { IServiceFilters } from './service.interface';
import cloudinary from 'cloudinary';


type ServicePreview = {
  id: string;
  serviceName: string;
  location:string;
  regularPrice:number;
  serviceImg: string[];
 
};



const insertIntoDB = async (data: Service,providerId:string): Promise<Service> => {
  let {
    serviceName,
    serviceImg,
    regularPrice,
    location,
    duration,
    videoUrl,
    description,
    categoryId,
    keyFeature1,
    keyFeature2,
    keyFeature3,
    keyFeature4
  } = data;

  // Check if the service name already exists
  const isNameExist = await prisma.service.findFirst({
    where: { serviceName },
  });

  if (isNameExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Service Name Already Exists');
  }

  // Upload images in parallel if available
  if (serviceImg && serviceImg.length > 0) {
    const uploadPromises = serviceImg.map((img) =>
      cloudinary.v2.uploader.upload(img, { folder: 'Home Crafter/Services' })
    );

    // Await all uploads to finish and map the results to get the URLs
    const results = await Promise.all(uploadPromises);
    serviceImg = results.map((result) => result.secure_url);
  } else {
    serviceImg = []; // Ensure it's an array
  }

  // Transaction to ensure all operations succeed together
  const result = await prisma.$transaction(async (prisma) => {
    return prisma.service.create({
      data: {
        serviceName,
        regularPrice,
        location,
        duration,
        videoUrl,
        description,
        serviceImg,
        categoryId,
        providerId,
        keyFeature1,
        keyFeature2,
        keyFeature3,
        keyFeature4
      },
      include: {
        category: true,
        provider: true
      },
    });
  });

  return result;
};

const getAllFromDB = async (
  filters: IServiceFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<Service[]>> => {
  const { limit, page, skip,sortBy="regularPrice",sortOrder } = queryHelpers.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, category, location, rating, ...filterData } = filters;
  const newMinPrice = typeof minPrice === "string" ? parseInt(minPrice) : minPrice;
  const newMaxPrice = typeof maxPrice === "string" ? parseInt(maxPrice) : maxPrice;
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        ...ServiceSearchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
        {
          category: {
            categoryName: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (location) {
    andConditions.push({
      location: {
        contains: location,
        mode: "insensitive",
      },
    });
  }

  if (newMinPrice !== undefined && newMaxPrice !== undefined) {
    andConditions.push({
      regularPrice: {
        gte: newMinPrice,
        lte: newMaxPrice,
      },
    });
  } else if (newMinPrice !== undefined) {
    andConditions.push({
      regularPrice: {
        gte: newMinPrice,
      },
    });
  } else if (newMaxPrice !== undefined) {
    andConditions.push({
      regularPrice: {
        lte: newMaxPrice,
      },
    });
  }

  if (category && Array.isArray(category)) {
    andConditions.push({
      category: {
        id: {
          in: category,
        },
      },
    });
  } else if (category) {
    andConditions.push({
      category: {
        id: category,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        if (ServiceRelationalFields.includes(key)) {
          return {
            [ServiceRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: any = andConditions.length > 0 ? { AND: andConditions } : {};

  const ratingCondition = rating ? parseInt(rating) : undefined;

  let services:any = await prisma.service.findMany({
    include: {
      category: true,
      provider:true,
      reviews: {
        select: {
          rating: true,
        },
      },
      offer: true, // Include the offer information to check its status
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  // Update services based on the offer's status
  services = await Promise.all(
    services.map(async (service:any) => {
      if (service.offer && service.offer.status !== offerStatus.Active) {
        // If the offer is inactive, set providerId to null and reset offeredPrice
        const updatedService = await prisma.service.update({
          where: { id: service.id },
          data: {
            offerId: null,
            offeredPrice: 0,
          },
          include: {
            category: true,
            provider: true,
            reviews: {
              select: {
                rating: true,
              },
            },
            offer: true, // Include the offer to maintain the structure
          },
        });
        return updatedService;
      }
      return service;
    })
  );

  // Calculate average ratings and rating counts for all services before filtering by rating
  const allServices = services.map((service:any) => {
    const reviews = service.reviews || [];
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.ceil(reviews.reduce((sum:any, review:any) => sum + review.rating, 0) / totalReviews)
        : 0;

    return {
      ...service,
      averageRating,
      totalReviews,
    };
  });

  // Initialize ratingCounts with zeros
  const ratingCounts: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  // Populate ratingCounts based on all services
  allServices.forEach((service:any) => {
    const rating = service.averageRating;
    if (ratingCounts.hasOwnProperty(rating)) {
      ratingCounts[rating]++;
    }
  });

  // Now filter the services based on the rating condition
  const filteredServices = allServices.filter((service:any) => {
    if (ratingCondition !== undefined) {
      switch (ratingCondition) {
        case 1:
          return service.averageRating < 2;
        case 2:
          return service.averageRating < 3;
        case 3:
          return service.averageRating < 4;
        case 4:
          return service.averageRating < 5;
        case 5:
          return service.averageRating === 5;
        default:
          return false;
      }
    }
    return true;
  });

  const total = await prisma.service.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
      ratingCounts,
    },
    data: filteredServices,
  };
};


const getSingleProviderServiceFromDB = async (providerId: string): Promise<any> => {
 
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      role: true, 
    },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  // Determine the filtering based on the role
  const andConditions: any[] = [];
  
  // If the role is 'provider', add a condition to filter by providerId
  if (provider.role === ProviderRole.Provider) {
    andConditions.push({ providerId });
  }

  // Construct where conditions for the query
  const whereConditions: any = andConditions.length > 0 && { AND: andConditions };

  const sortBy = 'createdAt';
  const sortOrder = 'desc';


  // Fetch services with their related data
  let services: any = await prisma.service.findMany({
    include: {
      category: true,
      provider: true,
      reviews: {
        select: {
          rating: true,
        },
      },
      offer: true,
    },
    where: whereConditions,
    orderBy: { [sortBy]: sortOrder },
  });

  // Update services based on the offer's status
  services = await Promise.all(
    services.map(async (service: any) => {
      if (service.offer && service.offer.status !== offerStatus.Active) {
        // If the offer is inactive, set offerId to null and reset offeredPrice
        const updatedService = await prisma.service.update({
          where: { id: service.id },
          data: {
            offerId: null,
            offeredPrice: 0,
          },
          include: {
            category: true,
            provider: true,
            reviews: {
              select: {
                rating: true,
              },
            },
            offer: true, 
          },
        });
        return updatedService;
      }
      return service;
    })
  );

  // Calculate average ratings and total review counts for each service
  const allServices = services.map((service: any) => {
    const reviews = service.reviews || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.ceil(reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / totalReviews)
      : 0;

    return {
      ...service,
      averageRating,
      totalReviews,
    };
  });

  // Total number of services in the database (for pagination purposes)
  const total = await prisma.service.count({
    where: whereConditions,
  });

  return allServices;
    
  
};
const getAllProviderServiceFromDB = async (providerId: string): Promise<any> => {
 
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      role: true, 
    },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  // Determine the filtering based on the role
  const andConditions: any[] = [];
  
  // If the role is 'provider', add a condition to filter by providerId
  if (provider.role === ProviderRole.Provider) {
    andConditions.push({ providerId });
  }

  // Construct where conditions for the query
  const whereConditions: any = andConditions.length > 0 ? { AND: andConditions } : {};

  const sortBy = 'createdAt';
  const sortOrder = 'desc';
  const page = 1;
  const limit = 10;

  // Calculate pagination offset
  const skip = (page - 1) * limit;

  // Fetch services with their related data
  let services: any = await prisma.service.findMany({
    include: {
      category: true,
      provider: true,
      reviews: {
        select: {
          rating: true,
        },
      },
      offer: true,
    },
    where: whereConditions, // Apply filtering conditions
    orderBy: [{ [sortBy]: sortOrder }, { regularPrice: sortOrder ?? 'asc' }],
    skip, // Pagination: skip this many records
    take: limit, // Pagination: take this many records
  });

  // Update services based on the offer's status
  services = await Promise.all(
    services.map(async (service: any) => {
      if (service.offer && service.offer.status !== offerStatus.Active) {
        // If the offer is inactive, set offerId to null and reset offeredPrice
        const updatedService = await prisma.service.update({
          where: { id: service.id },
          data: {
            offerId: null,
            offeredPrice: 0,
          },
          include: {
            category: true,
            provider: true,
            reviews: {
              select: {
                rating: true,
              },
            },
            offer: true, 
          },
        });
        return updatedService;
      }
      return service;
    })
  );

  // Calculate average ratings and total review counts for each service
  const allServices = services.map((service: any) => {
    const reviews = service.reviews || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.ceil(reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / totalReviews)
      : 0;

    return {
      ...service,
      averageRating,
      totalReviews,
    };
  });

  // Total number of services in the database (for pagination purposes)
  const total = await prisma.service.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: allServices, // Return the list of services with ratings
  };
};



const updateServicePriceByOffer = async (serviceId: string, offerId: string): Promise<Service | null> => {
  // Fetch the service and the offer concurrently
  const [service, offer] = await Promise.all([
    prisma.service.findUnique({
      where: { id: serviceId },
    }),
    prisma.offer.findUnique({
      where: { id: offerId },
    }),
  ]);

  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }

  if (!offer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offer not found');
  }

  if (service.offerId === offerId) {
    // Check if the existing offer's end date has expired
    const currentDate = new Date();
    if (offer.endDate && offer.endDate < currentDate) {
      // If the offer has expired, reset the service's offer-related fields
      const result = await prisma.service.update({
        where: { id: serviceId },
        data: {
          offeredPrice: null,
          offerId: null,
        },
      });
      return result;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Service already has an active offer assigned');
    }
  }

  let updatedData: Partial<Service> = {
    offerId: offerId, // Update the offerId in the service
  };

  if (offer.status === offerStatus.Active) {
    // Calculate the new offered price based on the discount
    const discount = offer.discount; // Assuming discount is in percentage
    const regularPrice = service.regularPrice;
    const discountedPrice = regularPrice * (1 - discount / 100);

    updatedData = {
      ...updatedData,
      offeredPrice: discountedPrice,
    };
  } else {
    // If the offer is inactive, reset the offeredPrice
    updatedData = {
      ...updatedData,
      offeredPrice: null, // or 0 if you prefer
    };
  }

  // Update the service with the new offered price and offerId
  const result = await prisma.service.update({
    where: { id: serviceId },
    data: updatedData,
  });

  return result;
};



const getAllOfferedServicesProvidersFromDB = async (id: string): Promise<Service[]> => { 
  
  const provider = await prisma.provider.findUnique({
    where: {
      id: id, 
    },
    select: {
      role: true, 
    },
  });


  if (!provider || !provider.role) {
    throw new Error("Provider not found or role is undefined");
  }

  
  const isAdmin = provider.role === 'Admin';

  const result = await prisma.service.findMany({
    where: {
      offerId: {
        not: null, 
      },
      ...(isAdmin ? {} : { providerId: id }), 
    },
    include: {
      offer: true,  
      provider: true, 
      category:true
    },
  });

  return result;
};
const getAllOfferedServicesFromDB = async (): Promise<any[]> => {
  const today = new Date(); // Get today's date
  const result = await prisma.service.findMany({
    where: {
      offerId: {
        not: null,
      },
      offer: {
        endDate: {
          gte: today, 
        },
      },
    },
    include: {
      offer: true,
      provider: true,
      reviews: {
        select: {
          rating: true,
        },
      },
      category: true,
    },
  });

  // Calculate days left for each service
  const servicesWithDaysLeft = result.map(service => {
    const offerEndDate = service.offer?.endDate; 
    const daysLeft = offerEndDate ? ((offerEndDate.getTime() - today.getTime()) / (1000 * 3600 * 24)).toFixed(0) : 0;

    return {
      ...service,
      daysLeft: Number(daysLeft), // Ensure daysLeft is a number
    };
  });

  // Calculate total reviews and average rating for each service
  const servicesWithReviews = servicesWithDaysLeft.map((service) => {
    const reviews = service.reviews || [];
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.ceil(reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews)
        : 0;

    return {
      ...service, // Spread the service object to include its properties
      totalReviews,
      averageRating,
    };
  });

  return servicesWithReviews; // Return the final array of services
};


const deleteOfferedServiceFromDB = async (serviceId: string): Promise<Service | null> => {
  // Update the specific service to set offerId and offeredPrice to null
  const updatedService = await prisma.service.update({
    where: {
      id: serviceId, // Identify the specific service by serviceId
    },
    data: {
      offerId: null, // Set offerId to null
      offeredPrice: null, // Set offeredPrice to null
    },
    include: {
      offer: true, // Optionally include the related offer data
      provider: true, // Optionally include the provider data
    },
  });

  // Return the updated service
  return updatedService;
};

const getByIdFromDB = async (serviceId: string) => {
  const result = await prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      serviceName: true,
      description: true,
      regularPrice: true,
      offeredPrice: true,
      location: true,
      duration: true,
      videoUrl: true,
      serviceImg: true,
      status: true,
      categoryId: true,
      keyFeature1: true,
      keyFeature2: true,
      keyFeature3: true,
      keyFeature4: true,
      providerId: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          categoryName: true,
          categoryImg: true,
          categoryIcon: true,
        },
      },
      provider: {
        select: {
          id: true,
          fName: true,
          lName: true,
          email: true,
          gender: true,
          dob: true,
          bio: true,
          contactNo: true,
          address: true,
          profileImg: true,
          createdAt: true,
          approvalStatus: true,
          reviewProviders: {  
            select: {
              rating: true,
            },
          },
        },
      },
      reviews: true,
    },
  });

  if (!result) {
    throw new Error("Service not found");
  }

  // Calculate provider's average rating and total reviews count
  const providerReviews = result.provider.reviewProviders || [];
  const totalProviderReviews = providerReviews.length;
  const averageProviderRating = totalProviderReviews > 0
    ? providerReviews.reduce((sum, review) => sum + review.rating, 0) / totalProviderReviews
    : 0;

  // Calculate service's average rating and total reviews count
  const serviceReviews = result.reviews || [];
  const totalServiceReviews = serviceReviews.length;
  const averageServiceRating = totalServiceReviews > 0
    ? serviceReviews.reduce((sum, review) => sum + review.rating, 0) / totalServiceReviews
    : 0;

  return {
    ...result,
    provider: {
      ...result.provider,
      averageRating: parseFloat(averageProviderRating.toFixed(2)),
      totalReviews: totalProviderReviews,
    },
    averageServiceRating: parseFloat(averageServiceRating.toFixed(2)),
    totalServiceReviews,
  };
};


const getAdditionalServiceFromDB = async (excludedServiceId: string): Promise<ServicePreview[]> => {
  const result = await prisma.service.findMany({
    where: {
      id: {
        not: excludedServiceId,
      },
    },
    select: {
      id: true,
      serviceName: true,
      regularPrice: true,
      serviceImg: true,
      location: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return result;
};

const getRelatedServiceFromDB = async (categoryId: string, excludedServiceId: string): Promise<Service[]> => {
  const result = await prisma.service.findMany({
    where: {
      categoryId: categoryId,
      id: {
        not: excludedServiceId,
      },
    },
    include:{
      category:true,
      provider:true,
      reviews: {
        select: {
          rating: true, 
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  const servicesWithReviews = result
  .map((service) => {
    const reviews = service.reviews || []; 
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    return {
      ...service, 
      totalReviews,
      averageRating,
    };
  })
  

return servicesWithReviews; 
};

const getMostPopularServicesFromDB = async (): Promise<any[]> => {
  // Fetch services from the database
  const result = await prisma.service.findMany({
    include: {
      offer: true,
      provider: true,
      reviews: {
        select: {
          rating: true, 
        },
      },
      category: true, 
    },
  });

  
  const servicesWithReviews = result
    .map((service) => {
      const reviews = service.reviews || []; 
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      return {
        ...service, 
        totalReviews,
        averageRating,
      };
    })
    .filter((service) => service.averageRating >= 4); 

  return servicesWithReviews; 
};


const updateOneInDB = async (
  id: string,
  payload: Partial<Service>
): Promise<Service> => {
  console.log("Incoming Payload:", payload);

  // Fetch the existing service
  const existingService = await prisma.service.findFirst({
    where: { id },
  });

  // Check if the service exists
  if (!existingService) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service does not exist');
  }

  console.log("Existing Service:", existingService);

  // Prepare the data to be updated dynamically from the payload
  const dataToUpdate: any = {};

  // Loop through each field in the payload and compare with the existing data
  (Object.keys(payload) as Array<keyof Service>).forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== existingService[key]) {
      dataToUpdate[key] = payload[key]; // Dynamically add the field and value to update
    }
  });

  // Ensure something is being updated
  if (Object.keys(dataToUpdate).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No valid fields to update');
  }

  console.log("Fields to Update:", dataToUpdate);

  // Update the service with the new data
  const updatedService = await prisma.service.update({
    where: { id },
    data: dataToUpdate,
    include: { category: true }, // Include related data if needed
  });

  console.log("Updated Service:", updatedService);

  return updatedService;
};





const deleteByIdFromDB = async (id: string): Promise<Service> => {
  let result: Service;

  await prisma.$transaction(async transaction => {
    const isserviceExist = await transaction.service.findFirst({
      where: {
        id,
      },
      include: {
        bookings: true, // Include bookings relation
      },
    });

    if (!isserviceExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'service does not exist');
    }

    // Delete bookings associated with the service
    await transaction.booking.deleteMany({
      where: {
        serviceId: id,
      },
    });

    // Delete reviews associated with the service
    await transaction.review.deleteMany({
      where: {
        serviceId: id,
      },
    });

    // Delete the service
    result = await transaction.service.delete({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });
  });

  return result!;
};

const getOverview = async (providerId: string | null): Promise<any> => {
  if (!providerId) {
    throw new Error("Provider ID is null.");
  }

  // Fetch the provider's role from the provider table
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { role: true },
  });



  if (!provider) {
    throw new Error("Unauthorized access. User not found.");
  }
 
 


  // Helper function to calculate weekly earnings
  const calculateWeeklyEarnings = async (providerId: string | null) => {
    const today = new Date();

  // Set the date for seven days ago, to the start of the day
  const sevenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
  
  // Log the start of seven days ago in the required format
  console.log("Start of Seven Days Ago:", sevenDaysAgo.toISOString());
    const payments = await prisma.payment.findMany({
      where: {
        ...(providerId && { booking: { service: { providerId } } }), // Apply provider filter if providerId is provided
        createdAt: { gte: sevenDaysAgo.toISOString() }, // Payments from the last 7 days
      },
      select: {
        createdAt: true,
        amount: true,
      },
    });
  
    console.log({ payments });
  
    // Create an object to store the sum of earnings by day (e.g., "Mon", "Tue", etc.)
    const sumByDay: Record<string, number> = {};
  
    // Loop through each payment and sum the earnings by day of the week
    payments.forEach((payment) => {
      const day = new Date(payment.createdAt).toLocaleDateString('en-US', {
        weekday: 'short', // Get the short form of the weekday ("Mon", "Tue", etc.)
      });
      sumByDay[day] = sumByDay[day] ? sumByDay[day] + payment.amount : payment.amount;
    });
  
    // Return the earnings for each day of the week in the order: "Sun", "Mon", "Tue", etc.
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
      name: day,
      earning: sumByDay[day] || 0, // If no earnings for that day, return 0
    }));
  };
  
  

  switch (provider.role) {
    case 'Provider':
      // Fetch total number of services provided by the provider
      const totalServices = await prisma.service.count({
        where: { providerId },
      });

      // Fetch total number of bookings for the provider's services
      const totalBookings = await prisma.booking.count({
        where: { service: { providerId } },
      });

      // Fetch total earnings for the provider
      const earningsData = await prisma.payment.aggregate({
        where: { booking: { service: { providerId } } },
        _sum: { amount: true },
        _count: true,
      });

      const totalEarnings = {
        amount: earningsData._sum.amount || 0,
        totalPayments: earningsData._count || 0,
      };

      // Fetch last 5 payments made for the provider's services
      const lastFivePayments = await prisma.payment.findMany({
        where: { booking: { service: { providerId } } },
        include: {
          booking: {
            include: {
              service: true,
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Fetch last 5 bookings made for the provider's services
      const lastFiveBookings = await prisma.booking.findMany({
        where: { service: { providerId } },
        include: {
          user: true,
          service: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Calculate weekly earnings
      const formattedRevenueData = await calculateWeeklyEarnings(providerId);

      return {
        role: provider.role,
        totalServices,
        totalBookings,
        totalEarnings,
        formattedRevenueData,
        lastFivePayments,
        lastFiveBookings,
      };

    case 'Admin':
      // Fetch total number of services
      const totalServicesAdmin = await prisma.service.count();

      // Fetch total number of providers
      const totalProviders = await prisma.provider.count();

      const totalUsers = await prisma.user.count();

      // Fetch total earnings (sum of all payments)
      const earningsDataAdmin = await prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
      });

      const categoryServiceCounts = await prisma.category.findMany({
        select: {
          categoryName: true,
          _count: {
            select: {
              services: true,
            },
          },
        },
      });


      const formattedCategoryServiceCounts = categoryServiceCounts.map(category => ({
        name: category.categoryName,
        totalServices: category._count.services,
      }));


      const totalEarningsAdmin = {
        amount: earningsDataAdmin._sum.amount ? earningsDataAdmin._sum.amount * 0.10 : 0, // Admin takes 10%
        totalPayments: earningsDataAdmin._sum.amount || 0,
      };

      // Calculate weekly earnings for the platform
      const formattedRevenueDataAdmin = await calculateWeeklyEarnings(null);

      // Fetch last 5 payments globally
      const lastFivePaymentsAdmin = await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              service: true,
              user: true,
            },
          },
        },
        take: 5,
      });

      return {
        role: provider.role,
        totalServices:totalServicesAdmin, 
        totalProviders,
        totalUsers,
        formattedCategoryServiceCounts,
        totalEarnings: totalEarningsAdmin,
        formattedRevenueData: formattedRevenueDataAdmin,
        categoryServiceCounts,
        lastFivePayments: lastFivePaymentsAdmin,
      };

    default:
      throw new Error("Unauthorized access. User role is not recognized.");
  }
};




export const ServiceServices = {
  insertIntoDB,
  getAllFromDB,
  getSingleProviderServiceFromDB,
  getAllProviderServiceFromDB,
  updateServicePriceByOffer,
  getByIdFromDB,
  getAllOfferedServicesProvidersFromDB,
  getAllOfferedServicesFromDB,
  deleteOfferedServiceFromDB,
  getAdditionalServiceFromDB,
  getMostPopularServicesFromDB,
  getRelatedServiceFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  getOverview,
};


