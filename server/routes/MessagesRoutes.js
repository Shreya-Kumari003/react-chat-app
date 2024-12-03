import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import multer from "multer";

const messagesRoutes = Router();
// const upload = multer({ dest: "uploads/files" });

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });     // Use memory storage

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post(
    "/upload-file",
    verifyToken,
    upload.single("file"),
    uploadFile
);

export default messagesRoutes;