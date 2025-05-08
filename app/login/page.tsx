import { LoginForm } from "@/components/login-form"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">TaskFlow</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
