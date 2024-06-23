const express = require('express')
const { getStates,  fetchStateLGA, userlocation } = require('../../controllers/location')
const {isAuthenticated} = require('../../helpers/auth')
const router = express.Router()


router.get('/states', getStates)
router.get('/states/:stateName/cities', fetchStateLGA)
router.post('/location/save', isAuthenticated,userlocation)

module.exports= router