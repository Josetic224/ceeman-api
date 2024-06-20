const express = require('express')
const router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const { isAdmin, isAuthenticated } = require('../../helpers/auth');
const { createProductController, viewProducts, viewProduct } = require('../../controllers/products');

router.post('/products/create' , isAuthenticated, isAdmin, upload.single("file"),createProductController
)
router.get('/products/view/', isAuthenticated, viewProducts)
router.get('/product/view/:productId', isAuthenticated, viewProduct)

module.exports = router

