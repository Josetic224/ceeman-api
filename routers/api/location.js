const express = require('express')
const { getStateAndCities } = require('../../controllers/location')
const router = express.Router()


router.get('/state-cities/:id', getStateAndCities)

module.exports= router