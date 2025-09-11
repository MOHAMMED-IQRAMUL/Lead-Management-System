import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    source: {
      type: String,
      enum: [
        "website",
        "facebook_ads",
        "google_ads",
        "referral",
        "events",
        "other",
      ],
      default: "other",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "lost", "won"],
      default: "new",
    },
    score: { type: Number, min: 0, max: 100, default: 0 },
    lead_value: { type: Number, default: 0 },
    last_activity_at: { type: Date, default: null },
    is_qualified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "leads",
  }
);

leadSchema.index({ userId: 1, created_at: -1 });
// leadSchema.index({ email: 1 });
leadSchema.index({ email: 1 }, { unique: true });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
