/* eslint-disable @typescript-eslint/no-explicit-any */
import { Admin, Prisma, UserStatus } from '@prisma/client'
import { searchableFields } from './admin.constant'
import { paginatioHelper } from '../../helper/peginationHelper'
import prisma from '../../shared/prisma'
import { IAdminFilterRequest } from './admin.interface'
import { IPaginationOptions } from '../../interfaces/pagination'

const getAdminFromDB = async (
  params: IAdminFilterRequest,
  options: IPaginationOptions,
) => {
  const { limit, skip, page } = paginatioHelper.calculatePagination(options)
  const { searchTerm, ...filterData } = params
  const andConditions: Prisma.AdminWhereInput[] = []

  //for search
  if (searchTerm) {
    andConditions.push({
      OR: searchableFields.map(fields => ({
        [fields]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    })
  }

  //for filter data
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    })
  }

  andConditions.push({
    isDeleted: false,
  })

  const whereCondition: Prisma.AdminWhereInput = { AND: andConditions }

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
            createdAt: 'desc',
          },
  })

  const total = await prisma.admin.count({
    where: whereCondition,
  })

  return {
    meta: {
      page,
      limit,
      total,
    },

    data: result,
  }
}

const getByIdFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  })
  return result
}

const updateAdminIntoDB = async (
  id: string,
  data: Partial<Admin>,
): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  })

  const result = await prisma.admin.update({
    where: {
      id,
    },
    data,
  })
  return result
}

const deleteAdminFromDB = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  })
  const result = await prisma.$transaction(async transactionClinet => {
    const adminDeletedData = await transactionClinet.admin.delete({
      where: {
        id,
      },
    })
    await transactionClinet.user.delete({
      where: {
        email: adminDeletedData.email,
      },
    })
    return adminDeletedData
  })

  return result
}

const softDeleteFromDB = async (id: string) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  })

  const result = await prisma.$transaction(async transactionClinet => {
    const adminSoftDeletedData = await transactionClinet.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    })
    await transactionClinet.user.update({
      where: {
        email: adminSoftDeletedData.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    })
    return adminSoftDeletedData
  })

  return result
}

export const AdminService = {
  getAdminFromDB,
  getByIdFromDB,
  updateAdminIntoDB,
  deleteAdminFromDB,
  softDeleteFromDB,
}
