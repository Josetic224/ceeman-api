const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
dotenv.config();

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Profile:', profile); // Log profile for debugging

    let user = await prisma.user.findUnique({
      where: {
        googleId: profile.id,
      },
    });

    if (user) {
      const payload = { id: user.UserID };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      console.log('User already exists:', user);
      return done(null, { user, token });
    }

    user = await prisma.user.findUnique({
      where: {
        email: profile.emails[0].value,
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: {
          email: profile.emails[0].value,
        },
        data: {
          googleId: profile.id,
        },
      });

      const payload = { id: user.UserID };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      console.log('User updated with Google ID:', user);
      return done(null, { user, token });
    }

    const newUser = await prisma.user.create({
      data: {
        fullName: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        password: '',
        address: '',
        phone_Number: ''
      }
    });

    const payload = { id: newUser.UserID };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('New user created:', newUser);
    return done(null, { user: newUser, token });
  } catch (err) {
    console.error('Error:', err);
    return done(err, false);
  }
}));


passport.serializeUser((data, done) => {
  done(null, { id: data.user.UserID, token: data.token });
});

passport.deserializeUser(async (data, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { UserID: data.id }
    });
    user.token = data.token; // Attach the token to the user object
    done(null, user);
  } catch (err) {
    console.error('Error:', err);
    done(err, null);
  }
});
