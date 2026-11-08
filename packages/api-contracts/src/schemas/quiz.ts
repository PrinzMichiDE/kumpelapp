import { z } from 'zod'
import { ReviewStatus } from './common'

export const QuizQuestionDto = z.object({
  id: z.string(),
  question: z.string(),
  answers: z.array(z.object({
    text: z.string(),
    correct: z.boolean(),
  })),
  category: z.string().nullable(),
  generatedBy: z.string().nullable(),
  sourceRef: z.string().nullable(),
  reviewStatus: ReviewStatus,
})
export type QuizQuestionDto = z.infer<typeof QuizQuestionDto>

export const QuizAttemptDto = z.object({
  id: z.string(),
  userId: z.string(),
  questionId: z.string(),
  correct: z.boolean(),
  createdAt: z.string().datetime(),
})
export type QuizAttemptDto = z.infer<typeof QuizAttemptDto>

export const QuizSubmit = z.object({
  questionId: z.string(),
  answerIndex: z.number().int(),
})
export type QuizSubmit = z.infer<typeof QuizSubmit>

export const QuizResult = z.object({
  correct: z.boolean(),
  correctAnswerIndex: z.number().int(),
  streak: z.number().int(),
  totalAnswered: z.number().int(),
  correctCount: z.number().int(),
})
export type QuizResult = z.infer<typeof QuizResult>