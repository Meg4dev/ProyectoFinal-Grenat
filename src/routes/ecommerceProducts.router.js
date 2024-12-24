import { Router } from "express";
import stockModel from "../models/products.model.js";
import mongoose from "mongoose";

const router = Router();


router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;


    const filter = query
      ? {
          $or: [
            { category: { $regex: query, $options: "i" } }, 
            { brand: { $regex: query, $options: "i" } }, 
            { stock: { $gte: 1 } }, 
          ],
        }
      : {};


    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : {}, 
    };


    const products = await stockModel.paginate(filter, options);


    res.send({
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      currentPage: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `/api/products?page=${products.prevPage}&limit=${limit}&sort=${sort || ""}&query=${query || ""}`
        : null,
      nextLink: products.hasNextPage
        ? `/api/products?page=${products.nextPage}&limit=${limit}&sort=${sort || ""}&query=${query || ""}`
        : null,
    });
  } catch (error) {
    console.error("Error al consultar productos:", error);
    res.status(500).send({
      status: "error",
      message: "Error al obtener productos",
      error: error.message,
    });
  }


  console.log("Consultando productos en MongoDB...");
  console.log("Nombre de la base de datos:", mongoose.connection.name);
  console.log(
    "Colecciones disponibles:",
    await mongoose.connection.db.listCollections().toArray()
  );
});


router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;


    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).send({ status: "error", message: "ID de producto inválido" });
    }

    const product = await stockModel.findById(pid);


    if (!product) {
      return res.status(404).send({ status: "error", message: "Producto no encontrado" });
    }


    res.render("productDetails", { payload: product });
  } catch (error) {
    console.error("Error al obtener detalles del producto:", error);
    res.status(500).send({
      status: "error",
      message: "Error al obtener los detalles del producto",
      error: error.message,
    });
  }
});

export default router;
