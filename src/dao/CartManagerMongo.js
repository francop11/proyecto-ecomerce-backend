const mongoose = require("mongoose")
// importamos los modelos
const CartModel = require("../models/cart.model")
const ProductModel = require("../models/product.model")

class CartManagerMongo {

  // creamos un carrito 
  async addCart() {
    const nuevoCarrito = await CartModel.create({ products: [] })
    return nuevoCarrito
  }

  // obtenemos un carrito por id 
  async getCartWithPopulate(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")

    // buscamos el carrito y populamos los productos
    const carrito = await CartModel.findById(cid).populate("products.product")
    if (!carrito) throw new Error("carrito no encontrado")

    // calculamos el total sumando precio por cantidad de cada producto
    const total = carrito.products.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)

    // convertimos a objeto normal y agregamos el total
    const carritoObj = carrito.toObject()
    carritoObj.total = total
    return carritoObj
  }

  // agregamos un producto al carrito y si ya esta se le suma uno
  async addProductToCart(cid, pid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error("id de producto inválido")

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    const producto = await ProductModel.findById(pid)
    if (!producto) throw new Error("Producto no encontrado")
    if (typeof producto.stock === "number" && producto.stock <= 0) throw new Error("producto sin stock disponible")

    // verificamos si el producto ya exite
    const item = carrito.products.find(p => p.product.toString() === pid)

    if (item) {
      // si ya esta sumamos la cantidad
      item.quantity += 1
    } else {
      // si no esta no lo agregamos como nuevo
      carrito.products.push({ product: pid, quantity: 1 })
    }

    await carrito.save()

    // traemos el carrito con el totla actualizado
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    const total = carritoPopulado.products.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)

    const carritoObj = carritoPopulado.toObject()
    carritoObj.total = total
    return carritoObj
  }

  // eliminamos un producto 
  async deleteProductFromCart(cid, pid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error("id de producto inválido")

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    // filtramos el producto 
    carrito.products = carrito.products.filter(p => p.product.toString() !== pid)
    await carrito.save()

    // recalculamos el total
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    const total = carritoPopulado.products.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)

    const carritoObj = carritoPopulado.toObject()
    carritoObj.total = total
    return carritoObj
  }

  // actualizamos la cantidad de un producto que ya no esta en el carrito
  async updateProductQuantity(cid, pid, quantity) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error("id de producto inválido")

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    // buscamos el producto dentro del carrito
    const item = carrito.products.find(p => p.product.toString() === pid)
    if (!item) throw new Error("producto no está en el carrito")

    quantity = Number(quantity)
    if (isNaN(quantity) || quantity < 0) throw new Error("cantidad inválida")

    // si la cantidad es 0 se elimina,sino se actualiza
    if (quantity === 0) {
      carrito.products = carrito.products.filter(p => p.product.toString() !== pid)
    } else {
      item.quantity = quantity
    }

    await carrito.save()

    // recalculamos el total actualizado
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    const total = carritoPopulado.products.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)

    const carritoObj = carritoPopulado.toObject()
    carritoObj.total = total
    return carritoObj
  }

  // reemplazamos todos los productos del carrito por un nuevo arreglo
  async updateCartProducts(cid, nuevosProductos) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    if (!Array.isArray(nuevosProductos)) throw new Error("productos inválidos, se espera un arreglo")

    // validamos que cada producto tenga id y cantidad 
    const productosValidos = nuevosProductos.map(p => {
      if (!p.product || !mongoose.Types.ObjectId.isValid(p.product)) throw new Error("id de producto inválido en el arreglo")
      const qty = Number(p.quantity) || 1
      if (qty < 0) throw new Error("cantidad inválida en el arreglo")
      return { product: p.product, quantity: qty }
    })

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    carrito.products = productosValidos
    await carrito.save()

    // recalculamos el total
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    const total = carritoPopulado.products.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)

    const carritoObj = carritoPopulado.toObject()
    carritoObj.total = total
    return carritoObj
  }

  // vaciamos todo el carrito
  async clearCart(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    carrito.products = []
    await carrito.save()

    // devolvemos el carrito vacio
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    const carritoObj = carritoPopulado.toObject()
    carritoObj.total = 0
    return carritoObj
  }
}

module.exports = CartManagerMongo
