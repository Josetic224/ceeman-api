// const  {PrismaClient} = require('@prisma/client')
// const passport = require('passport');
// const FacebookStrategy = require('passport-facebook').Strategy;
// const dotenv = require('dotenv');

// const prisma = new PrismaClient()
// dotenv.config();



// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: process.env.CALLBACK_URL,
//   profileFields: ['id', 'displayName', 'photos', 'email', 'name']
// },
// async (accessToken, refreshToken, profile, done) => {
//   try {
//     console.log('Profile:', profile);  // Log profile for debugging
//     let customer = await prisma.customer.findUnique({
//       where: { email: profile.emails[0].value },
//     });

//     if (!customer) {
//       customer = await prisma.customer.create({
//         data: {
//           fullName: profile.displayName,
//           email: profile.emails[0].value,
//           password: '', // You should handle password management securely
//           address: '',
//           phone_Number: ''
//         },
//       });
//     }

//     return done(null, customer);
//   } catch (err) {
//     console.error('Error:', err);  // Log error for debugging
//     return done(err, false);
//   }
// }));

// passport.serializeUser((user, done) => {
//   done(null, user.CustomerID);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await prisma.customer.findUnique({
//       where: { CustomerID: id },
//     });
//     done(null, user);
//   } catch (err) {
//     console.error('Error:', err);  // Log error for debugging
//     done(err, null);
//   }
// });
