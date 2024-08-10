import LoginForm from "@/components/forms/LoginForm"

export default function LoginPage() {

  if(process.env.CURRENT_SITE_STATUS == "idle") {
    redirect("/hof")
  }

  return (
    <LoginForm />
  )
}