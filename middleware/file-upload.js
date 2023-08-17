const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MIME_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
};

const fileUpload = multer({
	limits: 50000,
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, "uploads/images");
		},

		filename: (req, file, cb) => {
			const ext = MIME_TYPE_MAP[file.mimetype];
			cb(null, uuidv1() + "." + ext);
		},
	}),

	fileFilter: (req, file, cb) => {
		const isValid = !!MIME_TYPE_MAP[file.mimetype];
		const error = isValid
			? null
			: new Error("Invalid mime type (file-upload.js)");
		cb(error, isValid);
	},
});

module.exports = fileUpload;
