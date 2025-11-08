// importamos el modelo de productos
const ProductModel = require("../models/product.model")

class ProductManagerMongo {
  // metodo para obtner todos los productos con filtros
  async getProducts({ limit = 10, page = 1, sort, query }) {
    try {
      // conversion y validacion de los parametros
      limit = Number(limit)
      page = Number(page)
      if (isNaN(limit) || limit <= 0) limit = 10
      if (isNaN(page) || page <= 0) page = 1

      const filter = {}

      // filtro por categoria o disponibilidad
      if (query) {
        if (typeof query === "string" && query.toLowerCase() === "available") {
          // filtramos los productos con stock 
          filter.stock = { $gt: 0 }
        } else {
          // filtramos por categoria
          filter.category = query
        }
      }

      // orden por precio ascendente o descendente
      const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {}

      const options = {
        limit,
        page,
        sort: sortOption,
        lean: true
      }

      const result = await ProductModel.paginate(filter, options)

      // creamos los link de paginacion
      const baseUrl = "/api/products"
      const params = []
      if (limit) params.push(`limit=${encodeURIComponent(limit)}`)
      if (sort) params.push(`sort=${encodeURIComponent(sort)}`)
      if (query) params.push(`query=${encodeURIComponent(query)}`)

      const buildLink = (pageNumber) => {
        if (!pageNumber) return null
        const qp = [`page=${pageNumber}`, ...params].join("&")
        return `${baseUrl}?${qp}`
      }

      return {
        status: "success",
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.hasPrevPage ? result.prevPage : null,
        nextPage: result.hasNextPage ? result.nextPage : null,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
        nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
      }
    } catch (error) {
      console.error("error al obtener productos:", error)
      return { status: "error", error: error.message }
    }
  }

  // metodo para traer un producto por id
  async getProductById(pid) {
    try {
      const producto = await ProductModel.findById(pid).lean()
      return producto
    } catch (error) {
      console.error("error al obtener producto por id:", error)
      return null
    }
  }

  // metodo para crear un nuevo producto
  async addProduct(productData) {
    try {
      const nuevoProducto = await ProductModel.create(productData)
      return nuevoProducto
    } catch (error) {
      console.error("error al crear producto:", error)
      return null
    }
  }

  // metodo para actualizar un producto
  async updateProduct(pid, updatedData) {
    try {
      const productoActualizado = await ProductModel.findByIdAndUpdate(pid, updatedData, { new: true })
      return productoActualizado
    } catch (error) {
      console.error("error al actualizar producto:", error)
      return null
    }
  }

  // metodo para eliminar un producto
  async deleteProduct(pid) {
    try {
      const productoEliminado = await ProductModel.findByIdAndDelete(pid)
      return productoEliminado
    } catch (error) {
      console.error("error al eliminar producto:", error)
      return null
    }
  }
}

module.exports = ProductManagerMongo
