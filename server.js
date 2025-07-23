const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Static and form parsing
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Serve HTML form
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/infoForm.html");
});

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer storage with file size and type filter
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed."));
    }
  }
});

// Upload route
app.post("/upload", upload.single("pdfFile"), (req, res) => {
  if (!req.file) return res.send("No file uploaded.");
  res.send("Upload successful!");
});

// List uploaded files
app.get("/files", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json([]);
    res.json(files);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PDF Uploader running at http://localhost:${PORT}`);
});
