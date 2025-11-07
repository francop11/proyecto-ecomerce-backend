const mongoose = require("mongoose") // importamos mongoose 

// definimos el esquema del carrito
const cartSchema = new mongoose.Schema({
  // el carrito tendrá un array de productos
  products: [
    {
      // cada producto es una referencia al modelo Product
      product: {
        type: mongoose.Schema.Types.ObjectId, // almacenamos el id del producto
        ref: "Product", // referenciamos el modelo de productos
        required: true
      },
      quantity: {
        type: Number,
        default: 1 // por defecto 1 unidad
      }
    }
  ]
},
{
  timestamps: true // agrega createdAt y updatedAt automáticamente
})

// Creamos el modelo Cart 
const CartModel = mongoose.model("Cart", cartSchema)

module.exports = CartModel
