const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const { connectToDatabase, prisma } = require('../db/user.db.js');
const googleRouter = require('../routers/api/router-google.js');
require('../config/passport-google.js');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: ".env" });

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (origin === "http://localhost:5173" || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser middleware
app.use(cookieParser());

// Express session setup
app.use(session({
  secret: process.env.session_Secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use((req, res, next) => {
  if (!req.cookies.sessionId) {
    const sessionId = uuidv4();
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  }
  next();
});

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.status(200).json("Welcome to my Homepage");
});

require("../routers/indexroutes.js")(app);
app.use(googleRouter);

// Start the application
async function startApp() {
  try {
    await connectToDatabase();
    const users = await prisma.user.findMany();
    console.log('users:', users);
  } catch (error) {
    console.error('Error starting the application:', error);
  } finally {
    await prisma.$disconnect();
  }
}

startApp();

// Server listening
const PORT = process.env.PORT || 3001; // Use 3001 as default if PORT is not set
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
