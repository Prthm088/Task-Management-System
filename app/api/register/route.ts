import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { getCollections } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const { users } = await getCollections()

    // Check if user already exists
    const existingUser = await users.findOne({ email })

    if (existingUser) {
      return new NextResponse("User already exists", { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    const now = new Date()

    // Create user
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    })

    // Return user without password
    return NextResponse.json({
      id: result.insertedId.toString(),
      name,
      email,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    console.error("[REGISTER_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
