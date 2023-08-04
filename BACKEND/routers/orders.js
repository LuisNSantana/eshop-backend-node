const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const { Product } = require("../models/product");
const router = express.Router();
const stripe = require('stripe')('sk_test_51NZreOFLHvHQ6Qtbf1tB3FweyOUeuNKuOuRGseztAm1fVNQrHVTN1DCNk36rKE7LMHnFth7zU7EgfTySZH9wj2eW00Jwnf11AC')

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    //ordenar por el mas reciente al ultimo
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//order especifica
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", ["name", "email"])
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    //ordenar por el mas reciente al ultimo
    .sort({ dateOrdered: -1 });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});
//create order

router.post(`/`, async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;
  //console.log(orderItemsIdsResolved);

  //caluclando el precio total 
  const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
    const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
    const totalPrice = orderItem.product.price * orderItem.quantity;

    return totalPrice
  }))

  //sumar los valores del array
  const totalPrice = totalPrices.reduce((a,b) => a + b, 0);

  console.log(totalPrice);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    return res.status(400).send("The order cannot be created");
  }
  res.send(order);
});

//checkout session

router.post(`/checkout-session`, async (req, res) => {
  const orderItems = req.body;
  if(!orderItems) return res.status(400).send('No order items')
  const lineItems = await Promise.all(
    orderItems.map(async (orderItem) => {
      const product = await Product.findById(orderItem.product);
      const price = product.price;
      const lineItem = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
          },
          unit_amount: price * 100,
        },
        quantity: orderItem.quantity,
      };
      return lineItem;
    })
  );
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: 'http://localhost:4200/success',
    cancel_url: 'http://localhost:4200/error',
  });
  res.json({id: session.id});

});
  

//update order

router.put(`/:id`, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );

  if (!order) {
    return res.status(400).send("The order cannot be updated");
  }
  res.status(200).send(order);
});
//DELETE order
router.delete(`/:id`, (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async order => {
      if (order) {
        await order.orderItems.map(async orderItem => {
            await OrderItem.findByIdAndRemove(orderItem);
        })
        return res
          .status(200)
          .json({ success: true, message: "The order has been removed" });
      } else {
        return res.status(404).json({
          success: false,
          message: "The order is not available for removal",
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

router.get('/get/totalsales', async(req, res) => {
  const totalSales = await Order.aggregate([
    {$group: {_id:null, totalsales: {$sum : '$totalPrice'}}},
  ])

  if (!totalSales) {

    return res.status(404).json({message:' The order cant be generated'})
    
  }
  res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) => {
  //calcular cantidad de products
  const orderCount = await Order.countDocuments()

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount
  });
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({user: req.params.userid})
  .populate({
    path: "orderItems",
    populate: {
      path: "product",
      populate: "category",
    },
  })
    //ordenar por el mas reciente al ultimo
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
