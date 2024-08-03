import { prisma } from './db';

export const fetchPathways = async () => {
  try {
    const pathwayList = await prisma.pathways.findMany();
    
    return pathwayList;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
};
