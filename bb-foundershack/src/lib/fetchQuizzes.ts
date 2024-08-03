import { prisma } from './db';

// Fetch quizzes where duration is not equal to -1
export const fetchQuizzes = async () => {
  try {
    const quizList = await prisma.quiz.findMany({
      where: {
        duration: {
          not: -1,
        },
      },
    });

    return quizList;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
};