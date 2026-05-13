const mongoose = require("mongoose");

const marcaSchema = new mongoose.Schema(
  {
    MarcaID: {
      type: Number,
      required: true,
      unique: true
    },
    Nombre: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Marca", marcaSchema);