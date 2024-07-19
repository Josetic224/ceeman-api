const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Function to send email
const sendEmail = async (options) => {
    try {
        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // Define mail options
        let mailOptions = {
            from: process.env.EMAIL,
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        // Send the email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
};

module.exports = sendEmail;
