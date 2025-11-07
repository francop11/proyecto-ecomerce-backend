const mongoose = require("mongoose")
// importamos los modelos
const CartModel = require("../models/cart.model")
const ProductModel = require("../models/product.model")

class CartManagerMongo {
  // método para crear un carrito vacio
  async addCart() {
    const nuevoCarrito = await CartModel.create({ products: [] })
    return nuevoCarrito
  }

  // obtenemos carrito por id (sin populate)
  async getCartById(cid) {
    // validamos que cid sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    const carrito = await CartModel.findById(cid)
    return carrito
  }

  // obtenemos carrito con products poblados
  async getCartWithPopulate(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    const carrito = await CartModel.findById(cid).populate("products.product")
    if (!carrito) throw new Error("carrito no encontrado")
    return carrito
  }

  // agregamos productos al carrito
  async addProductToCart(cid, pid) {
    // validaciones de ids
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error("id de producto inválido")

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("Carrito no encontrado")

    const producto = await ProductModel.findById(pid)
    if (!producto) throw new Error("Producto no encontrado")

    // opcional: validar stock antes de agregar
    if (typeof producto.stock === "number" && producto.stock <= 0) {
      throw new Error("Producto sin stock disponible")
    }

    // buscamos si el producto ya existe en el carrito
    const item = carrito.products.find(p => p.product.toString() === pid)

    if (item) {
      // si ya está, sumamos 1 a la cantidad
      item.quantity += 1
    } else {
      // si no está, lo agregamos con cantidad 1
      carrito.products.push({ product: pid, quantity: 1 })
    }

    await carrito.save()
    // devolvemos el carrito ya poblado de productos completos
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // eliminar un producto del carrito
  async deleteProductFromCart(cid, pid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error("id de producto inválido")

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
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error("id de producto inválido")

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    const item = carrito.products.find(p => p.product.toString() === pid)
    if (!item) throw new Error("producto no está en el carrito")

    // validamos que quantity sea número positivo
    quantity = Number(quantity)
    if (isNaN(quantity) || quantity < 0) throw new Error("cantidad inválida")

    // si la cantidad es 0, lo eliminamos del carrito
    if (quantity === 0) {
      carrito.products = carrito.products.filter(p => p.product.toString() !== pid)
    } else {
      item.quantity = quantity
    }

    await carrito.save()
    // devolver carrito poblado actualizado
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // reemplazar todos los productos del carrito
  async updateCartProducts(cid, nuevosProductos) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")

    // validamos que el payload sea un array
    if (!Array.isArray(nuevosProductos)) throw new Error("productos inválidos, se espera un arreglo")

    // opcional: validar estructura de cada elemento: { product: ObjectId, quantity: Number }
    const productosValidos = nuevosProductos.map(p => {
      if (!p.product || !mongoose.Types.ObjectId.isValid(p.product)) {
        throw new Error("id de producto inválido en el arreglo")
      }
      const qty = Number(p.quantity) || 1
      if (qty < 0) throw new Error("cantidad inválida en el arreglo")
      return { product: p.product, quantity: qty }
    })

    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    carrito.products = productosValidos
    await carrito.save()
    // devolver carrito poblado actualizado
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }

  // vaciamos completamente el carrito
  async clearCart(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error("id de carrito inválido")
    const carrito = await CartModel.findById(cid)
    if (!carrito) throw new Error("carrito no encontrado")

    carrito.products = []
    await carrito.save()
    // devolver carrito poblado (aunque vacío) para coherencia
    const carritoPopulado = await CartModel.findById(cid).populate("products.product")
    return carritoPopulado
  }
}

module.exports = CartManagerMongo
