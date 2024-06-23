const express = require('express')
const router = express.Router();
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
  const { isAdmin, isAuthenticated } = require('../../helpers/auth');
  const { createProductController, viewProducts, viewProduct } = require('../../controllers/products');
  
  router.post('/products/create', isAuthenticated, isAdmin, upload.array("files", 10), createProductController);
  
  module.exports = router;
  
router.get('/products/view/', isAuthenticated, viewProducts)
router.get('/product/view/:productId', isAuthenticated, viewProduct)

module.exports = router

