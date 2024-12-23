document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const productList = document.querySelector("#product-list");

  socket.on("updateProducts", (products) => {
    productList.innerHTML = "";
    products.forEach((product) => {
      addProductToList(product);
    });
  });


  socket.on("newProduct", (product) => {
    addProductToList(product);
  });

  socket.on("deleteProduct", (id) => {
    const productItem = document.querySelector(`#product-${id}`);
    if (productItem) {
      productList.removeChild(productItem);
    }
  });

  function addProductToList(product) {
    const productItem = document.createElement("li");
    productItem.id = `product-${product.id}`;

    productItem.innerHTML = `
      Marca: ${product.brand}, Modelo: ${product.model}, Precio: ${product.price}, Stock: ${product.stock}, Categoría: ${product.category}
      <button class="delete-btn" data-id="${product.id}">Eliminar</button>
    `;

    productList.appendChild(productItem);

    const deleteButton = productItem.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      const productId = deleteButton.getAttribute("data-id");
      socket.emit("deleteProductRequest", productId);
      alert("Producto eliminado correctamente.");
    });
  }
});
