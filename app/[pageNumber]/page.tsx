import Image from "next/image";
import prisma from "@/lib/db";
import { SubmissionList } from "@/components/submission";

export default async function Home({ params }: { params: Promise<{ pageNumber: string }> }) {
    const pageNumber = (await params).pageNumber;
    const skip = (parseInt(pageNumber) - 1) * 30;

  const top30 = await prisma.submission.findMany({
    skip: skip,
    take: 30,
    orderBy: {
      score: "desc"
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

  return (
    <SubmissionList submissions={top30.map((x, i) => ({
      id: x.id,
      title: x.title,
      url: x.url,
      upvotes: x.upvotes.length,
      author: x.user.username,
      commentsCount: x.comments.length,
      time: x.createdAt.toISOString(),
      rank: skip + i + 1,
    }))} />
  );
}
