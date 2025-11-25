import connect from "@/utils/mongodb";
import bcrypt from "bcryptjs";
import { User } from "@/models/user";
import { NextResponse } from "next/server";

export const POST = async (request: any) => {
  try {
    const { email, password, name, phone, gender, type } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connect();
    console.log("Connected to database");

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      name,
      phone: phone || "",
      gender: gender || "prefer-not-to-say",
      type: type || "user",
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
};