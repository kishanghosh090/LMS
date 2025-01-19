import { ApiError, catchAsync } from "./error.middleware.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new ApiError("Not authorized to access this route", 401);
  }
  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    req.id = decoded.userId;
    next();
  } catch (error) {
    throw new ApiError("Not authorized to access this route", 401);
  }
});
