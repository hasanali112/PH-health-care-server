import { Prisma, PrismaClient } from "@prisma/client";
import { searchableFields } from "./admin.constant";

const prisma = new PrismaClient();

const getAdminFromDB = async (params: any, options: any) => {
  const { limit, page } = options;
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
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });
  return result;
};

export const AdminService = {
  getAdminFromDB,
};
