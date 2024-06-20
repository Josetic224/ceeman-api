const express = require('express')
const router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const { isAdmin, isAuthenticated } = require('../../helpers/auth');
const { newCart, increaseItemQuantity, removeItemsToCart } = require('../../controllers/cart');

router.post('/cart/add/:id' , isAuthenticated,newCart)
router.get('/carts/increase_item_quantity/:id', isAuthenticated, increaseItemQuantity)
router.get('/cart/decrease_item_quantity/:id', isAuthenticated, removeItemsToCart)