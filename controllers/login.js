const {getUserByEmail, comparePassword, loginUser } = require('../db/user.db');
const {LoginUserSchema} = require('../validations/user')
const rateLimit = require('express-rate-limit')



exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts from this IP, please try again later.',
    handler: (req, res) => {
        res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
    },
});

exports.logIn = async(req, res) =>{
    const body = LoginUserSchema.safeParse(req.body)
    if(!body.success){
        return res.status(400).json({
            errors:body.error.issues,
        })
    }
    const {email, password} = body.data;
    try {
    let existingUser =  await getUserByEmail(email)
     
    if(!existingUser){
        return res.status(401)("This Email does exists")
    }
     const signUser= await loginUser(email,password)
     return res.status(200).json({
        message:"user signed in SuccessFully",
        token : signUser
    }) ;

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}


