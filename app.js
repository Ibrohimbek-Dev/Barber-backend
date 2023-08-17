const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(bodyParser.json());

// Serve static files
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use(express.static(path.join("public")));

// Routes
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// Serve React frontend
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "frontend", "build")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
	});
}

// Error handling middleware
app.use((error, req, res, next) => {
	if (req.file) {
		fs.unlink(req.file.path, (err) => {
			console.log("Error cleaning up file:", err);
		});
	}

	if (res.headersSent) {
		return next(error);
	}

	res
		.status(error.code || 500)
		.json({ message: error.message || "An unknown error occurred!" });
});

// Database connection and server start
mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("Connected to MongoDB");
		const port = process.env.PORT || 5000;
		app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	})
	.catch((error) => {
		console.error("MongoDB connection error:", error);
	});
