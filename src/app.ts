import express, { Request, Response } from "express";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import asyncHandler from "express-async-handler";

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, "../uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Image upload API
app.post(
  "/upload",
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const outputPath = path.join(uploadDir, `${Date.now()}.avif`);

    await sharp(req.file.buffer).resize(1024, 1024, { fit: "inside" }).toFormat("avif").toFile(outputPath);

    res.status(200).send("Image uploaded and converted to AVIF format.");
  })
);

// Get images API
app.get("/images/:filename", (req: Request, res: Response) => {
  const filePath = path.join(uploadDir, req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send("File not found.");
    res.sendFile(filePath);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
