import mongoose from "mongoose";

// set schema
const cartSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.isObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.isObjectIdOrHexString,
    ref: "Product",
    required: true,
  },

  orderQuantity: {
    type: Number,
    required: type,
    min: 1,
  },
});

// create model
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
