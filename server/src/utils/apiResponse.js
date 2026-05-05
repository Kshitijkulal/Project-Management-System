export const successResponse = (res, data, message = "Success") => {
  return res.json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message, status = 500) => {
  return res.status(status).json({
    success: false,
    message
  });
};