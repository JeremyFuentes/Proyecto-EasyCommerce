const Categoria = require("../models/categoria.model");
const Marca = require("../models/marca.model");
const Proveedor = require("../models/proveedor.model");
const EstadoProducto = require("../models/estadoProducto.model");

const seedInicial = async () => {
  const categorias = [
    { CategoriaID: 1, Nombre: "Laptops", Descripcion: "Laptops de diferentes marcas y estilos" },
    { CategoriaID: 2, Nombre: "Tarjetas Graficas", Descripcion: "Tarjetas graficas de Nvidia, AMD e Intel" },
    { CategoriaID: 3, Nombre: "Motherboards", Descripcion: "Tarjetas madre de computadoras de escritorio" },
    { CategoriaID: 4, Nombre: "Memoria RAM", Descripcion: "Memorias DDR4 y DDR5 para pc y laptop" },
    { CategoriaID: 5, Nombre: "Procesadores", Descripcion: "Procesadores Intel y AMD" },
    { CategoriaID: 6, Nombre: "Almacenamiento", Descripcion: "Discos duros y solidos" },
    { CategoriaID: 7, Nombre: "Periféricos", Descripcion: "Mouse, teclados, microfonos y mas" },
    { CategoriaID: 8, Nombre: "Enfriamiento", Descripcion: "Enfriamiento por aire y liquidas todo en uno" },
    { CategoriaID: 9, Nombre: "Gabinetes", Descripcion: "Gabinetes de diferentes tamaños y estilos" },
    { CategoriaID: 10, Nombre: "Fuentes de poder", Descripcion: "Fuentes de poder de distintos watts" },
    { CategoriaID: 11, Nombre: "Redes", Descripcion: "Router, switch y cables y otros" },
    { CategoriaID: 12, Nombre: "Accesorios", Descripcion: "Accesorios adicionales para tu setup" }
  ];

  const marcas = [
    { MarcaID: 1, Nombre: "ASUS" },
    { MarcaID: 2, Nombre: "Dell" },
    { MarcaID: 3, Nombre: "Apple" },
    { MarcaID: 4, Nombre: "Lenovo" },
    { MarcaID: 5, Nombre: "Gigabyte" },
    { MarcaID: 6, Nombre: "Corsair" },
    { MarcaID: 7, Nombre: "Kingston" },
    { MarcaID: 8, Nombre: "Intel" },
    { MarcaID: 9, Nombre: "AMD" }
  ];

  const proveedores = [
    { ProveedorID: 1, Nombre: "TechZone S.A.", Contacto: "78412516", Correo: "TechZone@gmail.com" },
    { ProveedorID: 2, Nombre: "CompuRed Distribuciones", Contacto: "75894216", Correo: "CompuRedDistribuciones@gmail.com" },
    { ProveedorID: 3, Nombre: "Grupo ElectroHard", Contacto: "582614921", Correo: "GrupoElectroHard@gmail.com" },
    { ProveedorID: 4, Nombre: "IT Global Supplies", Contacto: "310220602", Correo: "ITGlobalSupplies@gmail.com" },
    { ProveedorID: 5, Nombre: "MegaTech Importaciones", Contacto: "172827542", Correo: "MegaTechImportaciones@gmail.com" },
    { ProveedorID: 6, Nombre: "Distribuidora BytePlus", Contacto: "272572572", Correo: "DistribuidoraBytePlus@gmail.com" },
    { ProveedorID: 7, Nombre: "PC Supply El Salvador", Contacto: "58963124", Correo: "pcsupply@elsalvador.com" }
  ];

  const estadosProducto = [
    { EstadoProductoId: 1, NombreEstado: "Pendiente de Pago" },
    { EstadoProductoId: 2, NombreEstado: "En transacción" },
    { EstadoProductoId: 3, NombreEstado: "Enviado" },
    { EstadoProductoId: 4, NombreEstado: "En Reparto" },
    { EstadoProductoId: 5, NombreEstado: "Entregado" }
  ];

  for (const categoria of categorias) {
    await Categoria.updateOne(
      { CategoriaID: categoria.CategoriaID },
      { $set: categoria },
      { upsert: true }
    );
  }

  for (const marca of marcas) {
    await Marca.updateOne(
      { MarcaID: marca.MarcaID },
      { $set: marca },
      { upsert: true }
    );
  }

  for (const proveedor of proveedores) {
    await Proveedor.updateOne(
      { ProveedorID: proveedor.ProveedorID },
      { $set: proveedor },
      { upsert: true }
    );
  }

  for (const estado of estadosProducto) {
    await EstadoProducto.updateOne(
      { EstadoProductoId: estado.EstadoProductoId },
      { $set: estado },
      { upsert: true }
    );
  }

  console.log("Datos iniciales cargados correctamente");
};

module.exports = seedInicial;