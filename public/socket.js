const socket = io();

socket.on("productosList", (productos) => {
  renderProductos(productos);
});

function renderProductos(productos) {
  const productosActualizados = document.querySelector("#productosActualizados");
  productosActualizados.innerHTML = ""; // Limpio la lista para no repetir

  productos.forEach(product => {
    const li = document.createElement("li");
    li.textContent = product.title + " - Precio: $" + product.price;
    productosActualizados.appendChild(li);
  });
}