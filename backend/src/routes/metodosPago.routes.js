const express = require("express");
const MetodoPago = require("../models/metodoPago.model");
const verificarToken = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/usuario/:usuarioId", verificarToken, async (req, res) => {
  try {
    const metodos = await MetodoPago.find({
      UsuarioID: req.params.usuarioId
    }).sort({ MetodoPagoID: 1 });

    res.json({
      mensaje: "Métodos de pago obtenidos correctamente",
      total: metodos.length,
      data: metodos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener métodos de pago",
      error: error.message
    });
  }
});

router.post("/agregar", verificarToken, async (req, res) => {
  try {
    const usuarioId = req.body.UsuarioID || req.usuario.id;
    const numeroTarjeta = String(req.body.NumeroTarjeta || req.body.numeroTarjeta || "");
    const tipoTarjeta = req.body.TipoTarjeta || req.body.tipoTarjeta;
    const titular = req.body.Titular || req.body.titular;
    const expiracion = req.body.Expiracion || req.body.expiracion;

    if (!numeroTarjeta || !tipoTarjeta || !titular || !expiracion) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios."
      });
    }

    if (numeroTarjeta.length < 4) {
      return res.status(400).json({
        mensaje: "El número de tarjeta no es válido."
      });
    }

    const ultimo = await MetodoPago.findOne().sort({ MetodoPagoID: -1 });
    const nuevoId = ultimo ? ultimo.MetodoPagoID + 1 : 1;

    const metodo = await MetodoPago.create({
      MetodoPagoID: nuevoId,
      UsuarioID: usuarioId,
      TipoTarjeta: tipoTarjeta,
      Titular: titular,
      UltimosDigitos: numeroTarjeta.slice(-4),
      Expiracion: expiracion
    });

    res.status(201).json({
      mensaje: "Método de pago agregado correctamente.",
      data: metodo
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al agregar método de pago",
      error: error.message
    });
  }
});

router.delete("/eliminar/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    const metodo = await MetodoPago.findOneAndDelete({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { MetodoPagoID: Number(id) }
      ]
    });

    if (!metodo) {
      return res.status(404).json({
        mensaje: "Método de pago no encontrado."
      });
    }

    res.json({
      mensaje: "Método de pago eliminado correctamente.",
      data: metodo
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar método de pago",
      error: error.message
    });
  }
});

module.exports = router;