const Product = require("../models/product.model")
const mongoose = require("mongoose")

class ProductManagerMongo {
  // obtenemos productos con filtros, paginación y orden
  async getProducts({ limit = 2, page = 1, sort, query }) { // 🟢 cambiamos limit por defecto a 2
    try {
      // aseguramos que sean numeros validos
      limit = Number.isFinite(parseInt(limit)) ? parseInt(limit) : 2 // 🟢 default: 2 productos
      page = Number.isFinite(parseInt(page)) ? parseInt(page) : 1

      const filter = {}

      // filtramos por categoria o disponibilidad
      if (query) {
        if (query === "available") filter.status = true
        else filter.category = query
      }

      // ordenamos por precio ascedente o descensedente
      const sortOption =
        sort === "asc"
          ? { price: 1 }
          : sort === "desc"
          ? { price: -1 }
          : {}

      // opciones de pagination
      const options = {
        limit,
        page,
        sort: sortOption,
        lean: true,
      }

      // usamos el método paginate del modelo
      const result = await Product.paginate(filter, options)

      // reconstruimos los links conservando los paramteros
      const baseUrl = "/api/products"
      const queryParams = []

      if (limit) queryParams.push("limit=" + limit)
      if (sort) queryParams.push("sort=" + sort)
      if (query) queryParams.push("query=" + query)

      const buildLink = function (pageNumber) {
        if (!pageNumber) return null
        let link = baseUrl + "?page=" + pageNumber
        if (queryParams.length) {
          link += "&" + queryParams.join("&")
        }
        return link
      }

      return {
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: buildLink(result.prevPage),
        nextLink: buildLink(result.nextPage),
      }
    } catch (error) {
      console.error("error al obtener productos:", error)
      return { status: "error", error: error.message }
    }
  }

  // obtenemos un producto por id
  async getProductById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("id de producto inválido")
      }
      const product = await Product.findById(id)
      if (!product) throw new Error("producto no encontrado")
      return product
    } catch (error) {
      console.error("error al obtener producto por id:", error)
      return { status: "error", error: error.message }
    }
  }

  // agregamos un nuevo producto
  async addProduct(data) {
    try {
      if (!data.title || !data.price || !data.category || !data.stock) {
        throw new Error("faltan campos obligatorios: título, precio o categoría")
      }
      const product = await Product.create(data)
      return product
    } catch (error) {
      console.error("error al agregar producto:", error)
      return { status: "error", error: error.message }
    }
  }

  // actualizamos el producto
  async updateProduct(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("id de producto invalido")
      }
      const updated = await Product.findByIdAndUpdate(id, data, { new: true })
      if (!updated) throw new Error("producto no encontrado")
      return updated
    } catch (error) {
      console.error("error al actualizar producto:", error)
      return { status: "error", error: error.message }
    }
  }

  // eliminamos el producto
  async deleteProduct(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("id de producto invalido")
      }
      const deleted = await Product.findByIdAndDelete(id)
      if (!deleted) throw new Error("producto no encontrado")
      return deleted
    } catch (error) {
      console.error("error al eliminar producto:", error)
      return { status: "error", error: error.message }
    }
  }
}

module.exports = ProductManagerMongo
