import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ errors: "Unauthorized" }).end();
  }

  // Handle jika menggunakan format 'Bearer <token>' atau token langsung
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  try {
    const jwtSecret = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ errors: "Unauthorized / Token Expired" })
      .end();
  }
};
