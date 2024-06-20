const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../../controllers/google');

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  })

router.get('/profile', authController.loginSuccess);
router.get('/fail', authController.loginFailure);
router.get('/logout', authController.logout);

module.exports = router;
