const mongoose = require("mongoose");

const ordenSchema = new mongoose.Schema(
  {
    OrdenID: {
      type: Number,
      required: true,
      unique: true
    },
    UsuarioID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    FechaOrden: {
      type: Date,
      default: Date.now
    },
    Subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    Envio: {
      type: Number,
      required: true,
      default: 0
    },
    Descuento: {
      type: Number,
      required: true,
      default: 0
    },
    Total: {
      type: Number,
      required: true,
      default: 0
    },
    EstadoGeneral: {
      type: String,
      default: "En transacción"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Orden", ordenSchema);