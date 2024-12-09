import Image from "next/image";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { SubmissionList } from "@/components/submission";
import { CalendarIcon, MessageSquare, Share2 } from 'lucide-react'


export default async function User({ params }: { params: Promise<{ username: string }> }) {
    const username = (await params).username;

    const user = await prisma.user.findFirst({
        where: {
            username: username
        }
    });
    if (!user) return <div>User not found</div>;

    const userNewest30 = await prisma.submission.findMany({
        take: 30,
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            user: {
                select: {
                    username: true,
                },
            },
            upvotes: {},
            comments: {},
        },
    });

    const karma = (await prisma.submissionUpvote.findMany({
        where: {
            submission: {
                userId: user.id
            },
        },
    })).length + (await prisma.commentUpvote.findMany({
        where: {
            comment: {
                userId: user.id
            },
        },
    })).length;

    const favoritesAll = await prisma.favorite.findMany({
        where: {
            userId: user.id
        },
        include: {
            submission: {
                include: {
                    user: {
                        select: {
                            username: true
                        }
                    },
                    upvotes: {},
                    comments: {}
                }
            }
        }
    });

    return (
        <>
            <main className="container mx-auto py-8 px-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-2xl font-bold mb-4">User: {user.username}</h1>

                    <div className="grid gap-4 md:grid-cols-2 mb-6">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Created: {user.createdAt.toISOString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Share2 className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Karma: {karma}</span>
                        </div>
                    </div>
                </div>
            </main>
            <div>
                <SubmissionList submissions={userNewest30.map((x, i) => ({
                    id: x.id,
                    title: x.title,
                    url: x.url,
                    upvotes: x.upvotes.length,
                    author: x.user.username,
                    commentsCount: x.comments.length,
                    time: x.createdAt.toISOString(),
                    rank: i + 1,
                }))} />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">Favorites</h2>
                <SubmissionList submissions={favoritesAll.map((x, i) => ({
                    id: x.submission.id,
                    title: x.submission.title,
                    url: x.submission.url,
                    upvotes: x.submission.upvotes.length,
                    author: x.submission.user.username,
                    commentsCount: x.submission.comments.length,
                    time: x.submission.createdAt.toISOString(),
                    rank: i + 1,
                }))} />
            </div>
        </>
    );
}