const obtenerIpCliente = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket.remoteAddress;
};

const validarIpPermitida = (req, res, next) => {
  const ipCliente = obtenerIpCliente(req);

  const ipsPermitidas = process.env.ADMIN_ALLOWED_IPS
    ? process.env.ADMIN_ALLOWED_IPS.split(",").map(ip => ip.trim())
    : [];

  const ipNormalizada = ipCliente.replace("::ffff:", "");

  if (!ipsPermitidas.includes(ipNormalizada)) {
    return res.status(403).json({
      mensaje: "Acceso denegado. IP no autorizada para el módulo administrador.",
      ipDetectada: ipNormalizada
    });
  }

  next();
};

module.exports = validarIpPermitida;