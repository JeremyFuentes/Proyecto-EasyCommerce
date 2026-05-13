const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema(
  {
    CategoriaID: {
      type: Number,
      required: true,
      unique: true
    },
    Nombre: {
      type: String,
      required: true,
      trim: true
    },
    Descripcion: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Categoria", categoriaSchema);