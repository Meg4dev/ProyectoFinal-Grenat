import { Router } from "express";
import cartModel from "../models/carts.model.js";
import stockModel from "../models/products.model.js";
import { v4 as uuidv4 } from 'uuid';


const router = Router();

router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findById(cid).populate("products.product");

    if (!cart) {
      return res.status(404).send({ status: "error", message: "Carrito no encontrado" });
    }

    res.send({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error al obtener el carrito", error });
  }
});


router.get("/", async (req, res) => {
  try {
    const carts = await cartModel.find();
    res.send({ status: "success", payload: carts });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error al obtener los carritos", error });
  }
});

router.post('/', async (req, res) => {
  try {
    // Generar un UUID para el carrito
    const cartId = uuidv4();
    const newCart = new cartModel({
      _id: cartId,
      products: [],
    });

    await newCart.save();
    res.status(201).json({ message: 'Carrito creado con éxito', cartId });
  } catch (error) {
    console.error('Error al crear el carrito:', error);
    res.status(500).json({ message: 'Error al crear el carrito' });
  }
});


router.post('/:cartId/products/:productId', async (req, res) => {
  const { cartId, productId } = req.params;

  try {

    const cart = await cartModel.findOne({ _id: cartId });
    if (!cart) {
      return res.status(400).json({ message: 'Cart ID no válido' });
    }

    const product = await stockModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: 'Product ID no válido' });
    }


    const existingProduct = cart.products.find(item => item.productId.toString() === productId);
    
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ productId, quantity: 1 });
    }

    await cart.save();

    res.status(200).json({ message: 'Producto agregado al carrito', cart });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ message: 'Error al agregar producto al carrito' });
  }
});

router.get('/:cartId', async (req, res) => {
  const { cartId } = req.params;

  try {
    const cart = await cartModel.findOne({ _id: cartId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
});


router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).send({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.send({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error al eliminar producto del carrito", error });
  }
});


router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity <= 0) {
      return res.status(400).send({ status: "error", message: "Cantidad inválida" });
    }

    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).send({ status: "error", message: "Carrito no encontrado" });
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).send({ status: "error", message: "Producto no encontrado en el carrito" });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.send({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error al actualizar la cantidad del producto", error });
  }
});


router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).send({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();

    res.send({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error al vaciar el carrito", error });
  }
});

export default router;
