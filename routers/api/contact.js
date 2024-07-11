const express = require('express')
const contactUser = require('../../controllers/contact')
const router = express.Router()


router.post('/contact_us', contactUser)

module.exports = router;