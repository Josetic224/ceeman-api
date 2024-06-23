const {getUserByEmail, comparePassword, loginUser } = require('../db/user.db');
const {LoginUserSchema} = require('../validations/user')

const logIn = async(req, res) =>{
    const body = LoginUserSchema.safeParse(req.body)
    if(!body.success){
        return res.status(400).json({
            errors:body.error.issues,
        })
    }
    const {email, password} = body.data;
    console.log(body.data)
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
        console.log(error)
        return res.status(500).json({
            message:error.message
        })
    }
}


module.exports ={
    logIn
}