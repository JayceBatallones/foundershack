import { fetchQuizzes } from '@/lib/fetchQuizzes';
import QuizCreation from '@/components/forms/QuizCreation';
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

const QuizPage = async () => {
  const { userId } = auth()

  if (!userId) {
    return redirect("/");
  }
  const quizList = await fetchQuizzes();
  return <QuizCreation quizList={quizList} />;
};

export default QuizPage;