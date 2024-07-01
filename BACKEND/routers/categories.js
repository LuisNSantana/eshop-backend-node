const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

//obtener categorias
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});
//obtener categoria especifica
router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res
      .status(500)
      .json({ message: "The category with the given ID was not found. " });
  }
  res.status(200).send(category);
});
//crer categoria
router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) {
    return res.status(400).send("The category cannot be created");
  }
  res.send(category);
});
//delete categorY
router.delete(`/:id`, (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "The category has been removed" });
      } else {
        return res.status(400).json({
          success: false,
          message: "The category is not available for removal",
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
//update category
router.put(`/:id`, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  },
  {
    new:true,
  }
  );

  if (!category) {
    return res.status(400).send("The category cannot be updated");
  }
  res.status(200).send(category);
});

module.exports = router;
