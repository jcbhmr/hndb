'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Comment {
  id: number
  ableToUpvote: boolean
  author: string
  text: string
  time: string
  replies?: Comment[]
}

interface SubmissionProps {
  id: number
  title: string
  url: string
  points: number
  author: string
  time: string
  commentsCount: number
  text?: string
  comments: Comment[]
  commentAction: (submissionId: number, text: string) => Promise<void>
  replyAction: (commentId: number, text: string) => Promise<void>
  upvoteAction: (commentId: number) => Promise<void>
}

function CommentComponent({ comment, replyAction, upvoteAction }: { comment: Comment, replyAction: (commentId: number, text: string) => Promise<void>, upvoteAction: (commentId: number) => Promise<void> }) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleReply = async () => {
    await replyAction(comment.id, replyText)
    setIsReplying(false)
    setReplyText('')
  }

  return (
    <div className="mt-4 border-l-2 border-gray-200 pl-4">
      <div className="text-sm text-gray-500">
        <Link href={`/user/${comment.author}`} className="font-medium text-gray-700 hover:underline">
          {comment.author}
        </Link>{' '}
        {comment.time}
      </div>
      <div className="mt-1 text-gray-700">{comment.text}</div>
      <div className="mt-2 space-x-2 text-xs">
        <button onClick={() => setIsReplying(!isReplying)} className="text-gray-500 hover:text-gray-700">
          reply
        </button>
        <button onClick={() => upvoteAction(comment.id)} className="text-gray-500 hover:text-gray-700">
          upvote
        </button>
      </div>
      {isReplying && (
        <div className="mt-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="mb-2"
          />
          <Button onClick={handleReply} size="sm">
            Submit Reply
          </Button>
        </div>
      )}
      {comment.replies && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} replyAction={replyAction} upvoteAction={upvoteAction} />
          ))}
        </div>
      )}
    </div>
  )
}

export function SubmissionDetailComponent({
  id,
  title,
  url,
  points,
  author,
  time,
  commentsCount,
  text,
  comments,
  commentAction,
  replyAction,
  upvoteAction
}: SubmissionProps) {
  const [newComment, setNewComment] = useState('')

  const handleSubmitComment = async () => {
    await commentAction(id, newComment)
    setNewComment('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            <Link href={url} className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          <div className="text-sm text-gray-500">
            ({url})
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {/* <button className="text-gray-400 hover:text-[#ff6600]">
              <ChevronUp className="h-4 w-4" />
            </button> */}
            <span>{points} points</span>
            <span>by</span>
            <Link href={`/user/${author}`} className="hover:underline">
              {author}
            </Link>
            <span>{time}</span>
            <span>|</span>
            <span className="flex items-center">
              <MessageSquare className="mr-1 h-4 w-4" />
              {commentsCount} comments
            </span>
          </div>
          {text && <div className="mt-4 text-gray-700">{text}</div>}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Add a comment</h2>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          className="mb-2"
        />
        <Button onClick={handleSubmitComment}>Submit Comment</Button>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Comments</h2>
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} replyAction={replyAction} upvoteAction={upvoteAction} />
          ))}
        </div>
      </div>
    </div>
  )
}

