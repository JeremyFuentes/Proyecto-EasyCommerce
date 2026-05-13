const mongoose = require("mongoose");

const imagenProductoSchema = new mongoose.Schema(
  {
    IdImagen: {
      type: Number,
      required: true,
      unique: true
    },
    ProductoID: {
      type: Number,
      required: true
    },
    UrlImagen: {
      type: String,
      required: true
    },
    EsPrincipal: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ImagenProducto", imagenProductoSchema);