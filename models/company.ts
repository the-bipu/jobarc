import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
            index: true,
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        website: {
            type: String,
            default: "",
        },
        careersPage: {
            type: String,
            default: "",
        },
        industry: {
            type: String,
            default: "",
        },
        companySize: {
            type: String,
            enum: ["Startup", "SME", "Mid-size", "Enterprise", ""],
            default: "",
        },
        headquarters: {
            type: String,
            default: "",
        },
        hiringStatus: {
            type: String,
            enum: ["Hiring", "Not Hiring", "Unknown"],
            default: "Unknown",
        },
        jobOpeningsAvailable: {
            type: Boolean,
            default: false,
        },
        activePlatforms: {
            type: [String],
            enum: ["LinkedIn", "Indeed", "Glassdoor", "Company Website", "AngelList", "Naukri", "Other"],
            default: [],
        },
        preferredJobRoles: {
            type: [String],
            default: [],
        },
        leads: [
            {
                name: String,
                role: String,
                email: String,
                linkedin: String,
                contactType: {
                    type: String,
                    enum: ["HR", "Recruiter", "Employee", "Founder", "Referral"],
                },
                lastContactedAt: Date,
                notes: String,
            },
        ],
        lastInteractionDate: {
            type: Date,
            default: null,
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Dream"],
            default: "Medium",
        },
        tags: {
            type: [String],
            default: [],
        },
        notes: {
            type: String,
            default: "",
        },
        bookmarked: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["Interested", "Applied", "In Progress", "Rejected", "Offer Received"],
            default: "Interested",
        },
    },
    { timestamps: true }
);

export const Company =
    mongoose.models.Company || mongoose.model("Company", companySchema);