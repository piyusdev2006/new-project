const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Product = require('../models/Product');

// @route   GET api/v1/products
// @desc    Get all products
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// @route   POST api/v1/products
// @desc    Add new product
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    authorize('admin'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('price', 'Price is required').isNumeric(),
    ],
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price } = req.body;

    try {
      const newProduct = new Product({
        name,
        description,
        price,
      });

      const product = await newProduct.save();

      res.json(product);
    } catch (err) {
      res.status(500);
      next(err);
    }
  }
);

// @route   PUT api/v1/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', [auth, authorize('admin')], async (req, res, next) => {
  const { name, description, price } = req.body;

  // Build product object
  const productFields = {};
  if (name) productFields.name = name;
  if (description) productFields.description = description;
  if (price) productFields.price = price;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// @route   DELETE api/v1/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    await Product.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Product removed' });
  } catch (err) {
    res.status(500);
    next(err);
  }
});

module.exports = router;
