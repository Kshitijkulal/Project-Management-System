import { ROLE_PERMISSIONS } from "./permissions.js";
import ApiError from "./apiError.js";

export const checkPermission = (role, permission) => {
  const allowed = ROLE_PERMISSIONS[role] || [];

  if (!allowed.includes(permission)) {
    throw new ApiError(403, "Forbidden");
  }
};