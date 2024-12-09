// https://authjs.dev/getting-started/session-management/protecting

import { auth } from "@/auth"
import { SubmissionFormComponent } from "@/components/submission-form"
import prisma from "@/lib/db"
 
export default async function Submit() {
  const session = await auth()
  if (! session?.user?.email) return <div>Not authenticated</div>

  const user = await prisma.user.findFirst({
    where: {
      email: session.user.email
    }
  })
  if (!user) return <div>User not found</div>
 
  return (
    <SubmissionFormComponent action={async (formData) => {
        "use server"
        const url = formData.get('url') as string
        const title = formData.get('title') as string
        await prisma.submission.create({
          data: {
            url: url,
            title: title,
            userId: user.id
          }
        })
    }} />
  )
}