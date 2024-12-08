import { ComboPack } from '@prisma/client';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';


const insertIntoDB = async (data: { comboName: string, plan: string, selectedServices: string[], amount: number,discountAmount : number, discount:number }, providerId: string): Promise<ComboPack> => {
    
  const comboData = {
    comboName: data.comboName,
    plan: data.plan,
    services: data.selectedServices, 
    amount: data.amount, 
    discountAmount: data.discountAmount, 
    providerId: providerId, 
    discount: data.discount
  };

  // Create a new ComboPack entry in the database
  const result = await prisma.comboPack.create({
    data: comboData,
    include: {
      provider: true, // Include provider information if necessary
    },
  });

  return result; 
};



type FormattedComboPack = {
  plan: string;
  services: string[];
  providerImage: string;
  providerName: string;
  providerInfo: string;
  amount: number;
  discountAmount: number;
  discount: number;
  
};


const getAllFromDBForProvider = async (providerId: string): Promise<FormattedComboPack[]> => {
  // First, fetch the provider's role based on the providerId
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { role: true },
  });

  // Return an empty array if the provider doesn't exist or the role isn't found
  if (!provider) {
    throw new Error('Provider not found');
  }

  // Construct the query based on the provider's role
  const isAdmin = provider.role === 'Admin';

  const comboPacks = await prisma.comboPack.findMany({
    where: isAdmin ? {} : { providerId }, // Fetch all if Admin, otherwise filter by providerId
    include: {
      provider: {
        include: {
          category: true,
        },
      },
    },
  });

  // Fetch all services to build a service map
  const services = await prisma.service.findMany({
    select: {
      id: true,
      serviceName: true,
    },
  });

  // Create a service map with service IDs as keys and service names as values
  const serviceMap = services.reduce((acc, service) => {
    acc[service.id] = service.serviceName;
    return acc;
  }, {} as Record<string, string>);

  // Format the data based on the retrieved combo packs
  const formattedData:any = comboPacks.map((pack) => {
    const providerDetails = pack.provider;

    // Build provider information fields
    const providerName = providerDetails ? `${providerDetails.fName} ${providerDetails.lName}` : "Unknown Provider";
    const providerImage = providerDetails?.profileImg?.length
      ? providerDetails.profileImg[providerDetails.profileImg.length - 1]
      : "";
    const providerCategory =
      providerDetails?.role === 'Admin'
        ? 'Admin'
        : providerDetails?.category?.categoryName || "Unknown Category";

    return {
      id: pack?.id,
      name: pack.comboName,
      plan: pack.plan,
      services: pack.services.map((serviceId) => serviceMap[serviceId] || ""),
      providerImage: providerImage,
      providerName: providerName,
      providerInfo: providerCategory,
      amount: pack.discountAmount,
    };
  });

  return formattedData;
};

const getAllFromDB = async (): Promise<FormattedComboPack[]> => {
  const result = await prisma.comboPack.findMany({
    include: {
      provider: {
        include: {
          category: true,
        },
      },
    },
  });

  const services = await prisma.service.findMany({
    select: {
      id: true,
      serviceName: true,
    },
  });

  // Create a service map
  const serviceMap = services.reduce((acc, service) => {
    acc[service.id] = service.serviceName;
    return acc;
  }, {} as Record<string, string>);

  // Format the result data
  const formattedData: any[] = result.map((pack) => {
    const provider = pack.provider;

    // Build provider information fields
    const providerName = provider ? `${provider.fName} ${provider.lName}` : "Unknown Provider";
    const providerImage = provider && provider.profileImg?.length
      ? provider.profileImg[provider.profileImg.length - 1]
      : "";
    const providerCategory =
      provider?.role === 'Admin'
        ? 'Admin'
        : provider?.category?.categoryName || "Unknown Category";

    return {
      id:pack?.id,
      name:pack.comboName,
      plan: pack.plan,
      services: pack.services.map((serviceId) => serviceMap[serviceId] || ""),
      providerImage: providerImage,
      providerName: providerName,
      providerInfo: providerCategory,
      amount: pack.discountAmount,
    };
  });

  return formattedData
}
const getSingleServiceFromDB = async (id: string): Promise<FormattedComboPack | null> => {
  // Fetch the single comboPack entry using the provided ID
  const result = await prisma.comboPack.findUnique({
    where: { id },
  });

  // If no record is found, return null
  if (!result) {
    return null;
  }

  // Fetch all services to create a service mapping
  const services:any = await prisma.service.findMany({
    select: {
      id: true,
      serviceName: true,
    },
  });

  // Create a service map for quick lookup
  const serviceMap = services.reduce((acc:any, service:any) => {
    acc[service.id] = service.serviceName;
    return acc;
  }, {} as Record<string, string>);

  // Format and return the comboPack data
  const formattedData: any = {
    id: result.id,
    comboName: result.comboName,
    plan: result.plan,
    // Map the services to an array of objects with id and serviceName
    services: result.services.map((serviceId) => ({
      id: serviceId,
      serviceName: serviceMap[serviceId] || "Unknown Service",
    })),
    amount: result.amount,
    discountAmount: result.discountAmount,
    discount: result.discount
  };

  return formattedData;
};


const UpdateOneIntoDB = async (
    id: string, 
    data: {
      comboName: string;
      plan: string;
      selectedServices: string[];
      amount: number;
      discountAmount: number;
      discount: number;
    },
   
  ): Promise<ComboPack> => {
    
    const updatedData = {
      comboName: data.comboName,
      plan: data.plan,
      services: data.selectedServices, 
      amount: data.amount,
      discountAmount: data.discountAmount,
      discount: data.discount,
    
    };
  
    
    const result = await prisma.comboPack.update({
      where: { id }, 
      data: updatedData,
      include: {
        provider: true, 
      },
    });
  
    return result;
  };

  const deleteByIdFromDB = async (id: string): Promise<ComboPack | null> => {
    
    const isComboPackExist = await prisma.comboPack.findFirst({
      where: { id },
    });
  
    // If the ComboPack does not exist, throw an error with 404 status
    if (!isComboPackExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'ComboPack does not exist');
    }
  
    // Delete the ComboPack and return the deleted data
    const result = await prisma.comboPack.delete({
      where: { id },
    });
  
    return result;
  };

export const ComboPackService = {
  insertIntoDB,
  getAllFromDBForProvider,
  getAllFromDB,
  UpdateOneIntoDB,
  getSingleServiceFromDB,
  deleteByIdFromDB
};
