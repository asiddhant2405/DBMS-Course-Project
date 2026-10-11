export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // MySQL specific errors
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    return res.status(409).json({
      success: false,
      errorType: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
      message: 'Cannot delete or modify this record because related child records in other tables depend on it.',
      details: err.message
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    return res.status(400).json({
      success: false,
      errorType: 'INVALID_FOREIGN_KEY',
      message: 'Referenced foreign key does not exist. Please check the referenced ID.',
      details: err.message
    });
  }

  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    return res.status(409).json({
      success: false,
      errorType: 'DUPLICATE_ENTRY',
      message: 'A record with this unique identifier or field already exists in the database.',
      details: err.message
    });
  }

  if (err.code === 'ER_DATA_TOO_LONG' || err.errno === 1406) {
    return res.status(400).json({
      success: false,
      errorType: 'DATA_TOO_LONG',
      message: 'One or more input values exceed the maximum column length.',
      details: err.message
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
