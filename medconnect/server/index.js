import "dotenv/config";
import { configureExpress, configureErrorHandling } from "./config/express.js";
import { initializeFirebase } from "./config/firebase.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

// Initialize Firebase
initializeFirebase();

// Configure Express app
const app = configureExpress();

// Routes
app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);

// Error handling
configureErrorHandling(app);

// Start server
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Auth server listening at http://localhost:${PORT}`)
);