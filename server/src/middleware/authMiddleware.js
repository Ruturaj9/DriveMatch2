import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
