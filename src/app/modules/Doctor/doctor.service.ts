/* eslint-disable @typescript-eslint/no-explicit-any */
import { Doctor, Prisma, UserStatus } from '@prisma/client'
import { IDoctorFilterRequest, IDoctorUpdate } from './doctor.interface'
import { IPaginationOptions } from '../../interfaces/pagination'
import { doctorSearchableFields } from './doctor.constants'
import { paginatioHelper } from '../../helper/peginationHelper'
import prisma from '../../shared/prisma'

const getAllFromDB = async (
  filters: IDoctorFilterRequest,
  options: IPaginationOptions,
) => {
  const { limit, page, skip } = paginatioHelper.calculatePagination(options)
  const { searchTerm, specialties, ...filterData } = filters

  const andConditions: Prisma.DoctorWhereInput[] = []

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    })
  }

  // doctor > doctorSpecialties > specialties -> title

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialities: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: 'insensitive',
            },
          },
        },
      },
    })
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map(key => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }))
    andConditions.push(...filterConditions)
  }

  andConditions.push({
    isDeleted: false,
  })

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {}

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    // orderBy: options.sortBy && options.sortOrder
    //     ? { [options.sortBy]: options.sortOrder }
    //     : { averageRating: 'desc' },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
      // review: {
      //     select: {
      //         rating: true
      //     }
      // }
    },
  })

  const total = await prisma.doctor.count({
    where: whereConditions,
  })

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  }
}

const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
      // review: true
    },
  })
  return result
}

const updateIntoDB = async (id: string, payload: IDoctorUpdate) => {
  const { specialties, ...doctorData } = payload

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  })

  await prisma.$transaction(async transactionClient => {
    await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    })

    if (specialties && specialties.length > 0) {
      // delete specialties
      const deleteSpecialtiesIds = specialties.filter(
        specialty => specialty.isDeleted,
      )
      //console.log(deleteSpecialtiesIds)
      for (const specialty of deleteSpecialtiesIds) {
        await transactionClient.doctorSpecialities.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiedId: specialty.specialtiesId,
          },
        })
      }

      // create specialties
      const createSpecialtiesIds = specialties.filter(
        specialty => !specialty.isDeleted,
      )
      console.log(createSpecialtiesIds)
      for (const specialty of createSpecialtiesIds) {
        await transactionClient.doctorSpecialities.create({
          data: {
            doctorId: doctorInfo.id,
            specialitiedId: specialty.specialtiesId,
          },
        })
      }
    }
  })

  const result = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
    },
  })
  return result
}

const deleteFromDB = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async transactionClient => {
    const deleteDoctor = await transactionClient.doctor.delete({
      where: {
        id,
      },
    })

    await transactionClient.user.delete({
      where: {
        email: deleteDoctor.email,
      },
    })

    return deleteDoctor
  })
}

const softDelete = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async transactionClient => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    })

    await transactionClient.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    })

    return deleteDoctor
  })
}

export const DoctorService = {
  updateIntoDB,
  getAllFromDB,
  getByIdFromDB,
  deleteFromDB,
  softDelete,
}
