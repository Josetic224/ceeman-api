const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const {hashSync, compareSync} = require('bcrypt')
dotenv.config({ path: ".env" });
const {sign} = require('jsonwebtoken')
const cloudinary = require('../helpers/cloudinary')
const { unAuthenticated } = require('../helpers/error');

const prisma = new PrismaClient();

async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        // Retry mechanism
        console.log('Retrying connection...');
        await retryConnection(3); // Retry 3 times
    }
  }

  module.exports = { connectToDatabase, prisma };
  async function retryConnection(retries) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            console.log('Connected to the database');
            return; // Connection successful, exit retry loop
        } catch (error) {
            console.error('Error connecting to the database:', error.message);
            if (i < retries - 1) {
                // Delay before retrying
                const delay = Math.pow(2, i) * 1000; // Exponential backoff
                console.log(`Retrying in ${delay} milliseconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error('Unable to connect to the database after retrying');
}


//Get User By ID

const getUserById = async (userId) =>{
    try {
       const user = prisma.user.findUnique({
        where:{UserID : userId}
       }) 
    } catch (error) {
        throw new Error("Failed to Fetch User by Id")
    }
}
getUserByGoogleId = async(googleId)=>{
  try {
    
    const user = prisma.user.findUnique({
      where:{googleId:googleId}
    })
  } catch (error) {
    throw new Error("failed to find user by googleId")
  }
}

const getUserByEmail =  async (email) =>
  await prisma.user.findUnique({ where: { email:email} });

  const createUser = async (fullName, email, password) => {
    try {
      const hashedPassword = await hashSync(password, 10); // Hash the password securely
  
      // Create new user in the database
      const newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword, // Store hashed password in the database
          address: '',
          phone_Number:'',
          role:"user"
        }
      });
  
      return { newUser }; // Return both newUser object and token
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user.');
    } finally {
      await prisma.$disconnect(); // Disconnect from the database after operation
    }
  };

  const loginUser = async (email, password) => {

    const user = await getUserByEmail(email)

if(!user || !compareSync(password, user.password)){
  return unAuthenticated(res, "Invalid credentials")
}
const jwtSecret = process.env.JWT_SECRET
const token = sign({id:user.UserID, role:user.role}, jwtSecret, {expiresIn:'1h'})
    return token ;
  };
  

// upload product to cloudinary

const uploadImageToCloudinary = async (file) => {

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "products"
    });

    return result.secure_url;
  } catch (error) {
    console.error(error)
    throw new Error("Failed to upload image to Cloudinary");
  }
};
 // create a Product


 const createProduct = async (name, description, price, category, imageUrl) => {
  try {
    // Create product in the database
    const newProduct = await prisma.products.create({
      data: {
        name:name,
        description:description,
        imageUrl:imageUrl,
        price: parseFloat(price),
        category,
      },

    });

    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
};

 const getProduct = async (productId) => {
  try {
    
     const product = await prisma.products.findUnique({
      where:{
        ProductID:productId
      }
    });
    return product;
  } catch (error) {
    throw new error("No Products Found")
  }
}


const createCart = async (userId, productId, quantity, unitPrice)=>{
  try {
    const newCartItem = await prisma.cartItems.create({
      data:{
        UserID:userId,
        ProductID:productId,
        quantity:quantity,
        unitPrice:unitPrice
      }
    })
    return newCartItem
  } catch (error) {
    throw new Error('Error Adding to Cart!')
  }
}

const increaseCartItems = async ( userId, productId, amount ) => {

  try {
      // Find the product to get its price
      const product = await prisma.products.findUnique({
          where: { ProductID: productId },
      });

      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }

      // Find the cart item for the user and product
      let cartItem = await prisma.cartItems.findUnique({
          where: {
              UserID_ProductID: {
                  UserID: userId,
                  ProductID: productId,
              },
          },
      });

      // If the item exists in the cart, update the quantity and unit price
      if (cartItem) {
          cartItem = await prisma.cartItems.update({
              where: {
                  CartItemID: cartItem.CartItemID,
              },
              data: {
                  quantity: cartItem.quantity + amount,
                  unitPrice: cartItem.unitPrice + (product.price * amount),
              },
          });
      } else {
          // If the item does not exist in the cart, add it to the cart
          cartItem = await prisma.cartItems.create({
              data: {
                  UserID: userId,
                  ProductID: productId,
                  quantity: amount,
                  unitPrice: product.price * amount,
              },
          });
      }
 return increaseCartItems;
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};


const decreaseCartItems = async ( userId, productId, amount ) => {
  try {
      // Find the cart item for the user and product
      let cartItem = await prisma.cartItems.findUnique({
          where: {
              UserID_ProductID: {
                  UserID: userId,
                  ProductID: productId,
              },
          },
      });

      if (!cartItem) {
          return res.status(404).json({ error: 'Item not found in cart' });
      }

      // Find the product to get its price
      const product = await prisma.products.findUnique({
          where: { ProductID: productId },
      });

      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }

      // Decrease quantity or remove item if quantity becomes zero
      if (cartItem.quantity > amount) {
          cartItem = await prisma.cartItems.update({
              where: {
                  CartItemID: cartItem.CartItemID,
              },
              data: {
                  quantity: cartItem.quantity - amount,
                  unitPrice: cartItem.unitPrice - (product.price * amount),
              },
          });
      } else {
          await prisma.cartItems.delete({
              where: {
                  CartItemID: cartItem.CartItemID,
              },
          });
      }

   return decreaseCartItems;
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};


   module.exports = {
    uploadImageToCloudinary,
    loginUser,
    connectToDatabase,
    increaseCartItems,
    decreaseCartItems,
    createProduct,
    getProduct,
    createCart,
    prisma,
    createUser,
    getUserByEmail,
    getUserById
   }