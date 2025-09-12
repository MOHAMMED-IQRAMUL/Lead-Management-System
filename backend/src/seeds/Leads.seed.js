import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import User from "../models/User.model.js";
import Lead from "../models/Lead.model.js";
import { connectDB } from "../config/database.config.js";

async function runSeed() {
  try {
    await connectDB(process.env.MONGO_URI);

  const email = 'test@erino.io';
  const password = 'Test@1234';
  const name = 'Test User';

    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
  user = await User.create({ email, passwordHash, name });
      console.log("✅ Test user created:", email, password);
    } else {
      console.log("ℹ️ Test user already exists:", email);
    }

    await Lead.deleteMany({ userId: user._id });

    const sources = [
      "website",
      "facebook_ads",
      "google_ads",
      "referral",
      "events",
      "other",
    ];
    const statuses = ["new", "contacted", "qualified", "lost", "won"];

    const leads = [];
    for (let i = 0; i < 120; i++) {
      leads.push({
        userId: user._id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email({ provider: "example.com" }) + `.${i}`,
        phone: faker.phone.number(),
        company: faker.company.name(),
        city: faker.location.city(),
        state: faker.location.state(),
        source: faker.helpers.arrayElement(sources),
        status: faker.helpers.arrayElement(statuses),
        score: faker.number.int({ min: 0, max: 100 }),
        lead_value: faker.number.int({ min: 100, max: 10000 }),
        last_activity_at: faker.date.recent({ days: 60 }),
        is_qualified: faker.datatype.boolean(),
      });
    }

    await Lead.insertMany(leads);
    console.log(`✅ Seeded ${leads.length} leads for test user.`);

    await mongoose.connection.close();
    console.log("🌱 Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

runSeed();
