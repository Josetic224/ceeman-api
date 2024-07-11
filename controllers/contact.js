const { createContact } = require("../db/user.db");
const sendEmail1 = require("../utils/nodemailer2");
const { contactUserSchema } = require("../validations/user");


const contactUser = async(req, res) =>{
    try {
        const body = contactUserSchema.safeParse(req.body)
        if(!body.success){
            return res.status(400).json({
                errors:body.error.issues
            })
        }
       const create =  await createContact(body.data.name, body.data.email, body.data.request)

       const options = {
         email : body.data.email,
         subject : 'New Contact Form Submission',
         html : `
         <h1>New Contact Form Submission</h1>
         <p><strong>Name:</strong> ${body.data.name}</p>
         <p><strong>Email:</strong> ${body.data.email}</p>
         <p><strong>Message:</strong></p>
         <p>${body.data.request}</p>

         `
       }

       await sendEmail1(options)

       res.status(200).json("email sent successfully")
    } catch (error) {
      res.status(500).json(error)   
    }

}

module.exports = contactUser;