import { NextFunction, Request, Response, Router } from 'express'
import { UserController } from './user.controller'
import auth from '../../middlewares/auth'
import { fileUploader } from '../../helper/fileUploader'
import { UserValidation } from './user.validation'
import { UserRole } from '@prisma/client'

const router = Router()

//get all user
router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.getAllUser,
)

//create admin
router.post(
  '/create-admin',
  fileUploader.upload.single('file'),
  auth('ADMIN', 'SUPER_ADMIN'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminValidation.parse(
      JSON.parse(req.body.data),
    )
    return UserController.createAdmin(req, res, next)
  },
)

//create doctor
router.post(
  '/create-doctor',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createDoctorValidation.parse(
      JSON.parse(req.body.data),
    )
    return UserController.createDoctor(req, res, next)
  },
)

//create patient
router.post(
  '/create-patient',
  fileUploader.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createPatientValidation.parse(
      JSON.parse(req.body.data),
    )
    return UserController.createPatient(req, res, next)
  },
)

router.patch(
  '/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.updateUserStatus,
)

export const UserRoutes = router
