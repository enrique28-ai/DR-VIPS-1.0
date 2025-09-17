import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";

import authRoutes from './routes/auth.route.js'
import patientRoutes from './routes/patient.route.js'
import diagnosisRoutes from './routes/diagnosis.route.js'
import { connectDB } from './config/db.js';
import path from "path";


dotenv.config();
const PORT = process.env.PORT || 5001;
const app = express();
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/diagnosis', diagnosisRoutes)

const __dirname = path.resolve();
if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("/{*splat}", (req, res) =>{
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}



connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});