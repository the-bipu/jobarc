import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        position: {
            type: String,
            required: true,
        },
        applicationDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: [
                "Applied",
                "HR Screening",
                "Interview Scheduled",
                "Technical Round",
                "Managerial Round",
                "Offered",
                "Rejected",
                "Ghosted",
                "Accepted",
                "Joined",
                "Withdrawn",
            ],
            default: "Applied",
        },
        salary: {
            type: String,
            default: "",
        },
        jobType: {
            type: String,
            enum: ["Full-time", "Internship", "Part-time", "Contract", "Remote"],
            default: "Full-time",
        },
        jobLocation: {
            type: String,
            default: "",
        },
        reference: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default: "",
        },
        applicationSource: {
            type: String,
            enum: ["Campus", "Referral", "LinkedIn", "Indeed", "Company Website", "HR Email", "Other"],
            default: "Company Website",
        },
        notes: {
            type: String,
            default: "",
        },
        resumeVersion: {
            type: String,
            default: "",
        },
        followUpDate: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);