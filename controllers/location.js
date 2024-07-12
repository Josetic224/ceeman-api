// const { getStatesWithCities } = require("../db/user.db");
const dotenv = require('dotenv')
dotenv.config({ path: ".env" });
const Country = require('naija-state-local-government');
const { saveLocation } = require('../db/user.db');



const getStates = async(req, res)=>{

  try {
 const viewStates = Country.states()
res.status(200).json(viewStates)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch state details' });
  }
}



const fetchStateLGA = async (req, res) => {
  const stateName = req.params.stateName; // Assuming the parameter is stateName

  try {
    const viewLga = Country.lgas(stateName); // Fetch LGAs for the stateName
    if (!viewLga) {
      throw new Error('LGAs not found'); // Handle case where LGAs are not found
    }

    res.status(200).json(viewLga.lgas); // Send LGAs as JSON response
  } catch (error) {
    console.error('Error fetching state LGAs:', error);
    res.status(500).json({ error: 'Failed to fetch state LGAs' });
  }
};

const userlocation = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const sessionId = req.cookies.sessionId;
  const { state, city, address, phone_Number } = req.body;
  
  try {
    const userLocation = await saveLocation(userId || sessionId, state, city, address, phone_Number);
    res.status(200).json({
      message: "Location Saved Successfully",
      userLocation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
module.exports={
    getStates,
    fetchStateLGA,
    userlocation
}



