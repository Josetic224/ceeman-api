const express = require('express');
const { isAuthenticated } = require('../../helpers/auth');
const { createOrder, confirmOrder, orderSuccess } = require('../../controllers/order');

const router = express.Router();
router.post("/success", isAuthenticated, orderSuccess);
router.post("/create-order", isAuthenticated, createOrder);
router.post("/webhooks/flutterwave", isAuthenticated, confirmOrder);

module.exports = router

