const express = require("express");
const router = express.Router();

const AWS = require("aws-sdk");
const crypto = require('crypto');


// Initialize AWS Cognito
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: "ap-south-1", // e.g., 'us-east-1'
});
const clientSecret = process.env.APP_CLIENT_SECRET;
// Function to generate SECRET_HASH


function generateSecretHash(username) {
  const clientId = process.env.AWS_CLIENT_ID;  // Your Cognito App Client ID
  const clientSecret = process.env.APP_CLIENT_SECRET;  // Your Cognito App Client Secret

  if (!clientId || !clientSecret) {
      throw new Error("Client ID or Client Secret is missing");
  }

  return crypto
      .createHmac("sha256", clientSecret)
      .update(username + clientId)
      .digest("base64");
}

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Step 1: Create user in Cognito
    const createUserParams = {
      UserPoolId: process.env.AWS_USERPOOL_ID,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
        { Name: "custom:role", Value: role || "policyholder" },
      ],
      MessageAction: "SUPPRESS", // Prevents Cognito from sending a temporary password email
    };

    cognito.adminCreateUser(createUserParams, async (err, data) => {
      if (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({ message: "User registration failed", error: err.message });
      }

      // Step 2: Set password as permanent
      const setPasswordParams = {
        UserPoolId: process.env.AWS_USERPOOL_ID,
        Username: email,
        Password: password,
        Permanent: true, // Removes FORCE_CHANGE_PASSWORD requirement
      };

      cognito.adminSetUserPassword(setPasswordParams, (passwordErr) => {
        if (passwordErr) {
          console.error("Error setting permanent password:", passwordErr);
          return res.status(500).json({ message: "Failed to set permanent password", error: passwordErr.message });
        }

        res.status(201).json({ message: "User registered successfully with a permanent password." });
      });
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const getUserParams = {
      UserPoolId: process.env.AWS_USERPOOL_ID,
      Username: email,
    };

    // Fetch user attributes from Cognito
    cognito.adminGetUser(getUserParams, (err, userData) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(400).json({ message: "User not found", error: err.message });
      }

      // Extract user attributes
      const userAttributes = {};
      userData.UserAttributes.forEach(attr => {
        userAttributes[attr.Name] = attr.Value;
      });

      const cognitoUsername = userData.Username;

      const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.AWS_CLIENT_ID,
        AuthParameters: {
          USERNAME: cognitoUsername,
          PASSWORD: password,
          SECRET_HASH: generateSecretHash(cognitoUsername),
        },
      };

      cognito.initiateAuth(params, (authErr, authData) => {
        if (authErr) {
          console.error("Login error:", authErr);
          return res.status(400).json({ message: "Login failed", error: authErr.message });
        }

        // Send user attributes along with the token
        res.status(200).json({
          message: "Login successful",
          token: authData.AuthenticationResult.IdToken,
          user: {
            email: userAttributes.email,
            name: userAttributes.name,
            role: userAttributes["custom:role"] || "policyholder",
          },
        });
      });
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
});



module.exports = router;
