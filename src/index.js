import express from "express";
import { __dirname } from "./utils.js";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import ecommerceProductsRouter from "./routes/ecommerceProducts.router.js";
import ecommerceCartsRouter from "./routes/ecommerceCarts.router.js";
import stockModel from "./models/products.model.js";
import cartModel from "./models/carts.model.js"; // Importar el modelo de carrito
import { v4 as uuidv4 } from 'uuid';

// Conexión a MongoDB
const DBPath = "mongodb+srv://rodrigrenat2021:rUBNhPDPxDayycey@cluster0.yu0lr.mongodb.net/ecommerceguitarras?retryWrites=true&w=majority&appName=Cluster0";
const connectMongoDB = async () => {
  try {
    await mongoose.connect(DBPath);
    console.log("Conexión exitosa a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
};

const app = express();
const PORT = 8080;

// Configuración del servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Configuración de Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: false,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

// Rutas principales
app.use("/api/products", ecommerceProductsRouter); // Productos con filtros y paginación
app.use("/api/carts", ecommerceCartsRouter); // Gestión del carrito

// Ruta para renderizar la vista principal de productos
app.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Filtro por categoría o disponibilidad
    const filter = query
      ? {
          $or: [
            { category: { $regex: query, $options: "i" } }, // Filtrar por categoría
            { stock: { $gte: 1 } }, // Filtrar por disponibilidad
          ],
        }
      : {};

    // Opciones de paginación y ordenamiento
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
    };

    // Obtener productos
    const products = await stockModel.paginate(filter, options);

    // Renderizar vista con productos
    res.render("home", {
      payload: products.docs.map((product) => product.toObject()),
      totalPages: products.totalPages,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `/products?page=${products.prevPage}&limit=${limit}&sort=${sort}&query=${query}`
        : null,
      nextLink: products.hasNextPage
        ? `/products?page=${products.nextPage}&limit=${limit}&sort=${sort}&query=${query}`
        : null,
    });
  } catch (error) {
    console.error("Error al renderizar productos:", error);
    res.status(500).send("Error al cargar la página de productos");
  }
});

// Ruta para renderizar los detalles de un producto
app.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    // Buscar el producto
    const product = await stockModel.findById(pid);

    if (!product) {
      return res.status(404).send({ status: "error", message: "Producto no encontrado" });
    }

    // Renderizar vista de detalles del producto
    res.render("productDetails", { payload: product.toObject() });
  } catch (error) {
    console.error("Error al obtener detalles del producto:", error);
    res.status(500).send("Error al cargar los detalles del producto");
  }
});

// Ruta para renderizar la vista del carrito
app.get("/cart", async (req, res) => {
  try {
    const cart = await cartModel.findOne(); // Obtener el carrito (ajustar según lógica)
    res.render("cart", { payload: cart?.products || [] });
  } catch (error) {
    console.error("Error al cargar el carrito:", error);
    res.status(500).send("Error al cargar el carrito");
  }
});

app.get('/product/:id', (req, res) => {
  const cartId = getCartId(); // Si ya tienes un cartId generado
  res.render('productDetails', { cartId }); // Pasa cartId al renderizado de Handlebars
});

// Ruta de prueba
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Iniciar conexión con MongoDB y servidor
connectMongoDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
