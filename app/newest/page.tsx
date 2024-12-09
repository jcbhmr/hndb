import Image from "next/image";
import prisma from "@/lib/db";
import { SubmissionList } from "@/components/submission";

export default async function Newset() {
  const newest30 = await prisma.submission.findMany({
    take: 30,
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

  return (
    <SubmissionList submissions={newest30.map((x, i) => ({
      id: x.id,
      title: x.title,
      url: x.url,
      upvotes: x.upvotes.length,
      author: x.user.username,
      commentsCount: x.comments.length,
      time: x.createdAt.toISOString(),
      rank: i + 1,
    }))} />
  );
}
