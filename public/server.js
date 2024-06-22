const express = require('express');
const app = express();
const cors = require('cors')
const corsOptions = {
  origin:"http://localhost:3000" || "*",
  credentials:true,
  methods:["GET","POST", "PUT", "DELETE"],
  allowHeaders:[
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
};
const dotenv = require('dotenv')
dotenv.config({ path: ".env" });
const session = require('express-session');
const {connectToDatabase, prisma} = require('../db/user.db.js');
const passport = require('passport');
require('../config/passport-google')

const googleRouter = require('../routers/api/router-google.js')


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Express session
app.use(session({
  secret: "ggrhrururnrn",
  resave: false,
  saveUninitialized: false,
}));
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());



app.get("/", (req, res) =>{
  res.status(200).json("Welcome to my Homepage")
})
require("../routers/indexroutes.js")(app);
app.use(googleRouter)

async function startApp() {
  try {
      await connectToDatabase();
      // Proceed with your application logic after successful connection
      // For example:
      const user = await prisma.user.findMany();
      console.log('users:', user);
  } catch (error) {
      console.error('Error starting the application:', error);
  } finally {
      await prisma.$disconnect(); // Disconnect from the database when the application exits
  }
}

startApp();

const PORT = process.env.PORT
app.listen(PORT, ()=>{
  console.log(`server is running at ${PORT}`)
})

