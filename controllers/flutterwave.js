// const Flutterwave = require('flutterwave-node-v3');
// const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
// const 

// const initializePayment = async (req, res) => {
//   const { orderID } = req.body;
//   try {
//     const order = await prisma.orders.findUnique({
//       where: { OrderID: orderID },
//       include: { User: true },
//     });

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     const payload = {
//       tx_ref: orderID,
//       amount: order.total,
//       currency: 'NGN',
//       redirect_url: 'http://localhost:3000/verify-payment',
//       customer: {
//         email: order.User.email,
//         phonenumber: order.User.phone_Number,
//         name: order.User.fullName,
//       },
//     };

//     const response = await flw.Payment.init(payload);
//     res.status(200).json({ paymentLink: response.data.link });
//   } catch (error) {
//     console.error('Error initializing payment:', error);
//     res.status(500).json({ error: 'Failed to initialize payment' });
//   }
// };
