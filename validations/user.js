const z  = require('zod');

const userSchema = z.object({
  fullName: z.string({
    required_error: "Your Fullname is required"
  }).min(2, "Fullname is too Short"),

  email: z.string({
    required_error: "Your Email is required"
  }).email("Your Email is Invalid"),

  password: z.string({
    required_error: "Password is required"
  }).min(8, "Password must be 8 or more characters long"),

  confirmPassword: z.string({
    required_error: "Confirm Password is required"
  }).min(8, "Confirm Password must be 8 or more characters long"),
})
.strict()
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

module.exports = userSchema;


const LoginUserSchema = z.object({
    email: z.string({
      required_error: "Email is required",
    }).email("Invalid email"),
    password: z.string({
      required_error: "Password is required",
    }),
})
.strict();


module.exports = {
    userSchema,
    LoginUserSchema
}
