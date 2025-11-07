// importamos el modelo de productos
const ProductModel = require('../models/product.model')

class ProductManagerMongo {
  // método para obtener todos los productos con filtros, paginación y ordenamiento
  async getProducts({ limit = 10, page = 1, sort, query }) {
    try {
      // conversión y validaciones de los parámetros
      limit = Number(limit)
      page = Number(page)
      if (isNaN(limit) || limit <= 0) limit = 10
      if (isNaN(page) || page <= 0) page = 1

      const filter = {}

      // filtrado por categoría o disponibilidad
      if (query) {
        if (typeof query === 'string' && query.toLowerCase() === 'available') {
          // filtramos los productos con stock mayor a 0 (disponibilidad)
          filter.stock = { $gt: 0 }
        } else {
          // filtramos por categoría
          filter.category = query
        }
      }

      // ordenamiento por precio asc o desc
      const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}

      const options = {
        limit,
        page,
        sort: sortOption,
        lean: true
      }

      const result = await ProductModel.paginate(filter, options)

      // función para construir los links de paginación
      const baseUrl = '/api/products'
      const params = []
      if (limit) params.push(`limit=${encodeURIComponent(limit)}`)
      if (sort) params.push(`sort=${encodeURIComponent(sort)}`)
      if (query) params.push(`query=${encodeURIComponent(query)}`)

      const buildLink = (pageNumber) => {
        if (!pageNumber) return null
        const qp = [`page=${pageNumber}`, ...params].join('&')
        return `${baseUrl}?${qp}`
      }

      // retornamos la estructura de respuesta solicitada en la consigna
      return {
        status: 'success',
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
      console.error('Error al obtener productos:', error)
      return { status: 'error', error: error.message }
    }
  }

  // método para obtener producto por id
  async getProductById(pid) {
    try {
      const producto = await ProductModel.findById(pid).lean()
      return producto
    } catch (error) {
      console.error('Error al obtener producto por id:', error)
      return null
    }
  }

  // método para crear un nuevo producto
  async addProduct(productData) {
    try {
      const nuevoProducto = await ProductModel.create(productData)
      return nuevoProducto
    } catch (error) {
      console.error('Error al crear producto:', error)
      return null
    }
  }

  // método para actualizar un producto existente
  async updateProduct(pid, updatedData) {
    try {
      const productoActualizado = await ProductModel.findByIdAndUpdate(pid, updatedData, { new: true })
      return productoActualizado
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      return null
    }
  }

  // método para eliminar un producto
  async deleteProduct(pid) {
    try {
      const productoEliminado = await ProductModel.findByIdAndDelete(pid)
      return productoEliminado
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      return null
    }
  }
}

module.exports = ProductManagerMongo
