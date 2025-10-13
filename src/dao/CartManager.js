const fs = require("fs").promises


class CartManager {
  constructor(ruta) {
    this.ruta = ruta
  }

  async getCarts() {
  
      const contenido = await fs.readFile(this.ruta, "utf-8")
      return JSON.parse(contenido)
    
    
  }

  async saveCarts(carritos) {
    
      await fs.writeFile(this.ruta, JSON.stringify(carritos, null, 2))
  
  }

  async addCart() {
    
            const carritos = await this.getCarts()

      const maxId = carritos.reduce((max, c) => (c.id > max ? c.id : max), 0)
      const nuevoCarrito = {
        id: maxId + 1,
        products: []
      };
      carritos.push(nuevoCarrito);
      await this.saveCarts(carritos)

      return nuevoCarrito;
     
  }

  async getCartById(id) {
    
      const carritos = await this.getCarts()
      const carrito = carritos.find((c) => c.id === parseInt(id))
      return carrito || null;
    
  }

  async addProductToCart(cid, pid) {
    
      const carritos = await this.getCarts()

      // Buscar el carrito
      const carrito = carritos.find((c) => c.id === parseInt(cid))
      if (!carrito) {
        throw new Error("Carrito no encontrado")
      }

      // Buscar el producto dentro del carrito
      const productoEnCarrito = carrito.products.find(
        (p) => p.product === parseInt(pid)
      );

      if (productoEnCarrito) {
        // Si ya existe, aumentamos la cantidad
        productoEnCarrito.quantity += 1;
      } else {
        // Si no existe, agregamos el producto con quantity 1
        carrito.products.push({ product: parseInt(pid), quantity: 1 });
      }

      // Guardar los carritos actualizados en el archivo
      await this.saveCarts(carritos);

      return carrito;
    
  }
}

module.exports = CartManager;
