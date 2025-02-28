import jwt from "jsonwebtoken";

// MIDDLEWARE FOR AUTHORIZATION (MAKING SURE THEY ARE LOGGED IN)
const isAuthorized = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (token) {
        const user = jwt.verify(token, process.env.SECRET);
        if (user && !user?.isGuest) {
          req.user = user;
          next();
        } else {
          res.status(401).json({ message: "invalid token", error: true });
        }
      } else {
        res.status(400).json({ message: "malformed auth header", error: true });
      }
    } else {
      res.status(400).json({ message: "No authorization header", error: true });
    }
  } catch (error) {
    res.status(500).json({ error, message: "Internal Server error" });
  }
};

export default isAuthorized;
