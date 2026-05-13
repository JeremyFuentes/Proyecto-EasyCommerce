const express = require("express");
const ImagenProducto = require("../models/imagenProducto.model");
const verificarToken = require("../middleware/auth.middleware");
const verificarAdmin = require("../middleware/admin.middleware");
const validarIpPermitida = require("../middleware/ip.middleware");

const router = express.Router();

router.get("/producto/:productoId", async (req, res) => {
  try {
    const productoId = Number(req.params.productoId);

    const imagenes = await ImagenProducto.find({
      ProductoID: productoId
    }).sort({
      EsPrincipal: -1,
      IdImagen: 1
    });

    res.json({
      mensaje: "Imágenes del producto obtenidas correctamente",
      total: imagenes.length,
      data: imagenes
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener imágenes del producto",
      error: error.message
    });
  }
});

router.get("/principal/:productoId", async (req, res) => {
  try {
    const productoId = Number(req.params.productoId);

    const imagen = await ImagenProducto.findOne({
      ProductoID: productoId,
      EsPrincipal: true
    });

    res.json({
      mensaje: "Imagen principal obtenida correctamente",
      data: imagen
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener imagen principal",
      error: error.message
    });
  }
});

router.post(
  "/agregar",
  validarIpPermitida,
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const ultimo = await ImagenProducto.findOne().sort({ IdImagen: -1 });
      const nuevoId = ultimo ? ultimo.IdImagen + 1 : 1;

      const productoId = Number(req.body.ProductoID || req.body.productoId);
      const urlImagen = req.body.UrlImagen || req.body.urlImagen;
      const esPrincipal = req.body.EsPrincipal ?? req.body.esPrincipal ?? false;

      if (!productoId || !urlImagen) {
        return res.status(400).json({
          mensaje: "ProductoID y UrlImagen son obligatorios."
        });
      }

      if (esPrincipal) {
        await ImagenProducto.updateMany(
          { ProductoID: productoId },
          { EsPrincipal: false }
        );
      }

      const imagen = await ImagenProducto.create({
        IdImagen: nuevoId,
        ProductoID: productoId,
        UrlImagen: urlImagen,
        EsPrincipal: Boolean(esPrincipal)
      });

      res.status(201).json({
        mensaje: "Imagen agregada correctamente",
        data: imagen
      });

    } catch (error) {
      res.status(500).json({
        mensaje: "Error al agregar imagen",
        error: error.message
      });
    }
  }
);

router.put(
  "/principal/:idImagen",
  validarIpPermitida,
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const idImagen = req.params.idImagen;

      const filtro = String(idImagen).match(/^[0-9a-fA-F]{24}$/)
        ? { _id: idImagen }
        : { IdImagen: Number(idImagen) };

      const imagen = await ImagenProducto.findOne(filtro);

      if (!imagen) {
        return res.status(404).json({
          mensaje: "Imagen no encontrada."
        });
      }

      await ImagenProducto.updateMany(
        { ProductoID: imagen.ProductoID },
        { EsPrincipal: false }
      );

      imagen.EsPrincipal = true;
      await imagen.save();

      res.json({
        mensaje: "Imagen principal actualizada correctamente.",
        data: imagen
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al actualizar imagen principal.",
        error: error.message
      });
    }
  }
);

router.delete(
  "/eliminar/:idImagen",
  validarIpPermitida,
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const idImagen = req.params.idImagen;

      const filtro = String(idImagen).match(/^[0-9a-fA-F]{24}$/)
        ? { _id: idImagen }
        : { IdImagen: Number(idImagen) };

      const imagen = await ImagenProducto.findOneAndDelete(filtro);

      if (!imagen) {
        return res.status(404).json({
          mensaje: "Imagen no encontrada."
        });
      }

      res.json({
        mensaje: "Imagen eliminada correctamente.",
        data: imagen
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al eliminar imagen.",
        error: error.message
      });
    }
  }
);

module.exports = router;