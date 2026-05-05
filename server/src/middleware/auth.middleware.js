import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

export const protect = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    throw new ApiError(401, "Invalid token");
  }
};