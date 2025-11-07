const CartModel = require("../models/cart.model") // importamos el modelo del carrito
const ProductModel = require("../models/product.model") // importamos el modelo de productos

class CartManagerMongo {
  // método para crear un carrito vacio
  async addCart() {
    const nuevoCarrito = await CartModel.create({ products: [] })
    return nuevoCarrito
  }

  // obtenemos carrito por id
  async getCartById(cid) {
    const carrito = await CartModel.findById(cid)
    return carrito
  }

  // agregamos productos al carrito
  async addProductToCart(cid, pid) {
    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("Carrito no encontrado")

    const producto = await ProductModel.findById(pid)
    if (!producto) throw new Error("Producto no encontrado")

    // buscamos si el producto ya existe en el carrito
    const item = carrito.products.find(p => p.product.toString() === pid)

    if (item) {
      // si ya está, sumamos 1 a la cantidad
      item.quantity += 1
    } else {
      // si no está, lo agregamos con cantidad 1
      carrito.products.push({ product: pid, quantity: 1 })
    }

    await carrito.save() // guardamos los cambios

    // devolvemos el carrito ya poblado de productos completos
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // eliminar un producto del carrito
  async deleteProductFromCart(cid, pid) {
    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("Carrito no encontrado")

    carrito.products = carrito.products.filter(p => p.product.toString() !== pid)
    await carrito.save()
    // devolver carrito poblado actualizado
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // actualizar la cantidad de un producto
  async updateProductQuantity(cid, pid, quantity) {
    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    const item = carrito.products.find(p => p.product.toString() === pid)
    if (!item) throw new Error("producto no está en el carrito")

    item.quantity = quantity
    await carrito.save()
    // devolver carrito poblado actualizado
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // reemplazar todos los productos del carrito
  async updateCartProducts(cid, nuevosProductos) {
    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    carrito.products = nuevosProductos
    await carrito.save()
    // devolver carrito poblado actualizado
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // vaciamos completamente el carrito
  async clearCart(cid) {
    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    carrito.products = []
    await carrito.save()
    // devolver carrito poblado (aunque vacío) para coherencia
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // obtenemos carritos con productos completos
  async getCartWithPopulate(cid) {
    const carrito = await CartModel.findById(cid).populate("products.product")
    if (!carrito) throw new Error("carrito no encontrado")
    return carrito
  }
}

module.exports = CartManagerMongo
