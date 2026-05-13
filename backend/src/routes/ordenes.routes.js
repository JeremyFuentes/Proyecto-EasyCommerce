const express = require("express");
const Orden = require("../models/orden.model");
const Carrito = require("../models/carrito.model");
const Producto = require("../models/producto.model");
const EstadoProducto = require("../models/estadoProducto.model");
const verificarToken = require("../middleware/auth.middleware");
const Usuario = require("../models/usuario.model");
const verificarAdmin = require("../middleware/admin.middleware");
const validarIpPermitida = require("../middleware/ip.middleware");

const router = express.Router();

async function mapearDetalle(item) {
  const producto = await Producto.findOne({
    ProductoID: item.ProductoID
  });

  const estado = await EstadoProducto.findOne({
    EstadoProductoId: item.EstadoProductoId
  });

  return {
    CarritoID: item.CarritoID,
    ProductoID: item.ProductoID,
    NombreProducto: producto ? producto.Nombre : "Producto sin nombre",
    Imagen: producto ? producto.Imagen : "",
    Cantidad: item.Cantidad,
    PrecioUnitario: item.PrecioUnitario,
    TotalLinea: item.Cantidad * item.PrecioUnitario,
    EstadoProductoId: item.EstadoProductoId,
    EstadoProducto: estado ? estado.NombreEstado : "Sin estado"
  };
}

router.get("/usuario/:usuarioId/activas", verificarToken, async (req, res) => {
  try {
    const ordenes = await Orden.find({
      UsuarioID: req.params.usuarioId
    }).sort({ OrdenID: -1 });

    const data = [];

    for (const orden of ordenes) {
      const items = await Carrito.find({
        OrdenID: orden.OrdenID,
        EstadoProductoId: { $in: [2, 3, 4] }
      });

      if (items.length > 0) {
        const detalles = await Promise.all(items.map(item => mapearDetalle(item)));

        data.push({
          OrdenID: orden.OrdenID,
          FechaOrden: orden.FechaOrden,
          Subtotal: orden.Subtotal,
          Envio: orden.Envio,
          Descuento: orden.Descuento,
          Total: orden.Total,
          EstadoGeneral: orden.EstadoGeneral,
          Detalles: detalles
        });
      }
    }

    res.json({
      mensaje: "Órdenes activas obtenidas correctamente",
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener órdenes activas",
      error: error.message
    });
  }
});

router.get("/usuario/:usuarioId/historial", verificarToken, async (req, res) => {
  try {
    const ordenes = await Orden.find({
      UsuarioID: req.params.usuarioId
    }).sort({ OrdenID: -1 });

    const data = [];

    for (const orden of ordenes) {
      const items = await Carrito.find({
        OrdenID: orden.OrdenID,
        EstadoProductoId: 5
      });

      if (items.length > 0) {
        const detalles = await Promise.all(items.map(item => mapearDetalle(item)));

        data.push({
          OrdenID: orden.OrdenID,
          FechaOrden: orden.FechaOrden,
          Subtotal: orden.Subtotal,
          Envio: orden.Envio,
          Descuento: orden.Descuento,
          Total: orden.Total,
          EstadoGeneral: "Entregado",
          Detalles: detalles
        });
      }
    }

    res.json({
      mensaje: "Historial de órdenes obtenido correctamente",
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener historial de órdenes",
      error: error.message
    });
  }
});

function obtenerNombreEstado(estadoId) {
  const estados = {
    1: "Pendiente de Pago",
    2: "En transacción",
    3: "Enviado",
    4: "En Reparto",
    5: "Entregado"
  };

  return estados[estadoId] || "Sin estado";
}

router.get("/admin/todas", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const ordenes = await Orden.find().sort({ OrdenID: -1 });

    const data = [];

    for (const orden of ordenes) {
      const usuario = await Usuario.findById(orden.UsuarioID).select("-password");

      const items = await Carrito.find({
        OrdenID: orden.OrdenID
      });

      if (items.length === 0) continue;

      const detalles = await Promise.all(items.map(item => mapearDetalle(item)));

      data.push({
        OrdenID: orden.OrdenID,
        UsuarioID: orden.UsuarioID,
        Usuario: usuario
          ? {
              _id: usuario._id,
              nombre: usuario.nombre,
              correo: usuario.correo,
              direccion: usuario.direccion,
              contacto: usuario.contacto
            }
          : null,
        FechaOrden: orden.FechaOrden,
        Subtotal: orden.Subtotal,
        Envio: orden.Envio,
        Descuento: orden.Descuento,
        Total: orden.Total,
        EstadoGeneral: orden.EstadoGeneral,
        Detalles: detalles
      });
    }

    res.json({
      mensaje: "Órdenes admin obtenidas correctamente",
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener órdenes admin",
      error: error.message
    });
  }
});

router.put("/admin/avanzar-estado/:ordenId", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const ordenId = Number(req.params.ordenId);

    const orden = await Orden.findOne({
      OrdenID: ordenId
    });

    if (!orden) {
      return res.status(404).json({
        mensaje: "Orden no encontrada."
      });
    }

    const items = await Carrito.find({
      OrdenID: ordenId
    });

    if (items.length === 0) {
      return res.status(404).json({
        mensaje: "No hay productos asociados a esta orden."
      });
    }

    const estadoActual = Math.min(...items.map(item => item.EstadoProductoId));

    if (estadoActual >= 5) {
      return res.status(400).json({
        mensaje: "Esta orden ya fue entregada."
      });
    }

    const nuevoEstado = estadoActual + 1;

    await Carrito.updateMany(
      {
        OrdenID: ordenId
      },
      {
        EstadoProductoId: nuevoEstado
      }
    );

    orden.EstadoGeneral = obtenerNombreEstado(nuevoEstado);
    await orden.save();

    res.json({
      mensaje: "Estado de la orden actualizado correctamente.",
      data: {
        OrdenID: ordenId,
        EstadoProductoId: nuevoEstado,
        EstadoGeneral: orden.EstadoGeneral
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al avanzar estado de la orden",
      error: error.message
    });
  }
});

module.exports = router;