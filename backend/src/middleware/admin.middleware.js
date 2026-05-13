const verificarAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      mensaje: "Usuario no autenticado."
    });
  }

  if (req.usuario.rol !== "Administrador") {
    return res.status(403).json({
      mensaje: "Acceso denegado. Se requiere rol de administrador."
    });
  }

  next();
};

module.exports = verificarAdmin;