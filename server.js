import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import DB_Init from "./entities/DB_Init.js";
import bodyParser from "body-parser";


import notiteRouter from "./routes/NotiteRouter.js";
import loginRouter from "./routes/loginRouter.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));



app.use("/api", notiteRouter);
app.use("/api", loginRouter); 


DB_Init();

app.listen(PORT, () => {
  console.log(`Serverul rulează la: http://localhost:${PORT}`);
});
