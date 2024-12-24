import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const getCartId = () => {
  const cartId = mongoose.Types.ObjectId(cid);
  if (!cartId) {
    cartId = new ObjectId();
    localStorage.setItem('cartId', cartId.toString());
  }
  return cartId;
};

const addToCart = async (productId) => {
  try {
    const cartId = getCartId(); 
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 }),
    });

    const result = await response.json();
    alert(result.status === 'success' ? 'Producto agregado al carrito' : `Error: ${result.message}`);
  } catch (error) {
    alert('Error al agregar producto al carrito');
    console.error(error);
  }
};

const removeFromCart = async (productId) => {
  try {
    const cartId = getCartId();
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    alert(result.status === 'success' ? 'Producto eliminado del carrito' : `Error: ${result.message}`);
  } catch (error) {
    alert('Error al eliminar producto del carrito');
    console.error(error);
  }
};

const updateProductQuantity = async (productId, quantity) => {
  try {
    const cartId = getCartId();
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    const result = await response.json();
    alert(result.status === 'success' ? 'Cantidad actualizada' : `Error: ${result.message}`);
  } catch (error) {
    alert('Error al actualizar cantidad del producto');
    console.error(error);
  }
};

const clearCart = async () => {
  try {
    const cartId = getCartId(); 
    const response = await fetch(`/api/carts/${cartId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    alert(result.status === 'success' ? 'Carrito vaciado' : `Error: ${result.message}`);
  } catch (error) {
    alert('Error al vaciar el carrito');
    console.error(error);
  }
};


export { addToCart, removeFromCart, updateProductQuantity, clearCart };



