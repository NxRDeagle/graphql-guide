import jwt from "jsonwebtoken";

export const isAuthMiddleware = (request, _response, next) => {
  const authHeader = request.get("Authorization");
  if (!authHeader) {
    request.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1]; // authHeader contains string: '[bearer] [token]'
  if (!token || token === "") {
    request.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    request.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    request.isAuth = false;
    return next();
  }
  request.isAuth = true;
  request.userId = decodedToken.userId;
  next();
};
