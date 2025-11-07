const express = require("express")
const router = express.Router()

// importamos las clases que manejan carritos y productos desde MongoDB
const CartManagerMongo = require("../dao/CartManagerMongo")
const ProductManagerMongo = require("../dao/productManagerDB")

// creamos las instancias de los managers
const cartManager = new CartManagerMongo()
const productManager = new ProductManagerMongo()

// Ruta para crear un carrito nuevo
router.post("/", async (req, res) => {
  try {
    // creamos un carrito nuevo usando el método addCart
    const nuevoCarrito = await cartManager.addCart()
    // enviamos el carrito creado con status 201
    res.status(201).json(nuevoCarrito)
  } catch (error) {
    console.error("error al crear carrito:", error)
    res.status(500).json({ error: "error al crear carrito" })
  }
})

// obtenemos un carrito por id
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params
    const carrito = await cartManager.getCartWithPopulate(cid)
    if (!carrito) {
      return res.status(404).json({ error: "carrito no encontrado" })
    }
    // devolvemos el carrito encontrado
    res.json(carrito)
  } catch (error) {
    console.error("error al obtener carrito:", error)
    res.status(500).json({ error: "error al obtener carrito" })
  }
})

// Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params
    // verificamos que el producto exista
    const producto = await productManager.getProductById(pid)
    if (!producto || producto.status === "error") {
      return res.status(404).json({ error: "producto no encontrado" })
    }
    // agregamos el producto al carrito
    const carritoActualizado = await cartManager.addProductToCart(cid, pid)
    // devolvemos el carrito actualizado
    res.json(carritoActualizado)
  } catch (error) {
    console.error("error al agregar producto al carrito:", error)
    res.status(500).json({ error: "error al agregar producto al carrito" })
  }
})

// eliminamos un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params
    const carritoActualizado = await cartManager.deleteProductFromCart(cid, pid)
    if (!carritoActualizado) {
      return res.status(404).json({ error: "carrito no encontrado" })
    }
    res.json({ mensaje: "producto eliminado del carrito correctamente" })
  } catch (error) {
    console.error("error al eliminar producto del carrito:", error)
    res.status(500).json({ error: "error al eliminar producto del carrito" })
  }
})

// actualizamos la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params
    const { quantity } = req.body
    const carritoActualizado = await cartManager.updateProductQuantity(cid, pid, quantity)
    if (!carritoActualizado) {
      return res.status(404).json({ error: "carrito no encontrado" })
    }
    res.json(carritoActualizado)
  } catch (error) {
    console.error("error al actualizar cantidad:", error)
    res.status(500).json({ error: "error al actualizar cantidad de producto" })
  }
})

// reemplazamos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params
    const nuevosProductos = req.body.products // recibimos array de productos
    const carritoActualizado = await cartManager.updateCartProducts(cid, nuevosProductos)
    res.json(carritoActualizado)
  } catch (error) {
    console.error("error al actualizar carrito:", error)
    res.status(500).json({ error: "error al actualizar el carrito" })
  }
})

// vaciamos completamente el carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params
    const carritoVacio = await cartManager.clearCart(cid)
    if (!carritoVacio) {
      return res.status(404).json({ error: "carrito no encontrado" })
    }
    res.json({ mensaje: "carrito vaciado correctamente" })
  } catch (error) {
    console.error("error al vaciar carrito:", error)
    res.status(500).json({ error: "error al vaciar carrito" })
  }
})

module.exports = router
