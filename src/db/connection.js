const mongoose = require("mongoose") // importamos mongoose  
const dotenv = require("dotenv") // importamos dotenv para variables de entorno  
dotenv.config() // cargamos las variables de entorno  

const Product = require("../models/product.model") // importamos el medelo de productos 

// productos de ejemplo 
const productosEjemplo = [
  { title: "Smartphone Samsung Galaxy S24", description: "Pantalla AMOLED, 256GB, triple cámara", price: 850000, category: "celulares", stock: 15 },
  { title: "iPhone 15 Pro", description: "Chip A17 Pro, 128GB, Titanium Edition", price: 1200000, category: "celulares", stock: 10 },
  { title: "Notebook Lenovo IdeaPad 5", description: "Ryzen 5, 16GB RAM, SSD 512GB", price: 720000, category: "notebooks", stock: 8 },
  { title: "Notebook HP Victus 16", description: "Intel i7, RTX 4060, 16GB RAM", price: 950000, category: "notebooks", stock: 5 },
  { title: "Smart TV LG OLED 55\"", description: "4K UHD, HDR10, webOS", price: 680000, category: "televisores", stock: 12 },
  { title: "Tablet iPad Air 5", description: "Chip M1, 10.9 pulgadas, 64GB", price: 630000, category: "tablets", stock: 9 },
  { title: "Auriculares Sony WH-1000XM5", description: "Cancelación activa de ruido, Bluetooth 5.3", price: 380000, category: "audio", stock: 20 },
  { title: "Monitor Samsung Odyssey G5", description: "27\" QHD, 144Hz, Curvo", price: 410000, category: "monitores", stock: 7 },
  { title: "Consola PlayStation 5", description: "Versión estándar con lector de discos", price: 980000, category: "consolas", stock: 6 },
  { title: "Smartwatch Xiaomi Watch 2 Pro", description: "Pantalla AMOLED, GPS, Wear OS", price: 210000, category: "wearables", stock: 25 }
]

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }) // nos conectamos a Mongo
    console.log(" Conectado a MongoDB")

    // verificamos la cantidad de documentos en la coleccion
    const count = await Product.countDocuments()
    if (count === 0) {
      // si está vacia insertamos los productos de ejemplo
      await Product.insertMany(productosEjemplo)
      console.log("productos de ejemplo insertados automáticamente")
    }
  } catch (error) {
    console.error("error al conectar a MongoDB:", error)
    throw error
  }
}

module.exports = { connectMongo }
