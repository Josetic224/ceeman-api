const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const dotenv = require('dotenv')
dotenv.config({ path: ".env" });
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
// const createOrder = async (req, res) => {
//   const userId = req.user.id;

//   try {
//     // Get cart items for the user
//     const cartItems = await prisma.cartItems.findMany({
//       where: { UserID: userId },
//       include: { Products: true },
//     });

//     if (cartItems.length === 0) {
//       return res.status(400).json({ error: 'No items in cart' });
//     }

//     // Calculate total order amount
//     const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.Products.price), 0);

//     // Format total with Naira symbol
//     const formattedTotal = `₦${total.toFixed(2)}`;

//     // Create an order
//     const order = await prisma.orders.create({
//       data: {
//         UserID: userId,
//         orderDate: new Date(),
//         total: total, // Store the numeric value in the database
//         status: 'pending',
//         orderItems: {
//           create: cartItems.map(item => ({
//             ProductID: item.ProductID,
//             quantity: item.quantity,
//             unitPrice: item.Products.price,
//           })),
//         },
//       },
//     });

//     // Clear cart items
//     await prisma.cartItems.deleteMany({
//       where: { UserID: userId },
//     });

//     // Format order items with Naira symbol
//     const formattedOrderItems = order.orderItems.map(item => ({
//       ...item,
//       formattedUnitPrice: `₦${item.unitPrice.toFixed(2)}`,
//     }));

//     res.status(201).json({
//       message: 'Order created successfully',
//       order: {
//         ...order,
//         formattedTotal, // Add the formatted total to the response
//         orderItems: formattedOrderItems, // Add the formatted order items to the response
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

const createOrder = async (req, res) => {
    const userId = req.user.id;
  
    try {
      // Get cart items for the user
      const cartItems = await prisma.cartItems.findMany({
        where: { UserID: userId },
        include: { Products: true },
      });
  
      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'No items in cart' });
      }
  
      // Calculate total order amount
      const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.Products.price), 0);
  
      // Create an order
      const order = await prisma.orders.create({
        data: {
          UserID: userId,
          orderDate: new Date(),
          total: total, // Store the numeric value in the database
          status: 'pending',
          orderItems: {
            create: cartItems.map(item => ({
              ProductID: item.ProductID,
              quantity: item.quantity,
              unitPrice: item.Products.price,
            })),
          },
        },
      });
  
      // Clear cart items
      await prisma.cartItems.deleteMany({
        where: { UserID: userId },
      });
  
      // Initialize payment with Flutterwave
      const paymentResponse = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: order.OrderID,
          amount: total,
          currency: 'NGN',
          redirect_url: 'http://localhost:3000/api/payment/callback',
          customer: {
            email: req.user.email, // Assuming you have user's email in the user object
          },
        },
        {
          headers: {
            Authorization: `Bearer ${FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Send the payment initialization response back to the client
      res.status(201).json({
        message: 'Order created successfully',
        order,
        payment: paymentResponse.data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  module.exports = {
    createOrder,
  };

