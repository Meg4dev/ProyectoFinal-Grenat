import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const stockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    brand: { type: String, required: true, index: true }, 
    model: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, index: true },
    category: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Agregar el plugin de paginación
stockSchema.plugin(mongoosePaginate);

// Crear el modelo de producto
const stockModel = mongoose.model("stockproductos", stockSchema);

export default stockModel;
