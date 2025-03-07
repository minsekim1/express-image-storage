import express, { Request, Response } from "express";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import asyncHandler from "express-async-handler";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;
const uploadDir = path.join(__dirname, "../uploads");

app.use(
  cors({
    origin: ["http://localhost:3000", "https://cdhub.org"], // 허용할 도메인 목록
    methods: ["POST"], // 허용할 HTTP 메서드
  })
);

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
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    // 파일 이름 및 저장 경로 생성
    const timestamp = Date.now();
    const filename = `${timestamp}.avif`;
    const outputPath = path.join(uploadDir, filename);

    // 이미지 변환 및 저장
    const processedImage = sharp(req.file.buffer)
      .rotate() // EXIF 데이터 기반 자동 회전
      .resize(1024, 1024, { fit: "inside" }) // 크기 조정
      .toFormat("avif");

    await processedImage.toFile(outputPath);

    // 변환된 이미지의 width, height 가져오기
    const finalMetadata = await processedImage.metadata();

    // 정적 파일 URL 반환 + width, height 추가
    const fileUrl = `/uploads/${filename}`;
    res.status(200).json({ src: fileUrl, width: finalMetadata.width, height: finalMetadata.height });
  })
);

// Get images API
app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
