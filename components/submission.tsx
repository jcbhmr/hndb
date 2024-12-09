import Link from 'next/link'
import { ChevronUp, MessageSquare } from 'lucide-react'
import { auth } from '@/auth'
import prisma from '@/lib/db'

interface SubmissionProps {
  id: number
  title: string
  url?: string | null
  upvotes: number
  author: string
  time: string
  commentsCount: number
  rank: number
}

export async function Submission({
  id,
  title,
  url,
  upvotes,
  author,
  time,
  commentsCount,
  rank
}: SubmissionProps) {
  const session = await auth()
  const ableToUpvote = session?.user?.email ? !await prisma.submissionUpvote.findFirst({
    where: {
      submissionId: id,
      user: {
        email: session.user.email
      }
    }
  }) : false

  return (
    <div className="flex items-start space-x-2 py-2">
      {rank && <span className="text-sm text-gray-500 w-4 text-right">{rank}.</span>}
      { ableToUpvote && <button className="mt-1 text-gray-500 hover:text-[#ff6600]" onClick={async () => {
        "use server"
        if (!session?.user?.email) {
          return
        }
        const existingUpvote = await prisma.submissionUpvote.findFirst({
          where: {
            submissionId: id,
            user: {
              email: session.user.email
            }
          }
        })
        if (existingUpvote) {
          return
        }
        await prisma.submissionUpvote.create({
          data: {
            submissionId: id,
            userId: (await prisma.user.findFirst({
              where: {
                email: session.user.email
              }
            }))?.id!
          }
        })
        await prisma.submission.update({
          where: {
            id: id
          },
          data: {
            score: {
              increment: 1
            }
          }
        })
      }}>
        <ChevronUp className="h-4 w-4" />
      </button>}
      <div className="flex flex-col space-y-1">
        {url ? (
        <div className="flex items-center space-x-1">
          <Link href={url} className="text-sm font-medium text-black hover:underline">
            {title}
          </Link>
          <span className="text-xs text-gray-500">
            ({new URL(url).hostname})
          </span>
        </div>
        ) : (
        <Link href={`/item/${id}`} className="text-sm font-medium text-black hover:underline">
          {title}
        </Link>
        )}
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span>{upvotes} upvotes</span>
          <span>by</span>
          <Link href={`/user/${author}`} className="hover:underline">
            {author}
          </Link>
          <span>{time}</span>
          <span>|</span>
          <Link href={`/item/${id}`} className="hover:underline flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            {commentsCount} comments
          </Link>
        </div>
      </div>
    </div>
  )
}

export function SubmissionList({ submissions }: { submissions: SubmissionProps[] }) {
  return (
    <div>
      {submissions.map((submission) => (
        <Submission key={submission.id} {...submission} />
      ))}
    </div>
  )
}