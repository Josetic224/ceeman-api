exports.loginSuccess = (req, res) => {
  if (req.isAuthenticated()) {
    const token = req.user.token;
    res.status(200).json({
      token: token,
      message: `Hello ${req.user.fullName}`
    });
  } else {
    res.redirect('/');
  }
};

exports.loginFailure = (req, res) => {
  res.status(401).json({ message: 'Authentication failed' });
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err });
    }
    res.json({ message: 'Logged out' });
  });
};
