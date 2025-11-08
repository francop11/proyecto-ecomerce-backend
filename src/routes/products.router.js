const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

// importamos la clase que maneja productos desde Mongo
const ProductManagerMongo = require("../dao/productManagerDB")
const manager = new ProductManagerMongo()



router.get("/", async (req, res) => {
  try {
    // leemos params de query
    let { limit, page, sort, query } = req.query

  
    limit = limit ? Number(limit) : undefined
    page = page ? Number(page) : undefined

    const resultado = await manager.getProducts({ limit, page, sort, query })

    // si manager devuelve error lo propogamos
    if (!resultado || resultado.status === "error") {
      return res.status(500).json({ status: "error", error: resultado ? resultado.error : "error desconocido" })
    }

    // devolvemos el obejto
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

// obtenemos un producto por id
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params
    // validamos el id
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

// agregamos un nuevo producto
router.post("/", async (req, res) => {
  try {
    const data = req.body
    // validaciones
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

// actualizamos un producto por id
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

// eliminamos un producto por id
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
