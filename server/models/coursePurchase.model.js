import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      enum: {
        values: ["INR", "USD"],
        message: "please select correct currency",
      },
      default: "INR",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed"],
        message: "please select correct status",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: [true, "PaymentMethod is required"],
    },
    paymentId: {
      type: String,
      required: [true, "PaymentId is required"],
    },
    refundId: {
      type: String,
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount must be greater than 0"],
    },
    refundReason: {
      type: String,
    },
    metaData: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

coursePurchaseSchema.index({ user: 1, course: 1 }, { unique: true });
coursePurchaseSchema.index({ status: 1 });
coursePurchaseSchema.index({ createdAt: -1 });

coursePurchaseSchema.virtual("isRefundable").get(function () {
  if (this.status !== "completed") {
    return false;
  }
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDaysAgo;
});

// method to process refund
coursePurchaseSchema.methods.processRefund = async function (reason, amount) {
  this.status = "refunded";
  this.refundReason = reason;
  this.refundAmount = amount || this.amount;
  await this.save();
};

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema
);
