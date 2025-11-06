import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import pharmacistRouter from "./routes/pharmacistRoute.js"
import consultationRouter from "./routes/consultationRoute.js"
import medicalRecordRouter from "./routes/medicalRecordRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000

const startServer = async () => {
  try {
    await connectDB()
    try {
      await connectCloudinary()
    } catch (cloudErr) {
      console.warn('Cloudinary initialization failed:', cloudErr.message)
    }

    // middlewares
    app.use(express.json())

    // CORS: use a whitelist from ALLOWED_ORIGINS (comma-separated) when provided,
    // otherwise allow all origins (default existing behavior).
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
    if (allowed.length > 0) {
      app.use(cors({
        origin: function (origin, callback) {
          // allow requests with no origin like mobile apps or curl
          if (!origin) return callback(null, true)
          if (allowed.indexOf(origin) !== -1) {
            return callback(null, true)
          }
          return callback(new Error('CORS policy: origin not allowed'))
        },
        credentials: true,
      }))
    } else {
      // permissive fallback to preserve existing deployments until ALLOWED_ORIGINS is set
      app.use(cors())
    }

    // api endpoints
    app.use("/api/user", userRouter)
    app.use("/api/admin", adminRouter)
    app.use("/api/doctor", doctorRouter)
    app.use("/api/pharmacist", pharmacistRouter)
    app.use("/api/consultations", consultationRouter)
    app.use("/api/records", medicalRecordRouter)

    app.get("/", (req, res) => {
      res.send("API Working")
    });

    app.listen(port, () => console.log(`Server started on PORT:${port}`))
  } catch (error) {
    console.error("Failed to start server:", error.message)
    process.exit(1)
  }
}
startServer()