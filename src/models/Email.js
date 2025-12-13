import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
  {
    filename: String,
    mimeType: String,
    size: Number,
    extractedText: String, // لاحقًا: نص الـ CV من PDF/DOCX
    attachmentId: String, // Gmail attachment ID for later retrieval
  },
  { _id: false }
);

const EmailSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    gmailId: { type: String, index: true },
    gmailMessageId: { type: String, index: true }, // Gmail's unique message ID
    threadId: String,

    fromEmail: { type: String, index: true },
    fromName: String,
    to: [String],
    cc: [String],
    bcc: [String],

    subject: { type: String, index: true },
    snippet: String,
    bodyText: String,
    bodyHtml: String,

    date: { type: Date, index: true },
    internalDate: Number, // Gmail internal timestamp

    hasAttachments: { type: Boolean, default: false, index: true },
    attachments: [AttachmentSchema],

    tags: [{ type: String, index: true }], // ["CV", "Invoice", "Job"]
    labels: [{ type: String, index: true }], // Gmail label IDs (e.g., INBOX, IMPORTANT, CATEGORY_SOCIAL)

    // Gmail-specific metadata for smart sorting
    gmailImportance: { type: String, enum: ['high', 'normal', 'low'], default: 'normal', index: true },
    gmailCategory: { type: String, index: true }, // Primary, Social, Promotions, Updates, Forums
    gmailPriority: { type: Number, default: 0, index: true }, // Calculated priority score
    isStarred: { type: Boolean, default: false, index: true },
    isImportant: { type: Boolean, default: false, index: true },
    isUnread: { type: Boolean, default: true, index: true },
    
    // CV-specific fields
    isCV: { type: Boolean, default: false, index: true },
    cvData: {
      candidateName: String,
      skills: [String],
      experience: String,
      role: String,
      score: Number,
      reasoning: String,
    },

    // Embedding للبحث الذكي
    embedding: { type: [Number], default: undefined },
  },
  { timestamps: true }
);

EmailSchema.index({ userId: 1, gmailId: 1 }, { unique: true });
EmailSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });

export default mongoose.model("Email", EmailSchema);
