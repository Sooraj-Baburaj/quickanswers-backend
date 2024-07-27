import jwt from "jsonwebtoken";

const isAdmin = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (token) {
        const user = jwt.verify(token, process.env.SECRET);
        if (user && user?.isAdmin) {
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

export default isAdmin;
