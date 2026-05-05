import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: "Token de acceso requerido" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_secreto");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado" });
  }
};

export const soloAdmin = (req, res, next) => {
  if (req.user?.rol !== "admin") {
    return res.status(403).json({ mensaje: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

export default { verificarToken, soloAdmin };