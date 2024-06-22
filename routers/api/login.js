const express = require('express')
const { logIn } = require('../../controllers/login')

const router = express.Router()

router.post('/login', logIn)

module.exports = router