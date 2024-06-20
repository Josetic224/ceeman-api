const {getUserByEmail, comparePassword, loginUser } = require('../db/user.db');
const { badRequest, formatServerError } = require('../helpers/error');
const {LoginUserSchema} = require('../validations/user')

exports.logIn = async(req, res) =>{
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
        return badRequest(res, "This Email does exists")
    }
     const signUser= await loginUser(email,password)

     return res.status(200).json({
        message:"user signed in SuccessFully",
        token : signUser
    }) ;

    } catch (error) {
        console.log(error)
        return formatServerError
    }
}

