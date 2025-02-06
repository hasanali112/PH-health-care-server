/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import prisma from '../../shared/prisma'
import { fileUploader } from '../../helper/fileUploader'
import { IFile } from '../../interfaces/file'
import { Request } from 'express'
import { IPaginationOptions } from '../../interfaces/pagination'
import { paginatioHelper } from '../../helper/peginationHelper'
import ApiError from '../../errors/ApiErrors'

const createAdmin = async (req: Request) => {
  const file = req.file

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url
  }

  const hasedPassword: string = await bcrypt.hash(req.body.password, 10)
  const userData = {
    email: req.body.admin.email,
    password: hasedPassword,
    role: UserRole.ADMIN,
  }

  const result = await prisma.$transaction(async transactionClient => {
    await transactionClient.user.create({
      data: userData,
    })

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    })

    return createdAdminData
  })

  return result
}

const createDoctorIntoDB = async (req: Request) => {
  const file = req.file as IFile

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url
  }

  const hasedPassword: string = await bcrypt.hash(req.body.password, 10)
  const userData = {
    email: req.body.doctor.email,
    password: hasedPassword,
    role: UserRole.DOCTOR,
  }

  const result = await prisma.$transaction(async transactionClient => {
    await transactionClient.user.create({
      data: userData,
    })

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    })

    return createdDoctorData
  })

  return result
}

//create patient
const createPatientIntoDB = async (req: Request) => {
  const file = req.file as IFile

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)
    req.body.patient.profilePhoto = uploadToCloudinary?.secure_url
  }

  const hasedPassword: string = await bcrypt.hash(req.body.password, 10)
  const userData = {
    email: req.body.patient.email,
    password: hasedPassword,
    role: UserRole.PATIENT,
  }

  const result = await prisma.$transaction(async transactionClient => {
    await transactionClient.user.create({
      data: userData,
    })

    const createdPatientData = await transactionClient.patient.create({
      data: req.body.patient,
    })

    return createdPatientData
  })

  return result
}

const getAllUserFromDB = async (params: any, options: IPaginationOptions) => {
  const { limit, skip, page } = paginatioHelper.calculatePagination(options)
  const { searchTerm, ...filterData } = params
  const andConditions: Prisma.UserWhereInput[] = []

  const searchableFields = ['role', 'email', 'status']
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

  const whereCondition: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {}

  const result = await prisma.user.findMany({
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
    select: {
      id: true,
      email: true,
      role: true,
      needsPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      doctor: true,
      patient: true,
    },
  })

  const total = await prisma.user.count({
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

const userUpdateStatusIntoDB = async (
  id: string,
  data: { status: UserStatus },
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  if (!isUserExist) {
    throw new ApiError(403, 'User not found')
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: data,
    select: {
      id: true,
      email: true,
      role: true,
      needsPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return result
}

const getMyProfile = async (user: any) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    select: {
      id: true,
      email: true,
      needsPasswordChange: true,
      role: true,
      status: true,
    },
  })

  let profileInfo

  if (user.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  } else if (user.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  } else if (user.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  } else if (user.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    })
  }

  return {
    ...userInfo,
    ...profileInfo,
  }
}

export const UserService = {
  createAdmin,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUserFromDB,
  userUpdateStatusIntoDB,
  getMyProfile,
}
