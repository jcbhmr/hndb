import Image from "next/image";
import prisma from "@/lib/db";
import { SubmissionList } from "@/components/submission";
import { SubmissionDetailComponent } from "@/components/submission-detail";
import { auth } from "@/auth";

interface Comment {
    id: number
    ableToUpvote: boolean
    author: string
    text: string
    time: string
    replies?: Comment[]
  }

export default async function Item({ params }: { params: Promise<{ submissionId: string }> }) {
    const submissionId = (await params).submissionId;
    const submission = await prisma.submission.findFirst({
        where: {
            id: +submissionId
        },
        include: {
            user: true,
            upvotes: {},
            comments: true,
        },
    });
    if (!submission) return <div>Submission not found</div>;

    const session = await auth()

    const recurseReplies = async (comment: {
        id: number;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        submissionId: number;
        parentId: number | null;
    }): Promise<Comment[]> => {
        return await Promise.all(submission.comments.filter(x => x.parentId === comment.id).map(async x => ({
            id: x.id,
            ableToUpvote: session?.user?.email ? !await prisma.commentUpvote.findFirst({
                where: {
                    commentId: x.id,
                    userId: (await prisma.user.findFirst({
                        where: {
                            email: session.user.email
                        }
                    }))?.id
                }
            }) : false,
            author: (await prisma.user.findFirst({
                where: {
                    id: x.userId
                }
            }))?.username!,
            text: x.content,
            time: x.createdAt.toISOString(),
            replies: await recurseReplies(x)
        })))
    }
    const roots = submission.comments.filter(x => !x.parentId)
    const comments = await Promise.all(roots.map(async x => ({
        id: x.id,
        ableToUpvote: session?.user?.email ? !await prisma.commentUpvote.findFirst({
            where: {
                commentId: x.id,
                userId: (await prisma.user.findFirst({
                    where: {
                        email: session.user.email
                    }
                }))?.id
            }
        }) : false,
        author: (await prisma.user.findFirst({
            where: {
                id: x.userId
            }
        }))?.username!,
        text: x.content,
        time: x.createdAt.toISOString(),
        replies: await recurseReplies(x)
    })))

    return (
        <SubmissionDetailComponent
        author={submission.user.username} comments={comments} commentsCount={submission.comments.length} id={submission.id} points={submission.upvotes.length}
        time={submission.createdAt.toISOString()} title={submission.title} url={submission.url!}
        commentAction={async (submissionId: number, text: string) => {
            "use server"
            const session = await auth()
            if (!session?.user?.email) {
                return
            }
            const user = await prisma.user.findFirst({
                where: {
                    email: session.user.email
                }
            })
            if (!user) {
                throw new Error("User not found")
            }

            await prisma.comment.create({
                data: {
                    content: text,
                    submissionId: submission.id,
                    userId: user.id,
                }
            })
        }}
        replyAction={async (commentId: number, text: string) => {
            "use server"
            const session = await auth()
            if (!session?.user?.email) {
                return
            }
            const user = await prisma.user.findFirst({
                where: {
                    email: session.user.email
                }
            })
            if (!user) {
                throw new Error("User not found")
            }

            await prisma.comment.create({
                data: {
                    content: text,
                    parentId: commentId,
                    submissionId: submission.id,
                    userId: user.id,
                }
            })
        }}
        upvoteAction={async (commentId: number) => {
            "use server"
            const session = await auth()
            if (!session?.user?.email) {
                return
            }
            const user = await prisma.user.findFirst({
                where: {
                    email: session.user.email
                }
            })
            if (!user) {
                throw new Error("User not found")
            }

            const existingUpvote = await prisma.commentUpvote.findFirst({
                where: {
                    commentId: commentId,
                    userId: user.id
                }
            })
            if (existingUpvote) {
                return
            }
            await prisma.commentUpvote.create({
                data: {
                    commentId: commentId,
                    userId: user.id
                }
            })
        }}
         />
    )
}