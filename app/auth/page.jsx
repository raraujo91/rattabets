import LoginForm from "@/components/forms/LoginForm"
import { redirect } from "next/navigation"

export default function LoginPage() {

  if(process.env.NEXT_PUBLIC_CURRENT_SITE_STATUS == "idle") {
    redirect("/hof")
  }

  return (
    <LoginForm />
  )
}