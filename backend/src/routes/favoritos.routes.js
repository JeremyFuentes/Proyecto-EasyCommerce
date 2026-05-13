const express = require("express");
const Favorito = require("../models/favorito.model");
const Producto = require("../models/producto.model");
const ImagenProducto = require("../models/imagenProducto.model");
const verificarToken = require("../middleware/auth.middleware");

const router = express.Router();

async function mapearFavorito(favorito) {
  const producto = await Producto.findOne({
    ProductoID: favorito.ProductoID
  });

  const imagenPrincipal = await ImagenProducto.findOne({
    ProductoID: favorito.ProductoID,
    EsPrincipal: true
  });

  return {
    _id: favorito._id,
    FavoritoID: favorito.FavoritoID,
    UsuarioID: favorito.UsuarioID,
    ProductoID: favorito.ProductoID,
    Producto: producto
      ? {
          _id: producto._id,
          ProductoID: producto.ProductoID,
          Nombre: producto.Nombre,
          Precio: producto.Precio,
          Stock: producto.Stock,
          CategoriaID: producto.CategoriaID,
          MarcaID: producto.MarcaID,
          Descripcion: producto.Descripcion,
          Estado: producto.Estado,
          Imagen: imagenPrincipal ? imagenPrincipal.UrlImagen : producto.Imagen
        }
      : null
  };
}

router.get("/usuario/:usuarioId", verificarToken, async (req, res) => {
  try {
    const favoritos = await Favorito.find({
      UsuarioID: req.params.usuarioId
    }).sort({ FavoritoID: 1 });

    const data = await Promise.all(
      favoritos.map((favorito) => mapearFavorito(favorito))
    );

    res.json({
      mensaje: "Favoritos obtenidos correctamente",
      total: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener favoritos",
      error: error.message
    });
  }
});

router.post("/agregar", verificarToken, async (req, res) => {
  try {
    const usuarioId = req.body.UsuarioID || req.body.usuarioId || req.usuario.id;
    const productoId = Number(req.body.ProductoID || req.body.productoId);

    if (!productoId) {
      return res.status(400).json({
        mensaje: "ProductoID es obligatorio."
      });
    }

    const existe = await Favorito.findOne({
      UsuarioID: usuarioId,
      ProductoID: productoId
    });

    if (existe) {
      return res.status(409).json({
        mensaje: "El producto ya está en favoritos.",
        data: existe
      });
    }

    const ultimo = await Favorito.findOne().sort({ FavoritoID: -1 });
    const nuevoId = ultimo ? ultimo.FavoritoID + 1 : 1;

    const favorito = await Favorito.create({
      FavoritoID: nuevoId,
      UsuarioID: usuarioId,
      ProductoID: productoId
    });

    res.status(201).json({
      mensaje: "Producto agregado a favoritos.",
      data: favorito
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al agregar favorito",
      error: error.message
    });
  }
});

router.delete("/eliminar/:favoritoId", verificarToken, async (req, res) => {
  try {
    const id = req.params.favoritoId;

    const favorito = await Favorito.findOneAndDelete({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { FavoritoID: Number(id) }
      ]
    });

    if (!favorito) {
      return res.status(404).json({
        mensaje: "Favorito no encontrado."
      });
    }

    res.json({
      mensaje: "Favorito eliminado correctamente",
      data: favorito
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar favorito",
      error: error.message
    });
  }
});

router.delete("/producto/:productoId", verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const productoId = Number(req.params.productoId);

    const favorito = await Favorito.findOneAndDelete({
      UsuarioID: usuarioId,
      ProductoID: productoId
    });

    if (!favorito) {
      return res.status(404).json({
        mensaje: "Favorito no encontrado."
      });
    }

    res.json({
      mensaje: "Favorito eliminado correctamente",
      data: favorito
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar favorito",
      error: error.message
    });
  }
});

router.get("/existe/:productoId", verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const productoId = Number(req.params.productoId);

    const favorito = await Favorito.findOne({
      UsuarioID: usuarioId,
      ProductoID: productoId
    });

    res.json({
      existe: !!favorito,
      data: favorito
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al verificar favorito",
      error: error.message
    });
  }
});

module.exports = router;