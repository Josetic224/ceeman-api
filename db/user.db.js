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

       if(!user){
        throw new Error("User not Found!")
       }
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


  const createUser = async (fullName, email, password, sessionId, googleId= null) => {
    try {
      const hashedPassword = hashSync(password, 10); // Hash the password securely
  
      // Prepare the data object
      const userData = {
        
        fullName,
        email,
        password: hashedPassword, // Store hashed password in the database
        role: "user",
        googleId: googleId, // Ensure googleId is null if not provided
      };
      console.log(userData)
  
      // Create new user in the database
      const newUser = await prisma.user.create({
        data: userData,
      });
  
      const userId = newUser.UserID;

      await prisma.cartItems.updateMany({
        where:{UserID:sessionId},
        data:{UserID:userId}
      })

      await prisma.location.updateMany({
        where:{UserID:sessionId},
        data:{
          UserID:userId
        }
      })
      // await prisma.orderItems.updateMany({
      //   where:{UserID:sessionId},
      //   data:{
      //     UserID:userId
      //   }
      // })
      // await prisma.orders.updateMany({
      //   where:{UserID:sessionId},
      //   data:{
      //     UserID:userId
      //   }
      // })

      return newUser; // Return the newUser object
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
const token = sign({id:user.UserID, role:user.role}, jwtSecret, {expiresIn:'7d'})
    return token ;
  };
  

// upload product to cloudinary

// Cloudinary upload function
const uploadImageToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products"
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

//create a Product
const createProduct = async (name, description, Features, IdealFor,  price, imageUrls) => {
  try {
    // Remove commas and currency symbol, if any, and convert to float
    const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));

    // Save the product to MongoDB using Prisma
    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        Features,
        IdealFor,
        imageUrl: imageUrls, // Ensure this is an array of strings
        price: parseFloat(numericPrice.toFixed(2)), // Store price as float with 2 decimal places
      },
    });

    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error.message);
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
        ProductID: productId,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  } catch (error) {
    console.error('Error retrieving product:', error.message);
    throw new Error('No Product Found');
  }
};




const standardizeImageUrl = (product) => {
  if (typeof product.imageUrl === 'string') {
    try {
      const parsed = JSON.parse(product.imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        product.imageUrl = parsed[0];  // Use the first URL in the array
      }
    } catch (e) {
      // If JSON.parse fails, leave product.imageUrl as is (it's a valid string)
    }
  } else if (Array.isArray(product.imageUrl) && product.imageUrl.length > 0) {
    product.imageUrl = product.imageUrl[0];  // Use the first URL in the array
  }
  return product;
};

const parsePrice = (priceString) => {
  // Remove currency symbol and commas, then convert to float
  return parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
};


const createOrUpdateCart = async (userIdOrSessionId, productId, quantity, unitPrice) => {
  try {
    const parsedUnitPrice = parsePrice(unitPrice);

    const existingCartItem = await prisma.cartItems.findUnique({
      where: {
        UserID_ProductID: { UserID: userIdOrSessionId, ProductID: productId },
      }
    });

    if (existingCartItem) {
      const updatedCartItem = await prisma.cartItems.update({
        where: {
          UserID_ProductID: { UserID: userIdOrSessionId, ProductID: productId },
        },
        data: {
          quantity: { increment: quantity }
        }
      });
      return updatedCartItem;
    } else {
      const newCartItem = await prisma.cartItems.create({
        data: {
          UserID: userIdOrSessionId,
          ProductID: productId,
          quantity: quantity,
          unitPrice: parsedUnitPrice
        }
      });
      return newCartItem;
    }
  } catch (error) {
    console.error(error)
    throw new Error('Error adding to cart!');
  }
};







const viewCartItems = async (userIdOrSessionId) => {
  const cartItems = await prisma.cartItems.findMany({
    where: {
      UserID: userIdOrSessionId
    },
    include: {
      Products: true
    }
  });

  return cartItems;
};



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
        unitPrice: cartItem.unitPrice // Adjust unit price based on new quantity
      },
    });

    // Return the updated cart item
    return cartItem;
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
};


const decreaseCartItems = async (userIdOrSessionId, cartItemId, amount) => {
  try {
    // Find the cart item by cartItemId
    let cartItem = await prisma.cartItems.findUnique({
      where: { CartItemID: cartItemId },
      include: { Products: true }
    });

    if (!cartItem || cartItem.UserID !== userIdOrSessionId) {
      console.error(`Cart item with ID ${cartItemId} not found for user or session ${userIdOrSessionId}`);
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
          unitPrice: cartItem.unitPrice, // Adjust unit price based on new quantity
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
    const deleteItems = await prisma.cartItems.delete({
      where: {
        CartItemID: cartItemId,
      },
    });

    return  deleteItems;
  } catch (error) {
    console.error(error.message);
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
      where: {UserID : userId}
    });

    if (!cartItems || cartItems.length === 0) {
      return 0; // If no items in cart, return 0
    }

    // Calculate total amount
 let totalAmount;
    cartItems.forEach((cartItem) => {
      totalAmount = cartItem.quantity + cartItem.unitPrice;
    });

    return totalAmount;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to calculate total amount in cart');
  }
};


const saveLocation = async (userId, state, city, address, phone_Number) => {
  try {
    // const data = {
    //   state,
    //   city,
    //   address,
    //   phone_Number: phone_Number,
    //   SessionId: sessionId || undefined, // Ensure to only include sessionId if present
    // };

    const location = await prisma.location.create({
      data:{
        UserID:userId,
        state:state,
        city:city,
        address:address,
        phone_Number:phone_Number
      }
    });

    return location;
  } catch (error) {
    console.error('Error saving location:', error);
    throw new Error('Failed to save location');
  }
};

const createContact = async (name, email, request)=>{
  try {
    const contact = prisma.contact.create({
      data:{
        name:name,
        email:email,
        request:request
      }
    })
    return contact;
  } catch (error) {
    throw new Error("failed to create Contact ", error)
  }
}

const createAgent = async(data)=>{
  try {
    return await prisma.agent.create({data})
  } catch (error) {
    throw new Error("failed to create Agent")
  }
}

const getAgentById = async (id) => {
  return await prisma.agent.findUnique({
    where: { AgentID: id }
  });
};


exports.getAllAgents = async () => {
  return await prisma.agent.findMany();
};


exports.updateAgent = async (id, data) => {
  return await prisma.agent.update({
    where: { AgentID: id },
    data
  });
};



exports.deleteAgent = async (id) => {
  return await prisma.agent.delete({
    where: { AgentID: id }
  });
};

   module.exports = {
    getAgentById,
    createAgent,
    createContact,
    saveLocation,
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
    createOrUpdateCart,
    prisma,
    createUser,
    getUserByEmail,
    getUserById,
    deleteItemsInCart,
    getTotalAmountInCart,
   }