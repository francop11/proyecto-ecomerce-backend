const express = require("express")
const router = express.Router()

// importamos la clase que maneja productos desde MongoDB
const ProductManagerMongo = require("../dao/productManagerDB")
const manager = new ProductManagerMongo()

// -----------------------------
// 📦 LISTA DE PRODUCTOS (HOME)
// -----------------------------
router.get("/products", async (req, res) => {
  try {
    // Obtenemos los parámetros de query
    let { limit, page, sort, query } = req.query

    // Convertimos limit y page a número y damos valor por defecto
    limit = limit ? parseInt(limit) : 2 // por defecto 2 productos por página
    page = page ? parseInt(page) : 1

    // Obtenemos los productos paginados
    const resultado = await manager.getProducts({ limit, page, sort, query })

    // Renderizamos la vista con los datos
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
      filters: { limit, sort: sort || "", query: query || "" }
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
    const producto = await manager.getProductById(pid)
    if (!producto || producto.status === "error") {
      return res.status(404).send("Producto no encontrado")
    }

    const productoPlano = producto.toObject ? producto.toObject() : producto

    res.render("product", {
      title: productoPlano.title,
      producto: productoPlano
    })
  } catch (error) {
    console.error("Error al renderizar product detail:", error)
    res.status(500).send("Error al cargar la vista de detalle del producto")
  }
})

module.exports = router
