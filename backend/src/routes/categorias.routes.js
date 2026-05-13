const express = require("express");
const Categoria = require("../models/categoria.model");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.find();

    res.json({
      mensaje: "Listado de categorías obtenido correctamente",
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

router.get("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        mensaje: "Categoría no encontrada"
      });
    }

    res.json({
      mensaje: "Categoría encontrada correctamente",
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener la categoría",
      error: error.message
    });
  }
});

module.exports = router;