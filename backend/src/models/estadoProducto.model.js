const mongoose = require("mongoose");

const estadoProductoSchema = new mongoose.Schema(
  {
    EstadoProductoId: {
      type: Number,
      required: true,
      unique: true
    },
    NombreEstado: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EstadoProducto", estadoProductoSchema);