const { createAgent, getAgentById, getAllAgents, updateAgent } = require("../db/user.db");
const sendEmail = require("../utils/nodemailer");
const sendEmail1 = require("../utils/nodemailer2");

exports.createAgent = async (req, res) => {
    const { fullName, email, officeAddress, State, phoneNumber, WhyYouWantToBeACeeManAgent } = req.body;
  
    try {
      const newAgent = await createAgent({
        fullName,
        email,
        officeAddress,
        State,
        phoneNumber,
        WhyYouWantToBeACeeManAgent
      });
  
      // Send email to the company
      const companyEmailOptions = {
        email: newAgent.email,
        subject: 'I WANT TO BECOME A DISTRIBUTOR',
        html: `
          <h1>APPLICATION TO BE A CEEMAN DISTRIBUTOR</h1>
          <p><strong>Name:</strong> ${newAgent.fullName}</p>
          <p><strong>Email:</strong> ${newAgent.email}</p>
          <p><strong>State:</strong> ${newAgent.State}</p>
          <p><strong>Office Address:</strong> ${newAgent.officeAddress}</p>
          <p><strong>Phone Number:</strong> ${newAgent.phoneNumber}</p>
          <p><strong>Reasons:</strong> ${newAgent.WhyYouWantToBeACeeManAgent}</p>
        `
      };
  
      await sendEmail1(companyEmailOptions);
  
      // Send thank you email to the agent
      const thankYouEmailOptions = {
        email: newAgent.email,
        subject: 'Thank You for Your Interest in Becoming a Ceeman Distributor',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <div style="text-align: center; padding: 20px;">
              <img src="YOUR_LOGO_URL_HERE" alt="Company Logo" style="width: 150px;"/>
            </div>
            <div style="background-color: #0046a6; color: white; padding: 20px; text-align: center;">
              <h1>Thank You for Your Interest in Becoming a Ceeman Distributor</h1>
            </div>
            <div style="padding: 20px;">
              <p>Dear ${newAgent.fullName},</p>
              <p>Thank you for your interest in becoming a distributor for Ceeman. We have received your application and will review it shortly.</p>
              <p>We will get in touch with you soon to discuss the next steps.</p>
              <p>If you have any questions in the meantime, please feel free to contact us at [Company Contact Information].</p>
              <p>Best Regards,</p>
              <p>The Ceeman Team</p>
            </div>
          </div>
        `
      };
  
      await sendEmail(thankYouEmailOptions);
  
      res.status(201).json(newAgent);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the agent.' });
    }
  };
  

  exports.getAgentById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const agent = await getAgentById(id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found.' });
      }
      res.status(200).json(agent);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching the agent.' });
    }
  };

  // Get all agents
exports.getAllAgents = async (req, res) => {
    try {
      const agents = await getAllAgents();
      res.status(200).json(agents);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching agents.' });
    }
  };


  // Update an agent by ID
exports.updateAgent = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, officeAddress, State, phoneNumber, WhyYouWantToBeACeeManAgent } = req.body;
  
    try {
      const updatedAgent = await updateAgent(id, {
        fullName,
        email,
        officeAddress,
        State,
        phoneNumber,
        WhyYouWantToBeACeeManAgent
      });
      res.status(200).json(updatedAgent);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the agent.' });
    }
  };


  // Delete an agent by ID
exports.deleteAgent = async (req, res) => {
    const { id } = req.params;
  
    try {
      await agentService.deleteAgent(id);
      res.status(200).json({ message: 'Agent deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while deleting the agent.' });
    }
  };