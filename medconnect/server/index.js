import "dotenv/config";
import { configureExpress, configureErrorHandling } from "./config/express.js";
import { initializeFirebase } from "./config/firebase.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import mongoose from "mongoose";
import Route from "./routes/user.route.js";

// Initialize Firebase
initializeFirebase();

// Configure Express app
const app = configureExpress();

// Routes
app.use("/", Route);
app.use("/api/auth", authRoutes);

// Error handling
configureErrorHandling(app);

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("thành công"))
  .catch((error) => console.error("không thành công:", error));

// Start server
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Auth server listening at http://localhost:${PORT}`)
);
