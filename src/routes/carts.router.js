const express = require("express")
const router = express.Router()

// Importamos las clases para manejar carritos y productos
const CartManager = require("../dao/cartManager")
const manager = new CartManager("./src/data/carts.json")

const ProductManager = require("../dao/productManager")
const productManager = new ProductManager("./src/data/productos.json")
// Ruta POST para crear un carrito nuevo y vacío
router.post("/", async (req, res) => {
  try {
    // Creamos un carrito nuevo usando el método addCart()
    const nuevoCarrito = await manager.addCart()

    // Enviamos el carrito creado con status 201 (Created)
    res.status(201).json(nuevoCarrito)
  } catch (error) {
    // Si hay error, logueamos y enviamos error 500 (Internal Server Error)
    console.error("Error al crear carrito:", error)
    res.status(500).json({ error: "Error al crear carrito" })
  }
});

// Ruta GET para obtener un carrito por su ID (cid)
router.get("/:cid", async (req, res) => {
  try {
    const cid = parseInt(req.params.cid)

    // Validamos que el ID del carrito sea un número válido
    if (isNaN(cid)) {
      return res.status(400).json({ error: "ID de carrito inválido" })
    }

    // Buscamos el carrito con el ID dado
    const carrito = await manager.getCartById(cid)

    // Si no existe el carrito, enviamos error 404 (Not Found)
    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" })
    }

    // Si todo bien, enviamos el carrito encontrado
    res.json(carrito)
  } catch (error) {
    console.error("Error al obtener carrito:", error)
    res.status(500).json({ error: "Error al obtener carrito" })
  }
})

// Ruta POST para agregar un producto a un carrito (por IDs)
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = parseInt(req.params.cid)
    const pid = parseInt(req.params.pid)

    // Validamos que ambos IDs sean válidos
    if (isNaN(cid)) {
      return res.status(400).json({ error: "ID de carrito inválido" })
    }
    if (isNaN(pid)) {
      return res.status(400).json({ error: "ID de producto inválido" })
    }

    // Verificamos que el producto exista en el listado
    const productExists = await productManager.getProductById(pid)
    if (!productExists) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    // Agregamos el producto al carrito
    const carritoActualizado = await manager.addProductToCart(cid, pid)

    // Si no existe el carrito, respondemos error 404
    if (!carritoActualizado) {
      return res.status(404).json({ error: "Carrito no encontrado" })
    }

    // Respondemos con el carrito actualizado
    res.json(carritoActualizado)
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error)
    res.status(500).json({ error: "Error al agregar producto al carrito" })
  }
});

module.exports = router
