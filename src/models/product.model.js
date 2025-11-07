const mongoose = require("mongoose") // importamos mongoose  
const mongoosePaginate = require("mongoose-paginate-v2") // importamos el plugin de paginación  

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  code: { type: String, required: true, default: () => `PROD-${Date.now()}` }
}, {
  timestamps: true // para tener createdAt y updatedAt
})

// aplicamos el plugin de paginación al esquema
productSchema.plugin(mongoosePaginate)

const Product = mongoose.model("Product", productSchema) // definimos el modelo  
module.exports = Product // exportamos el modelo  
