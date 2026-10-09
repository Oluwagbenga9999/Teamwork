const admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      status: 'error',
      error: 'Only an admin can perform this action',
    });
  }
  return next();
};

export default admin;