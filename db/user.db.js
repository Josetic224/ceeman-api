const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const {hashSync, compareSync} = require('bcrypt')
dotenv.config({ path: ".env" });
const {sign} = require('jsonwebtoken')
const cloudinary = require('../helpers/cloudinary')
const { unAuthenticated } = require('../helpers/error');
const axios = require('axios')

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
          role:"user",
          googleId:null
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
  throw new Error("Invalid credentials")
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
    // Remove commas and currency symbol, if any, and convert to float
    const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));


    // Save the product to MongoDB using Prisma
    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        imageUrl,
        price: parseFloat(numericPrice.toFixed(2)), // Store price as float with 2 decimal places
        category,
      },
    });

    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// // Example usage
// createProduct('Product Name', 'Product Description', '₦1,200.50', 'Electronics', 'example.jpg')
//   .then(product => {
//     console.log('Product created:', product);
//   })
//   .catch(error => {
//     console.error('Error creating product:', error);
//   });

const getProduct = async (productId) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        ProductID: productId // Ensure this matches the correct field in your schema
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Format the price with the Naira symbol
    const formattedPrice = `₦${product.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

    return {
      ...product,
      price: formattedPrice // Overwrite the price field with the formatted price
    };
  } catch (error) {
    console.error('Error retrieving product:', error.message);
    throw new Error('No Product Found');
  }
};
const getProductWithoutFormat = async (productId) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        ProductID: productId // Ensure this matches the correct field in your schema
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }


    return {
    product
    };
  } catch (error) {
    console.error('Error retrieving product:', error.message);
    throw new Error('No Product Found');
  }
};



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
    console.error(error)
    throw new Error('Error Adding to Cart!')
  }
}

const viewCartItems = async(userId)=>{
  const cartItems = await prisma.cartItems.findMany({
    where:{UserID:userId},
    include:{Products:true}
  })
  return cartItems
}

const increaseCartItems = async (userId, cartItemId, amount) => {
  try {
    // Find the cart item by cartItemId
    let cartItem = await prisma.cartItems.findUnique({
      where: { CartItemID: cartItemId },
      include: { Products: true }
    });

    if (!cartItem || cartItem.UserID !== userId) {
      console.error(`Cart item with ID ${cartItemId} not found for user ${userId}`);
      throw new Error('Cart item not found');
    }

    // Increase the quantity and update unit price
    cartItem = await prisma.cartItems.update({
      where: { CartItemID: cartItem.CartItemID },
      data: {
        quantity: cartItem.quantity + amount,
        unitPrice: cartItem.Products.price * (cartItem.quantity + amount), // Adjust unit price based on new quantity
      },
    });

    // Return the updated cart item
    return cartItem;
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
};



const decreaseCartItems = async (userId, cartItemId, amount) => {
  try {
    // Find the cart item by cartItemId
    let cartItem = await prisma.cartItems.findUnique({
      where: { CartItemID: cartItemId },
      include: { Products: true }
    });

    if (!cartItem || cartItem.UserID !== userId) {
      console.error(`Cart item with ID ${cartItemId} not found for user ${userId}`);
      throw new Error('Cart item not found');
    }

    // Find the product to get its price
    const product = await prisma.products.findUnique({
      where: { ProductID: cartItem.ProductID },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate new quantity
    const newQuantity = cartItem.quantity - amount;
    let updatedCartItem;

    if (newQuantity > 0) {
      // Update the cart item with decreased quantity
      updatedCartItem = await prisma.cartItems.update({
        where: {
          CartItemID: cartItem.CartItemID,
        },
        data: {
          quantity: newQuantity,
          unitPrice: product.price * newQuantity, // Adjust unit price based on new quantity
        },
      });
    } else {
      // If new quantity is zero or less, delete the cart item
      await prisma.cartItems.delete({
        where: {
          CartItemID: cartItem.CartItemID,
        },
      });
      return { message: 'Item removed from cart' };
    }

    return updatedCartItem || { message: 'Item removed from cart' };
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
};


const deleteItemsInCart = async (userId, cartItemId) => {
  try {
    // Find the cart item by CartItemId
    const cartItem = await prisma.cartItems.findUnique({
      where: { CartItemID: cartItemId },
    });

    // If cart item is not found or doesn't belong to the user, throw an error
    if (!cartItem || cartItem.UserID !== userId) {
      console.error(`Cart item with ID ${cartItemId} not found for user ${userId}`);
      throw new Error('Cart item not found');
    }

    // Delete the cart item
    await prisma.cartItems.delete({
      where: {
        CartItemID: cartItemId,
      },
    });

    return { message: 'Item deleted from cart' };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete item from cart');
  }
};



const getTotalCartItems = async (userId) => {
  try {
    const totalItems = await prisma.cartItems.count({
      where: { UserID: userId }
    });

    return totalItems;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to retrieve total number of items');
  }
};

const getTotalAmountInCart = async (userId) => {
  try {
    // Find all cart items for the user
    const cartItems = await prisma.cartItems.findMany({
      where: { UserID: userId },
      include: { Products: true }, // Include Products to access price
    });

    if (!cartItems || cartItems.length === 0) {
      return 0; // If no items in cart, return 0
    }

    // Calculate total amount
    let totalAmount = 0;
    cartItems.forEach((cartItem) => {
      totalAmount += cartItem.quantity * cartItem.Products.price;
    });

    return totalAmount;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to calculate total amount in cart');
  }
};

const fetchStates = async () => {
  try {
    const response = await axios.get('https://api.facts.ng/v1/states');
    return response.data;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw new Error('Failed to fetch states');
  }
};

const fetchStateDetails = async (stateId) => {
  try {
    const response = await axios.get(`https://api.facts.ng/v1/states/${stateId}`);
    return response.data.lgas;
  } catch (error) {
    console.error(`Error fetching details for state ${stateId}:`, error);
    throw new Error('Failed to fetch state details');
  }
};


const getStatesWithCities = async () => {
  try {
    const states = await fetchStates();
    const statesWithCities = [];

    for (const state of states) {
      const cities = await fetchStateDetails(state.id);
      statesWithCities.push({
        state: state.name,
        id: state.id,
        cities
      });
    }

    return statesWithCities;
  } catch (error) {
    console.error('Error combining states and cities:', error);
    throw new Error('Failed to combine states and cities');
  }
};

   module.exports = {
    getStatesWithCities,
    getTotalCartItems,
    viewCartItems,
    uploadImageToCloudinary,
    loginUser,
    connectToDatabase,
    increaseCartItems,
    decreaseCartItems,
    createProduct,
    getProduct,
    getProductWithoutFormat,
    createCart,
    prisma,
    createUser,
    getUserByEmail,
    getUserById,
    deleteItemsInCart,
    getTotalAmountInCart
   }