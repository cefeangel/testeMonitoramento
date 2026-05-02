export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  if (statusCode === 500) {
    console.error(' [ERROR 500]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    errors: err.errors || [],
  });
};
