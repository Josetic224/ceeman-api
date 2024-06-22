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
     
  
    
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  };
  

  const viewProducts = async (req, res) => {
    try {
      const products = await prisma.products.findMany();
  
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
  
      // Format the prices for all products
      const formattedProducts = products.map(product => {
        if (typeof product.price !== 'number') {
          console.error('Invalid price format for product:', product.id);
          return {
            ...product,
            price: 'Invalid price format'
          };
        }
  
        // Format the price with the Naira symbol
        const formattedPrice = `₦${product.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  
        return {
          ...product,
          price: formattedPrice, // Overwrite the price field with the formatted price
        };
      });
  
      return res.status(200).json(formattedProducts);
    } catch (error) {
      console.error('Error retrieving products:', error.message);
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