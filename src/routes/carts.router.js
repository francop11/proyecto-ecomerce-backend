const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

// importamos los managers
const CartManagerMongo = require("../dao/CartManagerMongo")
const ProductManagerMongo = require("../dao/productManagerDB")

const cartManager = new CartManagerMongo()
const productManager = new ProductManagerMongo()

// --------------------------------
// 🛒 CREAR UN CARRITO NUEVO
// --------------------------------
router.post("/", async (req, res) => {
  try {
    const nuevoCarrito = await cartManager.addCart()
    res.status(201).json(nuevoCarrito)
  } catch (error) {
    console.error("error al crear carrito:", error)
    res.status(500).json({ error: "error al crear carrito" })
  }
})

// --------------------------------
// 🛒 OBTENER CARRITO POR ID
// --------------------------------
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: "id de carrito inválido" })
    }

    const carrito = await cartManager.getCartWithPopulate(cid)
    if (!carrito) {
      return res.status(404).json({ error: "carrito no encontrado" })
    }

    res.json(carrito)
  } catch (error) {
    console.error("error al obtener carrito:", error)
    res.status(500).json({ error: "error al obtener carrito" })
  }
})

// --------------------------------
// 🛒 AGREGAR PRODUCTO AL CARRITO
// --------------------------------
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params
    if (!mongoose.Types.ObjectId.isValid(cid)) return res.status(400).json({ error: "id de carrito inválido" })
    if (!mongoose.Types.ObjectId.isValid(pid)) return res.status(400).json({ error: "id de producto inválido" })

    const producto = await productManager.getProductById(pid)
    if (!producto) return res.status(404).json({ error: "producto no encontrado" })

    const carritoActualizado = await cartManager.addProductToCart(cid, pid)
    res.json(carritoActualizado)
  } catch (error) {
    console.error("error al agregar producto al carrito:", error)
    if (error.message && /no encontrado|inválido|sin stock/i.test(error.message)) {
      return res.status(400).json({ error: error.message })
    }
    res.status(500).json({ error: "error al agregar producto al carrito" })
  }
})

// --------------------------------
// 🛒 ELIMINAR PRODUCTO DEL CARRITO
// --------------------------------
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params
    if (!mongoose.Types.ObjectId.isValid(cid)) return res.status(400).json({ error: "id de carrito inválido" })
    if (!mongoose.Types.ObjectId.isValid(pid)) return res.status(400).json({ error: "id de producto inválido" })

    const carritoActualizado = await cartManager.deleteProductFromCart(cid, pid)
    res.json(carritoActualizado)
  } catch (error) {
    console.error("error al eliminar producto del carrito:", error)
    res.status(500).json({ error: "error al eliminar producto del carrito" })
  }
})

// --------------------------------
// 🛒 ACTUALIZAR CANTIDAD DE UN PRODUCTO
// --------------------------------
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params
    let { quantity } = req.body
    quantity = Number(quantity)
    if (isNaN(quantity) || quantity < 0) return res.status(400).json({ error: "cantidad inválida" })

    const carritoActualizado = await cartManager.updateProductQuantity(cid, pid, quantity)
    res.json(carritoActualizado)
  } catch (error) {
    console.error("error al actualizar cantidad:", error)
    res.status(500).json({ error: "error al actualizar cantidad de producto" })
  }
})

// --------------------------------
// 🛒 REEMPLAZAR TODOS LOS PRODUCTOS DEL CARRITO
// --------------------------------
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params
    const nuevosProductos = req.body.products
    if (!Array.isArray(nuevosProductos)) return res.status(400).json({ error: "se espera un arreglo en body.products" })

    const carritoActualizado = await cartManager.updateCartProducts(cid, nuevosProductos)
    res.json(carritoActualizado)
  } catch (error) {
    console.error("error al actualizar carrito:", error)
    res.status(500).json({ error: "error al actualizar el carrito" })
  }
})

// --------------------------------
// 🛒 VACIAR EL CARRITO COMPLETAMENTE
// --------------------------------
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params
    const carritoVacio = await cartManager.clearCart(cid)
    res.json(carritoVacio)
  } catch (error) {
    console.error("error al vaciar carrito:", error)
    res.status(500).json({ error: "error al vaciar carrito" })
  }
})

module.exports = router
