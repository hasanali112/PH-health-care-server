import { UserService } from './user.service'
import catchAysnc from '../../shared/catchAsync'
import pick from '../../shared/pick'
import sendResponse from '../../shared/sendResponse'
import { IAuthUser } from '../../interfaces/common'

//create admin
const createAdmin = catchAysnc(async (req, res) => {
  const result = await UserService.createAdmin(req)
  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: result,
  })
})

//create doctor
const createDoctor = catchAysnc(async (req, res) => {
  const result = await UserService.createDoctorIntoDB(req)
  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: result,
  })
})

//create patient
const createPatient = catchAysnc(async (req, res) => {
  const result = await UserService.createPatientIntoDB(req)
  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: result,
  })
})

const getAllUser = catchAysnc(async (req, res) => {
  const userFilterableFields = ['role', 'email', 'status', 'searchTerm']
  const filter = pick(req.query, userFilterableFields)
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

  const result = await UserService.getAllUserFromDB(filter, options)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  })
})

const updateUserStatus = catchAysnc(async (req, res) => {
  const { id } = req.params
  const result = await UserService.userUpdateStatusIntoDB(id, req.body)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User status updated successfully',
    data: result,
  })
})

const getMyProfile = catchAysnc(async (req, res) => {
  const user = req.user
  const result = await UserService.getMyProfile(user as IAuthUser)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My profile data fatch',
    data: result,
  })
})

const updateMyProfile = catchAysnc(async (req, res) => {
  const user = req.user
  const result = await UserService.updateMyProfile(user as IAuthUser, req)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My profile updated',
    data: result,
  })
})

export const UserController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
  updateUserStatus,
  getMyProfile,
  updateMyProfile,
}
