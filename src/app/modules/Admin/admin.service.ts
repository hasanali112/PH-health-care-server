import { Admin, Prisma } from "@prisma/client";
import { searchableFields } from "./admin.constant";
import { paginatioHelper } from "../../helper/peginationHelper";
import prisma from "../../shared/prisma";

const getAdminFromDB = async (params: any, options: any) => {
  const { limit, skip, page } = paginatioHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.AdminWhereInput[] = [];

  //for search
  if (params.searchTerm) {
    andConditions.push({
      OR: searchableFields.map((fields) => ({
        [fields]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  //for filter data
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AdminWhereInput = { AND: andConditions };

  const result = await prisma.admin.findMany({
    where: whereCondition,
    skip: skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.admin.count({
    where: whereCondition,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },

    data: result,
  };
};

const getByIdFromDB = async (id: string) => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateAdminIntoDB = async (id: string, data: Partial<Admin>) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id,
    },
    data,
  });
  return result;
};

const deleteAdminFromDB = async (id: string) => {
  const result = await prisma.$transaction(async (transactionClinet) => {
    const adminDeletedData = await transactionClinet.admin.delete({
      where: {
        id,
      },
    });
    const userDeletedData = await transactionClinet.user.delete({
      where: {
        email: adminDeletedData.email,
      },
    });
    return adminDeletedData;
  });

  return result;
};

export const AdminService = {
  getAdminFromDB,
  getByIdFromDB,
  updateAdminIntoDB,
  deleteAdminFromDB,
};
