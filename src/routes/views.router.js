const express = require("express")
const router = express.Router()

// Managers desde DAO
const ProductManagerMongo = require("../dao/productManagerDB")
const ProductManager = new ProductManagerMongo()
const CartManagerMongo = require("../dao/CartManagerMongo")
const CartManager = new CartManagerMongo()

// -----------------------------
// 📦 LISTA DE PRODUCTOS (HOME)
// -----------------------------
router.get("/products", async (req, res) => {
  try {
    let { limit, page, sort, query } = req.query
    limit = limit ? parseInt(limit) : 2
    page = page ? parseInt(page) : 1

    const resultado = await ProductManager.getProducts({ limit, page, sort, query })
    const cartId = req.session?.cartId || null

    res.render("home", {
      title: "Productos",
      productos: resultado.payload || [],
      pagination: {
        totalPages: resultado.totalPages,
        prevPage: resultado.prevPage,
        nextPage: resultado.nextPage,
        page: resultado.page,
        hasPrevPage: resultado.hasPrevPage,
        hasNextPage: resultado.hasNextPage,
        prevLink: resultado.prevLink,
        nextLink: resultado.nextLink
      },
      filters: { limit, sort: sort || "", query: query || "" },
      cartId
    })
  } catch (error) {
    console.error("Error al renderizar products view:", error)
    res.status(500).send("Error al cargar la vista de productos")
  }
})

// --------------------------------
// 🧾 DETALLE DE UN PRODUCTO
// --------------------------------
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params
    const producto = await ProductManager.getProductById(pid)
    if (!producto || producto.status === "error") {
      return res.status(404).send("Producto no encontrado")
    }

    const productoPlano = producto.toObject ? producto.toObject() : producto
    const cartId = req.session?.cartId || null

    res.render("product", {
      title: productoPlano.title,
      producto: productoPlano,
      cartId
    })
  } catch (error) {
    console.error("Error al renderizar product detail:", error)
    res.status(500).send("Error al cargar la vista de detalle del producto")
  }
})

// --------------------------------
// 🛒 VISTA DEL CARRITO
// --------------------------------

// 🆕 Si el usuario entra a /carts sin ID, creamos uno nuevo
// 🆕 Si el usuario entra a /carts sin ID, creamos uno nuevo
router.get("/carts", async (req, res) => {
  try {
    const nuevoCarrito = await CartManager.addCart() // 🔹 antes era createCart()
    const cid = nuevoCarrito._id.toString()
    req.session.cartId = cid
    res.redirect(`/carts/${cid}`)
  } catch (error) {
    console.error("Error al crear el carrito:", error)
    res.status(500).send("Error al crear el carrito")
  }
})

// 🧾 Si entra a /carts/:cid, mostramos el carrito
router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params
    const carrito = await CartManager.getCartWithPopulate(cid)
    if (!carrito) return res.status(404).send("Carrito no encontrado")

    res.render("cart", {
      title: "Carrito de compras",
      cart: carrito.toObject(),
      cartId: cid
    })
  } catch (error) {
    console.error("Error al cargar el carrito:", error)
    res.status(500).send("Error al cargar el carrito")
  }
})

module.exports = router
