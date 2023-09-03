const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MIME_TYPE_MAP = {
	"image/png": "png",
	"image/jpeg": "jpeg",
	"image/jpg": "jpg",
	"image/gif": "gif",
	"image/webp": "webp",
	"image/svg+xml": "svg",
	"image/bmp": "bmp",
	"image/tiff": "tiff",
	"image/x-icon": "ico", // Icon file format
	"image/vnd.microsoft.icon": "ico", // Another format for icons
	"image/vnd.wap.wbmp": "wbmp", // Wireless Bitmap image format
	"image/apng": "apng", // Animated PNG format
	"image/x-ms-bmp": "bmp", // BMP (Windows Bitmap)
	"image/x-jng": "jng", // JPEG Network Graphics
	"image/vnd.djvu": "djvu", // DjVu image format
	"image/vnd.wap.wbmp": "wbmp", // Wireless Bitmap image format
	"image/webp": "webp", // WebP image format
	"image/x-exr": "exr", // OpenEXR format
	"image/avif": "avif", // AVIF image format
	"image/heif": "heif", // HEIF (High Efficiency Image File Format)
	"image/heic": "heic", // HEIC (High Efficiency Image Container)
	"image/jp2": "jp2", // JPEG 2000 format
	"image/x-raw": "raw", // RAW image format	
};
;

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
