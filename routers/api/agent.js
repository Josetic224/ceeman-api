const express = require('express')
const { createAgent } = require('../../controllers/agent')

const router = express.Router()

router.post('/becomeAgent', createAgent)

module.exports = router
