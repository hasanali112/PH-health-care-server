import { Prisma } from "@prisma/client";
import { searchableFields } from "./admin.constant";
import { paginatioHelper } from "../../helper/peginationHelper";
import prisma from "../../shared/prisma";

const getAdminFromDB = async (params: any, options: any) => {
  const { limit, skip } = paginatioHelper.calculatePagination(options);
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
  return result;
};

export const AdminService = {
  getAdminFromDB,
};
