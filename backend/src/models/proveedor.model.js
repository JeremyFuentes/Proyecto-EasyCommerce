const mongoose = require("mongoose");

const proveedorSchema = new mongoose.Schema(
  {
    ProveedorID: {
      type: Number,
      required: true,
      unique: true
    },
    Nombre: {
      type: String,
      required: true,
      trim: true
    },
    Contacto: {
      type: String,
      default: ""
    },
    Correo: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Proveedor", proveedorSchema);