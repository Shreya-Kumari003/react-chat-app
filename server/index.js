import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import authRoutes from "./routes/AuthRoutes.js"
import contactsRoutes from "./routes/ContactRoutes.js"
import setupSocket from "./socket.js"
import messagesRoutes from "./routes/MessagesRoutes.js"
import channelRoutes from "./routes/ChannelRoutes.js"
import path from "path";


dotenv.config();

const __dirname = path.resolve();


const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

app.use(express.static(path.join(__dirname, '/client/dist')));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

const server = app.listen(port, () => {
    console.log(`Server is runnning at https://localhost:${port}`)
});

setupSocket(server);

mongoose.connect(databaseURL)
    .then(() => console.log('DB Connenction Successfull!')).catch(err => console.log(err.message)
    );
