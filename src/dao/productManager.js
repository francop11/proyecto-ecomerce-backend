
const fs = require("fs").promises // importamos el módulo de filesystem con promesas

class ProductManager {
  constructor(ruta) {
    this.ruta = ruta // ruta del archivo json donde guardammos los productos
  }

  // método para obtener todos los productos ,siempre que son promesas manejamos errores con try y catch
  async getProducts() {
    try {
      const contenido = await fs.readFile(this.ruta, "utf-8") // leemos el archivo como texto
      const productos = JSON.parse(contenido) // parseamos el texto a objeto
      return productos // retornamos el array de productos
    } catch (error) {
      console.error("producto no encontrado o error leyendo:", error)
      return [] // si devuelve error retornamos un array vacio
    }
  }

  // método para obtener un producto específico por su id
  async getProductById(id) {
    try {
      const productos = await this.getProducts() // obtenemos todos los productos
      const productoFiltrado = productos.find((p) => p.id === id) // busca producto con id igual al pedido
      return productoFiltrado // retornamos el producto encontrado 
    } catch (error) {
      console.error("producto no encontrado o error leyendo:", error)
      return null // en caso de error retornamos null
    }
  }

  // método para agregar un nuevo producto
  async addProduct(product) {
    try {
      // validamos que todos los campos esten completos
      if (
        !product.title ||
        !product.code ||
        !product.description ||
        !product.stock ||
        !product.price ||
        !product.category
      ) {
        throw new Error("faltan campos obligatorios")
      }

      const productos = await this.getProducts() 

      //verificamos que el codigo no exita ya ,para evitar duplicados
      const productoExistente = productos.find((p) => p.code === product.code)
      if (productoExistente) {
        throw new Error("el código " + product.code + " ya existe")
      }

      // si el estado no está definido por defecto es true
      if (product.status === undefined) product.status = true

      // si no trae thumbnails se asigna un array vacío
      if (!product.thumbnails) product.thumbnails = []

      // buscamos el maximo id actual
      const maxId = productos.reduce((max, producto) => {
        return producto.id > max ? producto.id : max
      }, 0)

      // creamos el muevo producto con id +1
      const nuevoProducto = { id: maxId + 1, ...product }

      productos.push(nuevoProducto) // pusheamos el produccto nuevo al array

      // guardamos el array en el json
      await fs.writeFile(this.ruta, JSON.stringify(productos, null, 2))

      return nuevoProducto 
    } catch (error) {
      console.error("error al agregar producto:", error)
    }
  }

  // método para actualizar un producto existente por id
  async updateProduct(id, updatedFields) {
    try {
      const productos = await this.getProducts() 
      const index = productos.findIndex(p => p.id === id) // buscamos el índice del producto por id
      if (index === -1) {
        throw new Error("no se encontro el indice solicitado")
      }

      // no permitimos cambiar el id por eso se elimina de los campos a actualizar
      delete updatedFields.id

      // actualizamos el producto con los nuevos campos
      productos[index] = { ...productos[index], ...updatedFields }

      // guardamos el archvio con los productos actualizados
      await fs.writeFile(this.ruta, JSON.stringify(productos, null, 2))

      return productos[index] // retornamos el producto actualizado
    } catch (error) {
      console.error("error al actualizar producto:", error)
    }
  }

  // método para eliminar un producto por id
  async deleteProduct(id) {
    try {
      const productos = await this.getProducts() 
      // filtra la lista para sacar el producto con el id indicado
      const productosFiltrados = productos.filter((p) => p.id !== id)

      // si no se removió ninguno con la misma longitud significa que  no se encontró el producto
      if (productos.length === productosFiltrados.length) {
        console.warn("producto con id " + id + " no encontrado")
        return false //retornamos falso si nose puede eliminar
      }

      // guardamos el archivo
      await fs.writeFile(this.ruta, JSON.stringify(productosFiltrados, null, 2))
      return true // retornamos true si eliminó correctamente
    } catch (error) {
      console.error("error al eliminar producto:", error)
      return false // retornamos false si hubo error
    }
  }
}

module.exports =  ProductManager  // exportamos la clase para usarla en la app.js