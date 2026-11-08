import { z } from 'zod'

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
  answerIndex: z.int(),
})
export type QuizSubmit = z.infer<typeof QuizSubmit>

export const QuizResult = z.object({
  correct: z.boolean(),
  correctAnswerIndex: z.int(),
  streak: z.int(),
  totalAnswered: z.int(),
  correctCount: z.int(),
})
export type QuizResult = z.infer<typeof QuizResult>