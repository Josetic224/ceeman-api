const express = require('express');
const { isAuthenticated } = require('../../helpers/auth');
const { createOrder, confirmOrder } = require('../../controllers/order');

const router = express.Router();
router.post("/create-order", createOrder)
router.post("/webhooks/flutterwave", confirmOrder)

module.exports = router

