const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

// importamos la clase que maneja productos desde MongoDB
const ProductManagerMongo = require("../dao/productManagerDB")
const manager = new ProductManagerMongo()

// -----------------------------
//  API REST: PRODUCTOS
// -----------------------------

// LISTAR PRODUCTOS CON PAGINACIÓN, FILTROS Y ORDENAMIENTO
// acepta query params: limit (default 10), page (default 1), sort (asc|desc), query (categoria o 'available')
router.get("/", async (req, res) => {
  try {
    // leemos params de query
    let { limit, page, sort, query } = req.query

    // no forzamos defaults aquí con 2, usamos 10 como pide la consigna
    // manager.getProducts ya hace la validación, pero parseamos números por claridad
    limit = limit ? Number(limit) : undefined
    page = page ? Number(page) : undefined

    const resultado = await manager.getProducts({ limit, page, sort, query })

    // si manager devolvió error, lo propagamos
    if (!resultado || resultado.status === "error") {
      return res.status(500).json({ status: "error", error: resultado ? resultado.error : "error desconocido" })
    }

    // devolvemos exactamente el objeto que pide la consigna
    return res.status(200).json({
      status: "success",
      payload: resultado.payload,
      totalPages: resultado.totalPages,
      prevPage: resultado.prevPage,
      nextPage: resultado.nextPage,
      page: resultado.page,
      hasPrevPage: resultado.hasPrevPage,
      hasNextPage: resultado.hasNextPage,
      prevLink: resultado.prevLink,
      nextLink: resultado.nextLink
    })
  } catch (error) {
    console.error("error al listar productos:", error)
    return res.status(500).json({ status: "error", error: error.message })
  }
})

// obtener un producto por id
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params
    // validación básica de id
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: "error", error: "id de producto inválido" })
    }

    const producto = await manager.getProductById(pid)
    if (!producto) {
      return res.status(404).json({ status: "error", error: "producto no encontrado" })
    }

    return res.status(200).json({ status: "success", payload: producto })
  } catch (error) {
    console.error("error al obtener producto por id:", error)
    return res.status(500).json({ status: "error", error: error.message })
  }
})

// agregar un nuevo producto
router.post("/", async (req, res) => {
  try {
    const data = req.body
    // validación mínima: title y price y category y stock
    if (!data.title || data.price == null || !data.category || data.stock == null) {
      return res.status(400).json({ status: "error", error: "faltan campos obligatorios: title, price, category, stock" })
    }

    const nuevo = await manager.addProduct(data)
    if (!nuevo) {
      return res.status(500).json({ status: "error", error: "no se pudo crear el producto" })
    }

    return res.status(201).json({ status: "success", payload: nuevo })
  } catch (error) {
    console.error("error al crear producto:", error)
    return res.status(500).json({ status: "error", error: error.message })
  }
})

// actualizar un producto por id
router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params
    const cambios = req.body

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: "error", error: "id de producto inválido" })
    }

    const actualizado = await manager.updateProduct(pid, cambios)
    if (!actualizado) {
      return res.status(404).json({ status: "error", error: "producto no encontrado o no actualizado" })
    }

    return res.status(200).json({ status: "success", payload: actualizado })
  } catch (error) {
    console.error("error al actualizar producto:", error)
    return res.status(500).json({ status: "error", error: error.message })
  }
})

// eliminar un producto por id
router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: "error", error: "id de producto inválido" })
    }

    const eliminado = await manager.deleteProduct(pid)
    if (!eliminado) {
      return res.status(404).json({ status: "error", error: "producto no encontrado" })
    }

    return res.status(200).json({ status: "success", payload: eliminado })
  } catch (error) {
    console.error("error al eliminar producto:", error)
    return res.status(500).json({ status: "error", error: error.message })
  }
})

module.exports = router
