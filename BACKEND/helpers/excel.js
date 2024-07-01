const xl = require("excel4node");
const { Product } = require("../models/product");

async function createProductExcel() {
  const workbook = new xl.Workbook();
  const worksheet = workbook.addWorksheet("Products");

  // Definir encabezados de columna
  worksheet.cell(1, 1).string("Name");
  worksheet.cell(1, 2).string("Price");
  worksheet.cell(1, 3).string("CountInStock");

  const products = await Product.find();
  products.forEach((product, index) => {
    worksheet.cell(index + 2, 1).string(product.name);
    worksheet.cell(index + 2, 2).number(product.price);
    worksheet.cell(index + 2, 3).number(product.countInStock);
  });

  return workbook;
}

module.exports = { createProductExcel };
