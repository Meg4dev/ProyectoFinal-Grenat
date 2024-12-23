import express from "express";
import { Router } from "express";
import productsRouter from "./routes/router.products.js";
import { __dirname } from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";

const app = express();
const router = Router();
const PORT = 8080;
const httpServer = app.listen(PORT, () => {
  console.log(
    `Servidor http escuchando en el puerto ${PORT} de forma exitosa.`
  );
});

const io = new Server(httpServer);
let products = [];

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.emit("updateProducts", products);


  socket.on("deleteProductRequest", (id) => {
    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex !== -1) {

      products.splice(productIndex, 1);


      io.emit("deleteProduct", id);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

app.get("/real-time-products", (req, res) => {
  res.render("realTimeProducts");
});

app.use((req, res, next) => {
  req.io = io;
  req.products = products;
  next();
});

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use("/home", productsRouter);

app.get("/add-product", (req, res) => {
  res.render("addProduct");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

export default router;
