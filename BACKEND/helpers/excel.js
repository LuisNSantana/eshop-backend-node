const xl = require("excel4node");
const { Product } = require("../models/product");
const { Order } = require("../models/order");

// Función para crear Excel de productos
async function createProductExcel() {
  const workbook = new xl.Workbook();
  const worksheet = workbook.addWorksheet("Products");

  // Estilos
  const headerStyle = workbook.createStyle({
    font: {
      bold: true,
      size: 12,
      color: "#FFFFFF",
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#1E90FF",
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  });

  const cellStyle = workbook.createStyle({
    border: {
      left: { style: "thin", color: "black" },
      right: { style: "thin", color: "black" },
      top: { style: "thin", color: "black" },
      bottom: { style: "thin", color: "black" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
  });

  // Definir encabezados de columna
  worksheet.cell(1, 1).string("Name").style(headerStyle);
  worksheet.cell(1, 2).string("Price").style(headerStyle);
  worksheet.cell(1, 3).string("CountInStock").style(headerStyle);

  // Ajustar tamaño de las columnas
  worksheet.column(1).setWidth(30);
  worksheet.column(2).setWidth(10);
  worksheet.column(3).setWidth(15);

  const products = await Product.find();
  products.forEach((product, index) => {
    worksheet
      .cell(index + 2, 1)
      .string(product.name)
      .style(cellStyle);
    worksheet
      .cell(index + 2, 2)
      .number(product.price)
      .style(cellStyle);
    worksheet
      .cell(index + 2, 3)
      .number(product.countInStock)
      .style(cellStyle);
  });

  return workbook;
}

// Función para crear Excel de órdenes
async function createOrderExcel() {
  const workbook = new xl.Workbook();
  const worksheet = workbook.addWorksheet("Orders");

  // Estilos
  const headerStyle = workbook.createStyle({
    font: {
      bold: true,
      size: 12,
      color: "#FFFFFF",
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#1E90FF",
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  });

  const cellStyle = workbook.createStyle({
    border: {
      left: { style: "thin", color: "black" },
      right: { style: "thin", color: "black" },
      top: { style: "thin", color: "black" },
      bottom: { style: "thin", color: "black" },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
  });

  // Definir encabezados de columna
  worksheet.cell(1, 1).string("Order ID").style(headerStyle);
  worksheet.cell(1, 2).string("User").style(headerStyle);
  worksheet.cell(1, 3).string("Date Ordered").style(headerStyle);
  worksheet.cell(1, 4).string("Total Price").style(headerStyle);
  worksheet.cell(1, 5).string("Status").style(headerStyle);

  // Ajustar tamaño de las columnas
  worksheet.column(1).setWidth(30);
  worksheet.column(2).setWidth(20);
  worksheet.column(3).setWidth(20);
  worksheet.column(4).setWidth(15);
  worksheet.column(5).setWidth(15);

  const orders = await Order.find().populate("user");
  orders.forEach((order, index) => {
    worksheet
      .cell(index + 2, 1)
      .string(order._id.toString())
      .style(cellStyle);
    worksheet
      .cell(index + 2, 2)
      .string(order.user.name)
      .style(cellStyle);
    worksheet
      .cell(index + 2, 3)
      .date(order.dateOrdered)
      .style(cellStyle);
    worksheet
      .cell(index + 2, 4)
      .number(order.totalPrice)
      .style(cellStyle);
    worksheet
      .cell(index + 2, 5)
      .string(order.status)
      .style(cellStyle);
  });

  return workbook;
}

module.exports = { createProductExcel, createOrderExcel };
