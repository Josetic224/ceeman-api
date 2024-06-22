const { getStatesWithCities } = require("../db/user.db");

const getStateAndCities = async(req, res)=>{
    try {
        const statesWithCities = await getStatesWithCities();
        res.status(200).json(statesWithCities);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch states and cities' });
      }
}

module.exports={
    getStateAndCities
}


