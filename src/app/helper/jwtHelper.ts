/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken'

const generateToken = (payload: any, secret: string, expiresInTime: string) => {
  const token = jwt.sign(payload, secret, {
    expiresIn: expiresInTime as SignOptions['expiresIn'],
    algorithm: 'HS256',
  })

  return token
}

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload
}

export const JwtHelper = { generateToken, verifyToken }
