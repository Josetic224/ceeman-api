// const express = require('express')

// exports.loginSuccess = (req,res)=>{
//     if(!req.isAuthenticated()){
//         return res.status(400).json({message:"unAuthorized"})
//     }
//     res.json({
//         message:"Authentication Successful",
//         user:req.user
//     })
// }

// exports.loginFailure = (req, res) => {
//     res.status(401).json({ message: 'Authentication failed' });
//   };
  
//   exports.logout = (req, res) => {
//     req.logout((err) => {
//       if (err) {
//         return res.status(500).json({ message: 'Logout failed', error: err });
//       }
//       res.json({ message: 'Logged out' });
//     });
//   };