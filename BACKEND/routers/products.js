const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");

const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const newDir = __dirname.replace("routers", "");
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, newDir + "/public/uploads/");
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    //cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  //con el signo - decimos la variable que no queremos que se muestre en este caso id
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter)
    .select("name image category id countInStock price dateCreated rating")
    .populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});
router.get(`/:id`, async (req, res) => {
  //populate nos muestra completa la tabla con la que tenemos relacion
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  //para poder tener la ruta completa de la imagen
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  if (!category) {
    return res.status(400).send("Invalid category");
  }
  const file = req.file;
  if (!file) {
    return res.status(400).send("No image in the request");
  }
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  product = await product.save();
  if (!product) {
    return res.status(500).send("the product cannot be created");
  }
  return res.send(product);
});

//actualizar producto con imagen
router.put(`/:id`, uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid product id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(400).send("Invalid product");
  }

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(

    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  );
  if (!updatedProduct) {
    return res.status(500).send("the product cannot be updated");
  }
  return res.send(updatedProduct);
});

//actualizar con varias imagenes el producto
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid Product Id');
  }
  const files = req.files;
  let imagesPaths = [];
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  if (files) {
      files.map((file) => {
          imagesPaths.push(`${basePath}${file.filename}`);
      });
  }

  const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
          images: imagesPaths
      },
      { new: true }
  );

  if (!product) return res.status(500).send('the gallery cannot be updated!');

  res.send(product);
});

router.delete(`/:id`, (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product has been removed" });
      } else {
        return res.status(400).json({
          success: false,
          message: "The product is not available for removal",
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

router.get(`/get/count`, async (req, res) => {
  //calcular cantidad de products
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

module.exports = router;
