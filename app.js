const express = require("express");
const bodyParser = require("body-parser");
const schedule = require("node-schedule");
const userModel = require("./models/user");
const messageSender = require("./modules/messageSender");

const app = express();

require("dotenv").config();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post("/users", (req, res) => {
  const { email, firstName, lastName, birthdayDate, location } = req.body;

  if (!email || !firstName || !lastName || !birthdayDate || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newUser = { email, firstName, lastName, birthdayDate, location };

  userModel
    .insert(Object.values(newUser))
    .then((results) => {
      return res.status(201).json({ message: "User created successfully" });
    })
    .catch((err) => {
      return res.status(500).json({ message: "Failed to create user" });
    });
});

app.get("/users", (req, res) => {
  userModel
    .read()
    .then((results) => {
      return res.json(results);
    })
    .catch((err) => {
      return res.status(500).json({ message: "Failed to retrieve user" });
    });
});

app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { email, firstName, lastName, birthdayDate, location } = req.body;

  if (!email || !firstName || !lastName || !birthdayDate || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const updateUser = {
    email,
    firstName,
    lastName,
    birthdayDate,
    location,
    userId,
  };

  userModel
    .update(Object.values(updateUser))
    .then((results) => {
      return res.status(201).json({ message: "User updated successfully" });
    })
    .catch((err) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ message: "Failed to update user" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
    });
});

app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  userModel
    .remove(userId)
    .then((results) => {
      return res.status(201).json({ message: "User removed successfully" });
    })
    .catch((err) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ message: "Failed to remove user" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
    });
});

schedule.scheduleJob("0 * * * *", () => {
  console.log("schedule");
  userModel
    .scheduleMessage(messageSender.sendMessage)
    .then((results) => {
      return res.json(results);
    })
    .catch((err) => {
      return res.status(500).json({ message: "Failed to retrieve user" });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
