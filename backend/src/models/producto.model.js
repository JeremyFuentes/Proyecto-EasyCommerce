const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    ProductoID: {
      type: Number,
      required: true,
      unique: true
    },
    Nombre: {
      type: String,
      required: true,
      trim: true
    },
    Precio: {
      type: Number,
      required: true,
      min: 0
    },
    Stock: {
      type: Number,
      required: true,
      min: 0
    },
    CategoriaID: {
      type: Number,
      required: true
    },
    SKU: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    Descripcion: {
      type: String,
      default: ""
    },
    MarcaID: {
      type: Number,
      required: true
    },
    ProveedorID: {
      type: Number,
      required: true
    },
    Estado: {
      type: Boolean,
      default: true
    },
    Imagen: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Producto", productoSchema);