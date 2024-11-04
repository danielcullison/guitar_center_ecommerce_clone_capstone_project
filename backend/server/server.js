const express = require("express");
const cors = require('cors');
const client = require("../db/client.js");
const authRoutes = require("../routes/auth");
const productRoutes = require("../routes/products");
const userRoutes = require("../routes/users");
const cartRoutes = require("../routes/cart");
const adminRoutes = require("../routes/admin");
const orderRoutes = require("../routes/orders");

const app = express();
client.connect(); // Connect to the database client

app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Hello World!"); // Responds with "Hello World!"
});

// Set the server to listen on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
