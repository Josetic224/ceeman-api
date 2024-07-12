const {PrismaClient} = require('@prisma/client')
const axios = require('axios')
const prisma = new PrismaClient()
const dotenv = require('dotenv')
dotenv.config({path: ".env"})


exports.createOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { UserID: userId },
      include: { location: true }
    });

    // Fetch cart items for the user
    const cartItems = await prisma.cartItems.findMany({
      where: { UserID: userId },
      include: { Products: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // Create the order
    const order = await prisma.orders.create({
      data: {
        UserID: userId,
        orderDate: new Date(),
        total: BigInt(totalAmount),
        status: 'pending',
        orderItems: {
          create: cartItems.map(item => ({
            ProductID: item.ProductID,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      }
    });

    // Prepare payment data
    const paymentData = {
      tx_ref: `order-${order.OrderID}`,
      amount: totalAmount.toString(),
      currency: "NGN",
      redirect_url: "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
      meta: {
        consumer_id: user.UserID,
        order_id: order.OrderID
      },
      customer: {
        email: user.email,
        phonenumber: user.location[0]?.phone_Number,
        name: user.fullName
      },
      customizations: {
        title: "Royal-Ceeman Generators",
        logo: "https://res.cloudinary.com/doo97eq6b/image/upload/v1720138901/products/gcwykomlc3pmncnbtd6m.jpg"
      }
    };

    // Call Flutterwave API to initiate payment
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Clear the user's cart after order creation
    await prisma.cartItems.deleteMany({
      where: { UserID: userId }
    });

    // Return the response from Flutterwave API
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while creating the order.' });
  }
};


exports.confirmOrder = async(req, res)=>{
  const payload = req.body
  const signature = req.headers['verif-hash']

  try {
    if(!signature || signature !== process.env.FLW_WEBHOOK_SECRET ){
      res.status(401).send('unAthorized');  
    }
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const transactionId = payload.data.tx_ref;
  
      await prisma.orders.update({
        where: { OrderID: transactionId.split('-')[1] },
        data: { status: 'completed' }
      });
  
      res.status(200).send('Webhook received successfully');
  } else {
    res.status(400).send('Event not handled');
  }
  } catch (error) {
    console.error(error);
    res.status(500).json("server error")
  }
  
}
