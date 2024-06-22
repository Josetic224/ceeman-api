const express = require('express')
const router = express.Router();
const { isAdmin, isAuthenticated } = require('../../helpers/auth');
const { newCart, increase_Item_Quantity, decrease_item_quantity, viewCart } = require('../../controllers/cart');

router.post('/cart/:id/add' , isAuthenticated,newCart)
router.post('/carts/:id/increase', isAuthenticated, increase_Item_Quantity )
router.post('/cart/:id/decrease', isAuthenticated, decrease_item_quantity )

router.get('/cart/view', isAuthenticated, viewCart)

module.exports = router