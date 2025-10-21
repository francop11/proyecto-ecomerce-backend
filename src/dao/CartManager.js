const fs = require("fs").promises

class CartManager {
  constructor(ruta) {
    this.ruta = ruta // ruta del archivo donde se almacenaran lo carritos
  }

  // método para obtener todos los carritos desde el archivo json
  async getCarts() {
    const contenido = await fs.readFile(this.ruta, "utf-8")
    return JSON.parse(contenido) // parseamos el contenido json y lo retornamos
  }

  // metodo para guardar el array de carritos en el archivo json
  async saveCarts(carritos) {
    await fs.writeFile(this.ruta, JSON.stringify(carritos, null, 2))
  }

  // metodo para crear un nuevo carrito con id incremental y sin productos
  async addCart() {
    const carritos = await this.getCarts()

    // buscamos el id máximo entre los carritos existentes para asignar uno nuevo
    const maxId = carritos.reduce((max, c) => (c.id > max ? c.id : max), 0)

    const nuevoCarrito = {
      id: maxId + 1,
      products: [] // el nuevo carrito comienza sin productos
    }

    carritos.push(nuevoCarrito) // agregamos el carrito nuevo al array

    await this.saveCarts(carritos) // guardamos los cambios en el archivo

    return nuevoCarrito // retornamos el carrito creado
  }

  // metodo para buscar un carrito por su id
  async getCartById(id) {
    const carritos = await this.getCarts()
    // buscamos el carrito que coincida con el id 
    const carrito = carritos.find((c) => c.id === parseInt(id))
    return carrito || null // si no se encuentra retornamos null
  }

  // metodo para agregar un producto a un carrito específico
  async addProductToCart(cid, pid) {
    const carritos = await this.getCarts()

    // buscamos el carrito con id igual a cid
    const carrito = carritos.find((c) => c.id === parseInt(cid))

    if (!carrito) {
      throw new Error("Carrito no encontrado") // si no existe el carrito, lanzamos error
    }

    // buscamos si el producto ya está en el carrito
    const productoEnCarrito = carrito.products.find(
      (p) => p.product === parseInt(pid)
    )

    if (productoEnCarrito) {
      // si el producto ya está, aumentamos la cantidad
      productoEnCarrito.quantity += 1
    } else {
      // si no está, lo agregamos con cantidad 1
      carrito.products.push({ product: parseInt(pid), quantity: 1 })
    }

    // guardamos los carritos actualizados en el archivo
    await this.saveCarts(carritos)

    return carrito // retornamos el carrito actualizado
  }
}

module.exports = CartManager
