import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const cartSchema = new Schema({
  _id: { type: String, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
});

const cartModel = mongoose.model('Cart', cartSchema);
export default cartModel;

