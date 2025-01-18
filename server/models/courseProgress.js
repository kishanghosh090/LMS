import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
  lecture: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: [true, "Lecture is required"],
    },
  ],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
  lastWatched: {
    type: Date,
    default: Date.now,
  },
});

const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lecturesProgress: [lectureProgressSchema],
    lastAccess: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// calculate course completion percentage------
courseProgressSchema.pre("save", function (next) {
  if (this.lecturesProgress.length > 0) {
    const completedLectures = this.lecturesProgress.filter(
      (lp) => lp.isCompleted
    ).length;
    this.completionPercentage = Math.round(
      (completedLectures / this.lecturesProgress.length) * 100
    );
    this.isCompleted = this.completionPercentage === 100;
  }
});

// update access time------
courseProgressSchema.methods.updateLastAccess = function () {
  this.lastAccess = Date.now();
  return this.save({ validateBeforeSave: false });
};

// export model ------
export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema
);
