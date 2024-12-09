import { signIn } from "@/auth"
 
export function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("credentials", formData)
        // TODO: Handle errors
      }}
    >
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input name="password" type="password" />
      </div>
      <div>
        <button>Sign In</button>
      </div>
    </form>
  )
}