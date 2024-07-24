import express from "express";
import { isSeller, isUser } from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import {
  addProductValidationSchema,
  paginationDataValidationSchema,
} from "./product.validation.js";
import Product from "./product.modle.js";
import validateMongoIdFromParams from "../middleware/validate.mongo.id.js";
import checkMongoIdsEquality from "../utils/mongo.id.equality.js";
const router = express.Router();

// * add product
router.post(
  "/product/add",
  isSeller,
  validateReqBody(addProductValidationSchema),

  async (req, res) => {
    // extract newProduct from req.body
    const newProduct = req.body;
    // add seller Id
    newProduct.sellerId = req.loggedInUserId;

    // add product
    await Product.create(newProduct);

    // send res
    return res.status(201).send({ message: "Product is added successfully." });
  }
);

// *delete product
router.delete(
  "/product/delete/:id",
  isSeller,
  validateMongoIdFromParams,
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;

    // find product using productId
    const product = await Product.findById(productId);

    // if not product found, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exists." });
    }

    // check if loggedInUserId is owner of the product
    const isProductOwner = checkMongoIdsEquality(
      product.sellerId,
      req.loggedInUserId
    );

    // if not owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product." });
    }

    // delete product
    await Product.findByIdAndDelete(productId);

    // send res
    return res.status(200).send({ message: "Deleted successfully." });
  }
);

// * edit product
router.put(
  "/product/edit/:id",
  isSeller,
  validateMongoIdFromParams,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    // extract productId from req.params
    const productId = req.params.id;

    // find product using productId
    const product = await Product.findOne({ _id: productId });

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exists." });
    }

    // check product ownership
    const isProductOwner = checkMongoIdsEquality(
      product.sellerId,
      req.loggedInUserId
    );

    //  if not product owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product." });
    }

    // extract new values form req.body

    const newValues = req.body;

    // edit product
    await Product.updateOne(
      {
        _id: productId,
      },
      {
        $set: { ...newValues },
      }
    );

    //  send res

    return res.status(200).send({ message: "Product is edited successfully." });
  }
);

// * get product details

router.get(
  "/product/detail/:id",
  isUser,
  validateMongoIdFromParams,
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;

    // find product using product id
    const product = await Product.findOne({ _id: productId });
    // if not product, throw error
    if (!product) {
      return res.status(400).send({ message: "Product does not exists." });
    }
    // send res
    return res
      .status(400)
      .send({ message: "Success.", productDetail: product });
  }
);
export default router;

//* list product by seller
router.post(
  "/product/seller/list",
  isSeller,
  validateReqBody(paginationDataValidationSchema),
  async (req, res) => {
    // extract pagination data from req.body
    // const data = req.body;

    // const page = data.page;
    // const limit = data.page;
    // or

    const { page, limit, searchText } = req.body;
    // calculate skip
    const skip = (page - 1) * limit;

    // condition

    let match = { sellerId: req.loggedInUserId };

    if (searchText) {
      match.name = { $regex: searchText, $options: "i" };
    }

    const products = await Product.aggregate([
      {
        $match: match,
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          image: 1,
          description: { $substr: ["$description", 0, 200] },
        },
      },
    ]);
    return res.status(200).send({ message: "Success", productList: products });
  }
);

// router.get(
//   "/product/list",
//   async (req, res, next) => {
//     // extract token from req.headers

//     const { authorization } = req.headers;
//     const splittedArray = authorization?.split("");
//     const token = splittedArray?length===2? splittedArray[1]: null ;
//     console.log(token);
//     next();
//   },
//   async (req, res) => {
//     // find all products
//     const products = await Product.find();

//     // send res
//     return res.status(200).send({ message: "success", productList: products });
//   }
// );
