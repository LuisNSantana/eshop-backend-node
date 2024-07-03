const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Order } = require("../models/order"); // Asegúrate de importar tu modelo de orden
const { chatWithAssistant } = require("../helpers/openai");
const { createProductExcel, createOrderExcel } = require("../helpers/excel");

// Helper function to determine if a query is about products or orders
function isProductQuery(message) {
  return /producto|precio|categoría|stock|inventario|todos los productos|all products|mas barato|más barato|mas caro|más caro|excel productos|excel órdenes|excel ordenes/.test(
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

// Helper function to format order response
function formatOrderResponse(orders) {
  return orders.map((order) => ({
    id: order._id,
    user: order.user,
    dateOrdered: order.dateOrdered,
    totalPrice: order.totalPrice,
    status: order.status,
  }));
}

// Chat endpoint
router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    if (isProductQuery(message)) {
      let products, orders;

      if (/excel productos/.test(message.toLowerCase())) {
        const workbook = await createProductExcel();
        const buffer = await workbook.writeToBuffer();
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="products.xlsx"'
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        return res.send(buffer);
      } else if (/excel órdenes|excel ordenes/.test(message.toLowerCase())) {
        const workbook = await createOrderExcel();
        const buffer = await workbook.writeToBuffer();
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="orders.xlsx"'
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        return res.send(buffer);
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

      if (products && products.length === 0) {
        res.json({
          response:
            "No se encontraron productos que coincidan con la búsqueda.",
        });
      } else if (products) {
        res.json({ response: formatProductResponse(products) });
      } else if (orders && orders.length === 0) {
        res.json({
          response: "No se encontraron órdenes que coincidan con la búsqueda.",
        });
      } else if (orders) {
        res.json({ response: formatOrderResponse(orders) });
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
