import Razorpay from "razorpay";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/courseProgress.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const newPurchase = await CoursePurchase.create({
      user: userId,
      course: courseId,
      amount: course.price,

      status: "pending",
    });
    const options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: `course_${courseId}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };
    const order = await razorpay.orders.create(options);
    newPurchase.pymentId = order.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      order,
      course: {
        name: course.title,
        description: course.description,
      },
    });
  } catch (error) {}
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    const isAuthentic = expectedSignature === razorpay_signature;
    if (!isAuthentic) {
      return res.status(400).json({ message: "Payment Failed" });
    }

    const purchase = await CoursePurchase.findOne({
      pymentId: razorpay_order_id,
    });
    purchase.status = "success";
    await purchase.save();
    return res.status(200).json({ message: "Payment successful" });
  } catch (error) {}
};
