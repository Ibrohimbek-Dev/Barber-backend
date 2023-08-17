const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const mongoURL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nqsvctw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use(express.static(path.join("public")));


// app.use((req, res, next) => {
// 	res.setHeader("Access-Control-Allow-Origin", "*");
// 	res.setHeader(
// 		"Access-Control-Allow-Headers",
// 		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
// 	);
// 	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
// 	next();
// });

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
	res.sendFile(path.resolve(__dirname, "public", "index.html"))
})


// app.use((req, res, next) => {
// 	const error = new HttpError("Could not find this route.", 404);
// 	throw error;
// });

app.use((error, req, res, next) => {
	if (req.file) {
		fs.unlink(req.file.path, (err) => {
			console.log("app.js: ", err);
		});
	}
	if (res.headerSent) {
		return next(error);
	}

	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
	.connect(mongoURL)
	.then(() => {
		app.listen(5000);
	})
	.catch((error) => {
		console.log(error);
	});