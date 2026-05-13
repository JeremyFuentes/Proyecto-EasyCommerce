const express = require("express");

const Categoria = require("../models/categoria.model");
const Marca = require("../models/marca.model");
const Proveedor = require("../models/proveedor.model");
const EstadoProducto = require("../models/estadoProducto.model");
const verificarToken = require("../middleware/auth.middleware");
const verificarAdmin = require("../middleware/admin.middleware");
const validarIpPermitida = require("../middleware/ip.middleware");

function normalizarTexto(texto) {
  return String(texto || "").trim();
}

function crearRegexNombreExacto(nombre) {
  return new RegExp(`^${nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

const router = express.Router();

router.get("/categorias/todas", async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ CategoriaID: 1 });

    res.json({
      mensaje: "Categorías obtenidas correctamente",
      total: categorias.length,
      data: categorias
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener categorías",
      error: error.message
    });
  }
});

router.get("/marcas/todas", async (req, res) => {
  try {
    const marcas = await Marca.find().sort({ MarcaID: 1 });

    res.json({
      mensaje: "Marcas obtenidas correctamente",
      total: marcas.length,
      data: marcas
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener marcas",
      error: error.message
    });
  }
});

router.get("/proveedores/todos", async (req, res) => {
  try {
    const proveedores = await Proveedor.find().sort({ ProveedorID: 1 });

    res.json({
      mensaje: "Proveedores obtenidos correctamente",
      total: proveedores.length,
      data: proveedores
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener proveedores",
      error: error.message
    });
  }
});

router.get("/estados-producto/todos", async (req, res) => {
  try {
    const estados = await EstadoProducto.find().sort({ EstadoProductoId: 1 });

    res.json({
      mensaje: "Estados de producto obtenidos correctamente",
      total: estados.length,
      data: estados
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener estados de producto",
      error: error.message
    });
  }
});

// =============================
// ADMIN - CATEGORÍAS
// =============================

router.post("/categorias", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nombre = normalizarTexto(req.body.Nombre || req.body.nombre);
    const descripcion = normalizarTexto(req.body.Descripcion || req.body.descripcion);

    if (!nombre) {
      return res.status(400).json({
        mensaje: "El nombre de la categoría es obligatorio."
      });
    }

    const existe = await Categoria.findOne({
      Nombre: crearRegexNombreExacto(nombre)
    });

    if (existe) {
      return res.status(409).json({
        mensaje: "Ya existe una categoría con ese nombre."
      });
    }

    const ultimo = await Categoria.findOne().sort({ CategoriaID: -1 });
    const nuevoId = ultimo ? ultimo.CategoriaID + 1 : 1;

    const categoria = await Categoria.create({
      CategoriaID: nuevoId,
      Nombre: nombre,
      Descripcion: descripcion
    });

    res.status(201).json({
      mensaje: "Categoría creada correctamente.",
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear categoría.",
      error: error.message
    });
  }
});

router.put("/categorias/:id", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const categoriaId = Number(req.params.id);
    const nombre = normalizarTexto(req.body.Nombre || req.body.nombre);
    const descripcion = normalizarTexto(req.body.Descripcion || req.body.descripcion);

    if (!nombre) {
      return res.status(400).json({
        mensaje: "El nombre de la categoría es obligatorio."
      });
    }

    const nombreUsado = await Categoria.findOne({
      Nombre: crearRegexNombreExacto(nombre),
      CategoriaID: { $ne: categoriaId }
    });

    if (nombreUsado) {
      return res.status(409).json({
        mensaje: "Ya existe otra categoría con ese nombre."
      });
    }

    const categoria = await Categoria.findOneAndUpdate(
      { CategoriaID: categoriaId },
      {
        Nombre: nombre,
        Descripcion: descripcion
      },
      { new: true }
    );

    if (!categoria) {
      return res.status(404).json({
        mensaje: "Categoría no encontrada."
      });
    }

    res.json({
      mensaje: "Categoría actualizada correctamente.",
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar categoría.",
      error: error.message
    });
  }
});

router.delete("/categorias/:id", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const categoria = await Categoria.findOneAndDelete({
      CategoriaID: Number(req.params.id)
    });

    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada." });
    }

    res.json({
      mensaje: "Categoría eliminada correctamente.",
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar categoría.",
      error: error.message
    });
  }
});

// =============================
// ADMIN - MARCAS
// =============================

router.post("/marcas", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nombre = normalizarTexto(req.body.Nombre || req.body.nombre);

    if (!nombre) {
      return res.status(400).json({
        mensaje: "El nombre de la marca es obligatorio."
      });
    }

    const existe = await Marca.findOne({
      Nombre: crearRegexNombreExacto(nombre)
    });

    if (existe) {
      return res.status(409).json({
        mensaje: "Ya existe una marca con ese nombre."
      });
    }

    const ultimo = await Marca.findOne().sort({ MarcaID: -1 });
    const nuevoId = ultimo ? ultimo.MarcaID + 1 : 1;

    const marca = await Marca.create({
      MarcaID: nuevoId,
      Nombre: nombre
    });

    res.status(201).json({
      mensaje: "Marca creada correctamente.",
      data: marca
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear marca.",
      error: error.message
    });
  }
});

router.put("/marcas/:id", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const marcaId = Number(req.params.id);
    const nombre = normalizarTexto(req.body.Nombre || req.body.nombre);

    if (!nombre) {
      return res.status(400).json({
        mensaje: "El nombre de la marca es obligatorio."
      });
    }

    const nombreUsado = await Marca.findOne({
      Nombre: crearRegexNombreExacto(nombre),
      MarcaID: { $ne: marcaId }
    });

    if (nombreUsado) {
      return res.status(409).json({
        mensaje: "Ya existe otra marca con ese nombre."
      });
    }

    const marca = await Marca.findOneAndUpdate(
      { MarcaID: marcaId },
      { Nombre: nombre },
      { new: true }
    );

    if (!marca) {
      return res.status(404).json({
        mensaje: "Marca no encontrada."
      });
    }

    res.json({
      mensaje: "Marca actualizada correctamente.",
      data: marca
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar marca.",
      error: error.message
    });
  }
});

router.delete("/marcas/:id", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const marca = await Marca.findOneAndDelete({
      MarcaID: Number(req.params.id)
    });

    if (!marca) {
      return res.status(404).json({ mensaje: "Marca no encontrada." });
    }

    res.json({
      mensaje: "Marca eliminada correctamente.",
      data: marca
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar marca.",
      error: error.message
    });
  }
});

// =============================
// ADMIN - PROVEEDORES
// =============================

router.post("/proveedores", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nombre = normalizarTexto(req.body.Nombre || req.body.nombre);
    const contacto = normalizarTexto(req.body.Contacto || req.body.contacto);
    const correo = normalizarTexto(req.body.Correo || req.body.correo);

    if (!nombre) {
      return res.status(400).json({
        mensaje: "El nombre del proveedor es obligatorio."
      });
    }

    const existe = await Proveedor.findOne({
      Nombre: crearRegexNombreExacto(nombre)
    });

    if (existe) {
      return res.status(409).json({
        mensaje: "Ya existe un proveedor con ese nombre."
      });
    }

    const ultimo = await Proveedor.findOne().sort({ ProveedorID: -1 });
    const nuevoId = ultimo ? ultimo.ProveedorID + 1 : 1;

    const proveedor = await Proveedor.create({
      ProveedorID: nuevoId,
      Nombre: nombre,
      Contacto: contacto,
      Correo: correo
    });

    res.status(201).json({
      mensaje: "Proveedor creado correctamente.",
      data: proveedor
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear proveedor.",
      error: error.message
    });
  }
});

router.put("/proveedores/:id", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const proveedorId = Number(req.params.id);

    const nombre = normalizarTexto(req.body.Nombre || req.body.nombre);
    const contacto = normalizarTexto(req.body.Contacto || req.body.contacto);
    const correo = normalizarTexto(req.body.Correo || req.body.correo);

    if (!nombre) {
      return res.status(400).json({
        mensaje: "El nombre del proveedor es obligatorio."
      });
    }

    const nombreUsado = await Proveedor.findOne({
      Nombre: crearRegexNombreExacto(nombre),
      ProveedorID: { $ne: proveedorId }
    });

    if (nombreUsado) {
      return res.status(409).json({
        mensaje: "Ya existe otro proveedor con ese nombre."
      });
    }

    const proveedor = await Proveedor.findOneAndUpdate(
      { ProveedorID: proveedorId },
      {
        Nombre: nombre,
        Contacto: contacto,
        Correo: correo
      },
      { new: true }
    );

    if (!proveedor) {
      return res.status(404).json({
        mensaje: "Proveedor no encontrado."
      });
    }

    res.json({
      mensaje: "Proveedor actualizado correctamente.",
      data: proveedor
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar proveedor.",
      error: error.message
    });
  }
});

router.delete("/proveedores/:id", validarIpPermitida, verificarToken, verificarAdmin, async (req, res) => {
  try {
    const proveedor = await Proveedor.findOneAndDelete({
      ProveedorID: Number(req.params.id)
    });

    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado." });
    }

    res.json({
      mensaje: "Proveedor eliminado correctamente.",
      data: proveedor
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar proveedor.",
      error: error.message
    });
  }
});

module.exports = router;