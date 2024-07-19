const express = require('express');

const signupRouter = require('./api/signup');
const productRouter = require('./api/products')
const cartRouter = require('./api/cart')
const locationRouter = require('./api/location')
const orderRouter = require('./api/order')
const contactRouter = require('./api/contact')
const AgentRouter = require('./api/agent');
const { loginLimiter, logIn } = require('../controllers/login');



module.exports = function routes(app) {
    app.use(express.json());
  
    // Registration & authentication routes.
    app.use("/api", signupRouter);
    app.use("/api", loginLimiter, logIn);
    app.use("/api", productRouter);
    app.use("/api", cartRouter );
    app.use("/api", locationRouter);
    app.use("/api", orderRouter);
    app.use("/api", contactRouter );
    app.use("/api", AgentRouter);
   
  };
  