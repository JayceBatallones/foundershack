import { prisma } from './db';

// TODO this needs to be changed to only fetch quizzes assigned to users
export const fetchQuizzes = async () => {
  try {
    const quizList = await prisma.quiz.findMany();
    
    return quizList;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
};
