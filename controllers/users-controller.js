const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
	// Fetch and return all users, excluding their passwords
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (err) {
		const error = new HttpError(
			"Fetching users failed, please try again later.",
			500
		);
		return next(error);
	}
	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	// Validate input data
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	// Extract data from request body
	const { name, email, password } = req.body;

	// Check if a user with the same email already exists
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			"User exists already, please login instead.",
			422
		);
		return next(error);
	}

	// Hash the password
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError(
			"Could not create user, please try again.",
			500
		);
		return next(error);
	}

	// Create a new user
	const createdUser = new User({
		name,
		email,
		image: req.file.path,
		password: hashedPassword,
		places: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(error);
	}

	// Generate a token for the new user
	let token;
	try {
		token = jwt.sign(
			{ userId: createdUser.id, email: createdUser.email },
			process.env.JWT_KEY,
			{ expiresIn: "1h" } // Token expiration time
		);
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(error);
	}

	// Return the user ID, email, and token
	res
		.status(201)
		.json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
	// Extract email and password from request body
	const { email, password } = req.body;

	let existUser;

	try {
		// Find the user by email
		existUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			"Logging in failed, please try again later.",
			500
		);
		return next(error);
	}

	if (!existUser) {
		const error = new HttpError(
			"Invalid credentials, could not log you in.",
			401
		);
		return next(error);
	}

	// Check if the provided password matches the stored hashed password
	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existUser.password);
	} catch (err) {
		const error = new HttpError(
			"Could not log you in, please check your credentials and try again.",
			500
		);
		return next(error);
	}

	if (!isValidPassword) {
		const error = new HttpError(
			"Invalid credentials, could not log you in.",
			403
		);
		return next(error);
	}

	// Generate a token for the existing user
	let token;
	try {
		token = jwt.sign(
			{ userId: existUser.id, email: existUser.email },
			process.env.JWT_KEY,
			{ expiresIn: "1h" }
		);
	} catch (err) {
		const error = new HttpError(
			"Logging in failed, please try again later.",
			500
		);
		return next(error);
	}

	// Return the user ID, email, and token
	res.json({
		userId: existUser.id,
		email: existUser.email,
		token: token,
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
