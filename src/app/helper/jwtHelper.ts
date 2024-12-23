import jwt from "jsonwebtoken";

const generateToken = (payload: any, secret: string, expiresInTime: string) => {
  const token = jwt.sign(payload, secret, {
    expiresIn: expiresInTime,
    algorithm: "HS256",
  });

  return token;
};

export default generateToken;
