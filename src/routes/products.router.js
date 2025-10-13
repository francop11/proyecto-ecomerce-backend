const express=require("express")
const router=express.Router()


// importamos la clase productmanager para manejar productos
const ProductManager = require("../dao/productManager")

// la variable manager trae el json desde la ruta especificada
const manager = new ProductManager("./src/data/productos.json")



// endpoint para obtener productos ,filtrando por precio y por cierta cantidad de productos
router.get("/", async (req, res) => {
  try {
    
    const productos = await manager.getProducts() // traemos los produtcos desde el manager
    // si price esta definidio filtramso los productos


    res.json(productos) // traemos todo los productos en formato json

  } catch (error) {
    console.error(" error al obtener productos:", error)
    res.status(500).json({ error: "error al obtener los productos" }) 
  }
})

// ruta para obtener un producto por id
router.get("/:pid", async (req, res) => {
  try {
    // obtenemos el id por parametro
    const pid = parseInt(req.params.pid)

    // buscamos el id por pordutco trayendo todos los productos
    const producto = await manager.getProductById(pid)

    // Si no exitse salta el error 404
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    // mostramos el producto en formato json
    res.json(producto)
  } catch (error) {
    
    console.error("Error al obtener producto:", error)
    res.status(500).json({ error: "Error al obtener el producto" })
  }
})


router.post("/",async (req,res)=>{
    try{
        const nuevoProducto=req.body
        const productoAgregado=await manager.addProduct(nuevoProducto)
        
    if (!productoAgregado) {
      return res.status(400).json({ error: "No se pudo agregar el producto" })
    }
    res.status(201).json(productoAgregado)

    }
    catch(error){
         console.error("Error al agregar producto:", error)
    res.status(500).json({ error: "Error al agregar producto" })

    }

})



router.put("/:pid",async (req,res)=>{
    try{
          const pid = parseInt(req.params.pid)
          const productoPorId=req.body
          const productoModificado=await manager.updateProduct(pid,productoPorId)

          if (!productoModificado) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }
    res.json(productoModificado)


    }
    catch(error){
        console.error("Error al actualizar producto:", error)
    res.status(500).json({ error: "Error al actualizar producto" })

    }
})

router.delete("/:pid",async(req,res)=>{
    try{
        const pid=parseInt(req.params.pid)
        const productoEliminado=await manager.deleteProduct(pid)
        if(!productoEliminado){
            return res.status(404).json({ error: "Producto no encontrado" })

        }
       res.json({ message: "Producto eliminado correctamente" })

    }
    catch(error){
         console.error("Error al eliminbar el producto :", error)
    res.status(500).json({ error: "Error al eliminar el producto" })


    }
})

module.exports = router // Exportamos el router