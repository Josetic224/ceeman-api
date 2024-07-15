const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const passport = require('passport');
const { connectToDatabase, prisma } = require('../db/user.db.js');
const googleRouter = require('../routers/api/router-google.js');
require('../config/passport-google.js');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: ".env" });

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://ceee-man.vercel.app",
      "https://royalceeman.com"
    ];
    
    console.log("Origin:", origin); // Log the origin of the incoming request
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
    "X-Requested-With"
  ],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser middleware
app.use(cookieParser());

// Express session setup
app.use(session({
  secret: process.env.session_Secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
  store: new MemoryStore({
    checkPeriod: 86400000 // Clear expired sessions daily
  })
}));

app.use((req, res, next) => {
  if (!req.cookies.sessionId) {
    const sessionId = uuidv4();
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  }
  next();
});

// Endpoint to clear session and cookie
app.get('/clear-session-cookie', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Failed to clear session and cookie');
    } else {
      res.clearCookie('sessionId');
      res.send('Session and cookie cleared successfully');
    }
  });
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
