const { PrismaClient } = require("@prisma/client");
const { uploadImageToCloudinary, createProduct, getProducts, getUserById, getProduct } = require("../db/user.db");
const { formatServerError, unAuthorized, badRequest } = require("../helpers/error");
const prisma = new PrismaClient


const createProductController = async (req, res) => {
  const userId = req.user.id
    const { name, description, price, category } = req.body;
  console.log(req.body);
    
    const { file } = req; // Access the uploaded file
  
    try {

      const imageUrl = await uploadImageToCloudinary(file);
      console.log(imageUrl);
      const newProduct = await createProduct(name, description, price, category, imageUrl);
      console.log(newProduct);
      const numericPrice = parseFloat(price.replace(/,/g, ''));

      // Format the numeric price with 2 decimal places and add thousand separators
      const formattedPrice = `₦${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
      
  
      // Add formatted price to the newProduct object
      const productWithFormattedPrice = {
        ...newProduct,
        price: formattedPrice // Update the price field to the formatted price
      };
  
      res.status(201).json(productWithFormattedPrice);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  };
  


  const viewProducts = async (req, res) => {
    const userId = req.user.id
  
    try {
      const products = await prisma.products.findMany();
  
      return res.status(200).json(products);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Server error" });
    }
  };
  
  const viewProduct = async(req, res)=>{
    const userId = req.user.id
    const productId = req.params.productId
    try {
      const product = await getProduct(productId)

      res.status(200).json({
        product
      })
console.log(product)
    } catch (error) {
      return badRequest
    }
  }
  

  module.exports = {
    createProductController,
    viewProducts,
    viewProduct
  };