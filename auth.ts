// https://authjs.dev/getting-started/authentication/credentials

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
import { saltAndHashPassword } from "@/lib/password"
import prisma from "@/lib/db"
import { signInSchema } from "./lib/zod"
import { ZodError } from "zod"

async function getUserFromDb(email: string, pwHash: string) {
  return await prisma.user.findFirst({
      where: {
          email,
          password: pwHash,
      },
  })
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          let user = null
 
          const { email, password } = await signInSchema.parseAsync(credentials)
 
          // logic to salt and hash password
          const pwHash = saltAndHashPassword(password)
 
          // logic to verify if the user exists
          user = await getUserFromDb(email, pwHash)
 
          if (!user) {
            throw new Error("Invalid credentials.")
          }
 
          // return JSON object with the user data
          return user
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null
          }
        }
      },
    }),
  ],
})