const mongoose = require("mongoose");

const carritoSchema = new mongoose.Schema(
  {
    CarritoID: {
      type: Number,
      required: true,
      unique: true
    },
    UsuarioID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    ProductoID: {
      type: Number,
      required: true
    },
    OrdenID: {
      type: Number,
      default: null
    },
    Cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    PrecioUnitario: {
      type: Number,
      required: true,
      min: 0
    },
    FechaCompra: {
      type: Date,
      default: null
    },
    EstadoProductoId: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Carrito", carritoSchema);