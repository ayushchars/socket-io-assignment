import jwt from 'jsonwebtoken';

export const requireSignin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Jwt token missing"
    });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {   
    return res.status(401).send({
      success: false,
      message: "Unauthorized Access."
  });
  }
};