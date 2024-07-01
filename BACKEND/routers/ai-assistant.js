const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { chatWithAssistant } = require("../helpers/openai");
const { createProductExcel } = require("../helpers/excel");

// Helper function to determine if a query is about products
function isProductQuery(message) {
  return /producto|precio|categoría|stock|inventario|todos los productos|all products|mas barato|más barato|mas caro|más caro|excel productos/.test(
    message.toLowerCase()
  );
}

// Helper function to format product response
function formatProductResponse(products) {
  return products.map((product) => ({
    name: product.name,
    price: product.price,
    countInStock: product.countInStock,
    image: product.image,
    id: product._id,
  }));
}

// Chat endpoint
router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    if (isProductQuery(message)) {
      let products;

      if (/excel productos/.test(message.toLowerCase())) {
        const workbook = await createProductExcel();
        workbook.write("products.xlsx", res);
        return;
      }

      if (/mas barato|más barato/.test(message.toLowerCase())) {
        products = await Product.find().sort({ price: 1 }).limit(1);
      } else if (/mas caro|más caro/.test(message.toLowerCase())) {
        products = await Product.find().sort({ price: -1 }).limit(1);
      } else if (
        /todos los productos|all products/.test(message.toLowerCase())
      ) {
        products = await Product.find();
      } else {
        const productNameMatch = message.match(/dame el producto (.+)/i);
        if (productNameMatch) {
          const productName = productNameMatch[1];
          products = await Product.find({ name: new RegExp(productName, "i") });
        } else {
          products = await Product.find();
        }
      }

      if (products.length === 0) {
        res.json({
          response:
            "No se encontraron productos que coincidan con la búsqueda.",
        });
      } else {
        res.json({ response: formatProductResponse(products) });
      }
    } else {
      const response = await chatWithAssistant(message);
      res.json({ response });
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

module.exports = router;
