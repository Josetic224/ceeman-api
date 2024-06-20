// const express = require('express');
// const passport = require('passport')
// const fbController = require('../controllers/facebook.js')

// const router = express.Router()

// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// router.get('/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/auth/fail' }),
//   (req, res) => {
//     res.redirect('/auth/success');
//   });

//   router.get('/success', fbController.loginSuccess);
// router.get('/fail', fbController.loginFailure);
// router.get('/fail', fbController.logout)

// module.exports = router