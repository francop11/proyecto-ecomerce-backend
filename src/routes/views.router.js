const express = require("express")
const router = express.Router()

// Managers desde DAO
const ProductManagerMongo = require("../dao/productManagerDB")
const ProductManager = new ProductManagerMongo()

// -----------------------------
// 📦 LISTA DE PRODUCTOS (VISTA HOME)
// -----------------------------
router.get("/products", async (req, res) => {
  try {
    let { limit, page, sort, query } = req.query
    limit = limit ? Number(limit) : undefined
    page = page ? Number(page) : undefined

    const resultado = await ProductManager.getProducts({ limit, page, sort, query })

    if (!resultado || resultado.status === "error") {
      console.error("error al obtener productos para la vista:", resultado ? resultado.error : "resultado inválido")
      return res.status(500).send("Error al cargar la vista de productos")
    }

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
      filters: { limit: limit || 10, sort: sort || "", query: query || "" }
    })
  } catch (error) {
    console.error("Error al renderizar products view:", error)
    res.status(500).send("Error al cargar la vista de productos")
  }
})

// --------------------------------
// 🧾 DETALLE DE UN PRODUCTO (VISTA)
// --------------------------------
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params
    const producto = await ProductManager.getProductById(pid)
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
