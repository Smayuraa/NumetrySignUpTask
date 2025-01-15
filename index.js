const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require('bcryptjs');
const app = express();
const User = require("./modules/user");

require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));

// Connect to MongoDB Atlas
const atlasdb = process.env.ATLASDB_URL;
mongoose.connect(atlasdb, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "signup.html"));
});

app.post("/signup", async (req, res) => {
    const { firstName, middleName, lastName, email, phone, country, state, city, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            middleName,
            lastName,
            email,
            phone,
            country,
            state,
            city,
            password: hashedPassword, // Save the hashed password
        });

        await newUser.save();
        console.log("User registered successfully");
        res.redirect("/"); // Redirect to signup page or success page
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ message: "Error saving user", error: error.message });
    }
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
