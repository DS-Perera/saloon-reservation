const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
const port = 5011;

// Middleware
app.use(cors());
app.use(express.json());

// File path
const filePath = path.join(__dirname, "saloons.js");

// Check if file exists; if not, create it
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(
    filePath,
    "const saloons = [];\n\nmodule.exports = saloons;"
  );
}

// Import saloons array
let saloons = require("./saloons");

// Create Saloon API
app.post("/createSaloon", (req, res) => {
  const { saloonName, email, contact, password } = req.body;

  if (!saloonName || !email || !contact || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const saloonId = `SAL-${Date.now()}`; // Generate unique saloonId
  const newSaloon = {
    saloonId,
    saloonName,
    email,
    contact,
    password,
    status: "Live", // Default status
  };

  // Push the new saloon
  saloons.push(newSaloon);

  // Write updated saloons to file
  const fileContent = `const saloons = ${JSON.stringify(
    saloons,
    null,
    2
  )};\n\nmodule.exports = saloons;`;
  fs.writeFileSync(filePath, fileContent);

  res.status(201).json({ message: "Saloon created successfully!", newSaloon });
});

// Root API
app.get("/", (req, res) => {
  res.send("Welcome to the Saloon API!");
});

// View All Saloons API
app.get("/viewAllSaloons", (req, res) => {
  try {
    if (Array.isArray(saloons) && saloons.length > 0) {
      res.status(200).json(saloons);
    } else {
      res.status(200).json({ message: "No saloons found." });
    }
  } catch (error) {
    console.error("Error fetching saloons:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Edit Saloon API
app.put("/editSaloon/:id", (req, res) => {
  const { id } = req.params;
  const { saloonName, email, contact, password, status } = req.body;

  if (!saloonName || !email || !contact || !password || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const index = saloons.findIndex((s) => s.saloonId === id);
  if (index === -1) {
    return res.status(404).json({ message: "Saloon not found." });
  }

  saloons[index] = {
    ...saloons[index],
    saloonName,
    email,
    contact,
    password,
    status,
  };

  const fileContent = `const saloons = ${JSON.stringify(
    saloons,
    null,
    2
  )};\n\nmodule.exports = saloons;`;

  try {
    fs.writeFileSync(filePath, fileContent);
    res.status(200).json({ message: "Saloon updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/loginSaloon", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const saloon = saloons.find(
    (s) => s.email === email && s.password === password
  );

  if (!saloon) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  res.status(200).json({
    message: "Login successful.",
    saloonId: saloon.saloonId,
    saloonName: saloon.saloonName,
    status: saloon.status,
  });
});

// Updated getSaloonData API to use in-memory saloons array
app.get("/getSaloonData/:saloonId", (req, res) => {
  const saloonId = req.params.saloonId;

  // Find saloon by ID in the in-memory saloons array
  const saloon = saloons.find((s) => s.saloonId === saloonId);

  if (!saloon) {
    return res.status(404).json({ message: "Saloon not found." });
  }

  // Return the saloon data
  res.status(200).json(saloon);
});

// Create Saloon Setup API
app.post("/createSaloonSetup", (req, res) => {
  const {
    saloonId,
    facebookLink,
    geoLocation,
    address,
    district,
    city,
    openHours,
  } = req.body;

  // Validate required fields
  if (
    !saloonId ||
    !geoLocation ||
    !address ||
    !district ||
    !city ||
    !openHours ||
    !Array.isArray(openHours)
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Find saloon by saloonId
  const index = saloons.findIndex((s) => s.saloonId === saloonId);
  if (index === -1) {
    return res.status(404).json({ message: "Saloon not found." });
  }

  // Append the setup data to the existing saloon
  saloons[index] = {
    ...saloons[index],
    facebookLink: facebookLink || "", // Optional
    geoLocation,
    address,
    district,
    city,
    openHours,
  };

  // Write the updated saloons back to the file
  const fileContent = `const saloons = ${JSON.stringify(
    saloons,
    null,
    2
  )};\n\nmodule.exports = saloons;`;

  try {
    fs.writeFileSync(filePath, fileContent);
    res.status(200).json({ message: "Saloon setup data added successfully!" });
  } catch (error) {
    console.error("Error writing to file:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/viewAllSaloonsData", (req, res) => {
  try {
    if (Array.isArray(saloons) && saloons.length > 0) {
      res.status(200).json(saloons);
    } else {
      res.status(200).json({ message: "No saloons data found." });
    }
  } catch (error) {
    console.error("Error fetching saloons data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
