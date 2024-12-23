import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", (req, res) => {
  res.render("home", { products: req.products });
});

router.post("/", (req, res) => {
  const { brand, model, price, stock, category } = req.body;

  if (!brand || !model || !price || !stock || !category) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const newProduct = {
    id: uuidv4(),
    brand,
    model,
    price,
    stock,
    category,
  };

  req.products.push(newProduct);

  req.io.emit("newProduct", newProduct);

  res.status(201).send("Producto agregado correctamente");
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const productIndex = req.products.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const deletedProduct = req.products.splice(productIndex, 1);

  req.io.emit("deleteProduct", id);

  res
    .status(200)
    .json({
      message: "Producto eliminado con éxito",
      product: deletedProduct[0],
    });
});

export default router;
