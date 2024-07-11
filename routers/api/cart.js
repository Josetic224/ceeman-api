const express = require('express')
const router = express.Router();
const { isAdmin, isAuthenticated } = require('../../helpers/auth');
const { newCart, increase_Item_Quantity, decrease_item_quantity, viewCart, delete_cart_item, get_total_amount_in_cart, getTotalCartItems, totalNumberOfCartItems } = require('../../controllers/cart');

router.post('/cart/:id/add' , newCart)
router.post('/cart/:id/increase', increase_Item_Quantity )
router.post('/cart/:id/decrease', decrease_item_quantity )
router.delete('/cart/:id/delete', delete_cart_item)

router.get('/cart/view',viewCart)
router.get('/cart/totalAmount', get_total_amount_in_cart)

router.get('/cart/items/total_No',totalNumberOfCartItems)
module.exports = router