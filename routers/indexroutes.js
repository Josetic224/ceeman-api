const express = require('express');

const signupRouter = require('./api/signup');
const loginRouter = require('./api/login');
const productRouter = require('./api/products')


module.exports = function routes(app) {
    app.use(express.json());
  
    // Registration & authentication routes.
    app.use("/api", signupRouter);
    app.use("/api", loginRouter);
    app.use("/api", productRouter)
  
   
  };
  