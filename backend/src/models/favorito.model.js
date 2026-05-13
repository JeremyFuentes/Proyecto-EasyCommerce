const mongoose = require("mongoose");

const favoritoSchema = new mongoose.Schema(
  {
    FavoritoID: {
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
    }
  },
  {
    timestamps: true
  }
);

favoritoSchema.index(
  {
    UsuarioID: 1,
    ProductoID: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("Favorito", favoritoSchema);