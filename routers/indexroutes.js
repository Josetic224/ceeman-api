const express = require('express');

const signupRouter = require('./api/signup');
const loginRouter = require('./api/login');
const productRouter = require('./api/products')
const cartRouter = require('./api/cart')
const locationRouter = require('./api/location')
const orderRouter = require('./api/order')
const contactRouter = require('./api/contact')
const AgentRouter = require('./api/agent')



module.exports = function routes(app) {
    app.use(express.json());
  
    // Registration & authentication routes.
    app.use("/api", signupRouter);
    app.use("/api", loginRouter);
    app.use("/api", productRouter);
    app.use("/api", cartRouter );
    app.use("/api", locationRouter);
    app.use("/api", orderRouter);
    app.use("/api", contactRouter );
    app.use("/api", AgentRouter);
   
  };
  