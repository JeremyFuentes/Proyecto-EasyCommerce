const express = require("express");

const Producto = require("../models/producto.model");
const Categoria = require("../models/categoria.model");
const Marca = require("../models/marca.model");
const Proveedor = require("../models/proveedor.model");
const ImagenProducto = require("../models/imagenProducto.model");

const verificarToken = require("../middleware/auth.middleware");
const verificarAdmin = require("../middleware/admin.middleware");
const validarIpPermitida = require("../middleware/ip.middleware");

const router = express.Router();

async function mapearProducto(producto) {
  const categoria = await Categoria.findOne({ CategoriaID: producto.CategoriaID });
  const marca = await Marca.findOne({ MarcaID: producto.MarcaID });
  const proveedor = await Proveedor.findOne({ ProveedorID: producto.ProveedorID });

  const imagenPrincipal = await ImagenProducto.findOne({
    ProductoID: producto.ProductoID,
    EsPrincipal: true
  });

  return {
    _id: producto._id,
    ProductoID: producto.ProductoID,
    Nombre: producto.Nombre,
    Precio: producto.Precio,
    Stock: producto.Stock,
    CategoriaID: producto.CategoriaID,
    Categoria: categoria ? categoria.Nombre : "",
    MarcaID: producto.MarcaID,
    Marca: marca ? marca.Nombre : "",
    ProveedorID: producto.ProveedorID,
    Proveedor: proveedor ? proveedor.Nombre : "",
    SKU: producto.SKU,
    Descripcion: producto.Descripcion,
    Estado: producto.Estado,
    Imagen: imagenPrincipal ? imagenPrincipal.UrlImagen : producto.Imagen
  };
}

router.get("/ObtenerTodos", async (req, res) => {
  try {
    const productos = await Producto.find().sort({ ProductoID: 1 });

    const productosMapeados = await Promise.all(
      productos.map((producto) => mapearProducto(producto))
    );

    res.json({
      mensaje: "Productos obtenidos correctamente",
      total: productosMapeados.length,
      data: productosMapeados
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener productos",
      error: error.message
    });
  }
});

router.get("/ObtenerporId/:id", async (req, res) => {
  try {
    const producto = await Producto.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { ProductoID: Number(req.params.id) }
      ]
    });

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    const productoMapeado = await mapearProducto(producto);

    res.json({
      mensaje: "Producto obtenido correctamente",
      data: productoMapeado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener producto",
      error: error.message
    });
  }
});

router.post(
  "/InsertarProducto",
  validarIpPermitida,
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const ultimoProducto = await Producto.findOne().sort({ ProductoID: -1 });
      const nuevoProductoID = ultimoProducto ? ultimoProducto.ProductoID + 1 : 1;

      const producto = await Producto.create({
        ProductoID: nuevoProductoID,
        Nombre: req.body.Nombre || req.body.nombre,
        Precio: Number(req.body.Precio || req.body.precio),
        Stock: Number(req.body.Stock || req.body.stock),
        CategoriaID: Number(req.body.CategoriaID || req.body.categoriaId),
        SKU: req.body.SKU || req.body.sku || `PRD-${Date.now()}`,
        Descripcion: req.body.Descripcion || req.body.descripcion || "",
        MarcaID: Number(req.body.MarcaID || req.body.marcaId),
        ProveedorID: Number(req.body.ProveedorID || req.body.proveedorId),
        Estado:
          req.body.Estado !== undefined
            ? req.body.Estado
            : req.body.estado !== undefined
              ? req.body.estado
              : true,
        Imagen: req.body.Imagen || req.body.imagen || ""
      });

      res.status(201).json({
        mensaje: "Producto registrado correctamente",
        data: producto
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al registrar producto",
        error: error.message
      });
    }
  }
);

router.post(
  "/RegistrarConImagenes",
  validarIpPermitida,
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const ultimoProducto = await Producto.findOne().sort({ ProductoID: -1 });
      const nuevoProductoID = ultimoProducto ? ultimoProducto.ProductoID + 1 : 1;

      const producto = await Producto.create({
        ProductoID: nuevoProductoID,
        Nombre: req.body.Nombre || req.body.nombre,
        Precio: Number(req.body.Precio || req.body.precio),
        Stock: Number(req.body.Stock || req.body.stock),
        CategoriaID: Number(req.body.CategoriaID || req.body.categoriaId),
        SKU: req.body.SKU || req.body.sku || `PRD-${Date.now()}`,
        Descripcion: req.body.Descripcion || req.body.descripcion || "",
        MarcaID: Number(req.body.MarcaID || req.body.marcaId),
        ProveedorID: Number(req.body.ProveedorID || req.body.proveedorId),
        Estado:
          req.body.Estado !== undefined
            ? req.body.Estado
            : req.body.estado !== undefined
              ? req.body.estado
              : true,
        Imagen: req.body.Imagen || req.body.imagen || ""
      });

      res.status(201).json({
        mensaje: "Producto registrado correctamente",
        data: producto
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al registrar producto",
        error: error.message
      });
    }
  }
);

router.put(
  "/ActualizarProducto",
  validarIpPermitida,
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const id =
        req.body.ProductoID ||
        req.body.productoId ||
        req.body._id ||
        req.body.id;

      const filtro = String(id).match(/^[0-9a-fA-F]{24}$/)
        ? { _id: id }
        : { ProductoID: Number(id) };

      const producto = await Producto.findOneAndUpdate(
        filtro,
        {
          Nombre: req.body.Nombre || req.body.nombre,
          Precio: Number(req.body.Precio || req.body.precio),
          Stock: Number(req.body.Stock || req.body.stock),
          CategoriaID: Number(req.body.CategoriaID || req.body.categoriaId),
          SKU: req.body.SKU || req.body.sku,
          Descripcion: req.body.Descripcion || req.body.descripcion || "",
          MarcaID: Number(req.body.MarcaID || req.body.marcaId),
          ProveedorID: Number(req.body.ProveedorID || req.body.proveedorId),
          Estado:
            req.body.Estado !== undefined
              ? req.body.Estado
              : req.body.estado !== undefined
                ? req.body.estado
                : true,
          Imagen: req.body.Imagen || req.body.imagen || ""
        },
        { new: true }
      );

      if (!producto) {
        return res.status(404).json({
          mensaje: "Producto no encontrado"
        });
      }

      res.json({
        mensaje: "Producto actualizado correctamente",
        data: producto
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al actualizar producto",
        error: error.message
      });
    }
  }
);

router.delete(
  "/EliminarporId/:id",
  validarIpPermitida,
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const id = req.params.id;

      const filtro = String(id).match(/^[0-9a-fA-F]{24}$/)
        ? { _id: id }
        : { ProductoID: Number(id) };

      const producto = await Producto.findOneAndUpdate(
        filtro,
        { Estado: false },
        { new: true }
      );

      if (!producto) {
        return res.status(404).json({
          mensaje: "Producto no encontrado"
        });
      }

      res.json({
        mensaje: "Producto desactivado correctamente",
        data: producto
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al eliminar producto",
        error: error.message
      });
    }
  }
);

module.exports = router;