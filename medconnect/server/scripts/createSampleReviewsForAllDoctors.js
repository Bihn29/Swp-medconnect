const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");
const Review = require("../models/review.model");

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URL || "mongodb+srv://medconnect:medconnect123@medconnect.8xqjq.mongodb.net/MedConnect?retryWrites=true&w=majority&appName=MedConnect";

const sampleReviews = [
  {
    rating: 5,
    comment: "Bác sĩ rất tận tâm và chuyên nghiệp. Tôi rất hài lòng với dịch vụ khám chữa bệnh.",
    patientName: "Nguyễn Văn A"
  },
  {
    rating: 4,
    comment: "Dịch vụ tốt, phòng khám sạch sẽ. Bác sĩ giải thích rõ ràng về tình trạng bệnh.",
    patientName: "Trần Thị B"
  },
  {
    rating: 5,
    comment: "Bác sĩ rất kiên nhẫn và chu đáo. Tôi cảm thấy an tâm khi được khám bởi bác sĩ này.",
    patientName: "Lê Văn C"
  },
  {
    rating: 4,
    comment: "Thời gian chờ khám hợp lý, bác sĩ chẩn đoán chính xác và đưa ra lời khuyên hữu ích.",
    patientName: "Phạm Thị D"
  },
  {
    rating: 5,
    comment: "Bác sĩ có chuyên môn cao, điều trị hiệu quả. Tôi sẽ giới thiệu cho bạn bè.",
    patientName: "Hoàng Văn E"
  },
  {
    rating: 3,
    comment: "Dịch vụ ổn, nhưng thời gian chờ hơi lâu. Bác sĩ khám cẩn thận.",
    patientName: "Vũ Thị F"
  },
  {
    rating: 5,
    comment: "Bác sĩ rất nhiệt tình, giải thích chi tiết về bệnh và cách điều trị. Rất hài lòng!",
    patientName: "Đặng Văn G"
  },
  {
    rating: 4,
    comment: "Phòng khám hiện đại, bác sĩ có kinh nghiệm. Điều trị hiệu quả.",
    patientName: "Bùi Thị H"
  }
];

async function createSampleReviews() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all doctors
    console.log("👨‍⚕️ Fetching all doctors...");
    const doctors = await Doctor.find({}).select("_id fullName");
    console.log(`📊 Found ${doctors.length} doctors`);

    if (doctors.length === 0) {
      console.log("❌ No doctors found in database");
      return;
    }

    // Get all patients
    console.log("👥 Fetching all patients...");
    const patients = await Patient.find({}).select("_id fullName");
    console.log(`📊 Found ${patients.length} patients`);

    if (patients.length === 0) {
      console.log("❌ No patients found in database");
      return;
    }

    // Create reviews for each doctor
    let totalReviewsCreated = 0;
    
    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Creating reviews for: ${doctor.fullName}`);
      
      // Create 3-5 reviews per doctor
      const numReviews = Math.floor(Math.random() * 3) + 3; // 3-5 reviews
      
      for (let i = 0; i < numReviews; i++) {
        const reviewData = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        const randomPatient = patients[Math.floor(Math.random() * patients.length)];
        
        const review = new Review({
          doctorId: doctor._id,
          patientId: randomPatient._id,
          appointmentId: new mongoose.Types.ObjectId(), // Fake appointment ID
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });

        await review.save();
        totalReviewsCreated++;
        console.log(`  ✅ Created review ${i + 1}/${numReviews} - Rating: ${reviewData.rating}`);
      }
    }

    console.log(`\n🎉 Successfully created ${totalReviewsCreated} reviews for ${doctors.length} doctors!`);
    
    // Verify reviews were created
    const totalReviews = await Review.countDocuments();
    console.log(`📊 Total reviews in database: ${totalReviews}`);

  } catch (error) {
    console.error("❌ Error creating sample reviews:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createSampleReviews();
