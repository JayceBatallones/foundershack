'use client'
import React from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { createPathwayQuizSchema } from '@/schemas/pathways'
import z from 'zod'
import { useRouter } from 'next/navigation'


import LoadingQuestions from '@/components/pathways/LoadingPathwayQuestions'
import { useToast } from '@/components/ui/use-toast'

type Props = {
    params:{
        type: "skills" | "subTopics" | "topics";
        name: string;
    }
}

const LoadingPage = ({params: { type, name }}: Props) => {
    const [finishedLoading, setFinishedLoading] = React.useState(false);
    const { toast } = useToast()
    name = decodeURIComponent(name)
    const router = useRouter()
    const { mutate: createPathwayQuiz, isLoading } = useMutation({
        mutationFn: async () => {
            const payload: z.infer<typeof createPathwayQuizSchema> = {
                type: type,
                name: name,
            };

            // Make Quiz 
            const quizResponse = await axios.post("/api/makePathwayQuiz", payload)
            // Make attempt for Quiz

            const quizId = quizResponse.data.quizId
            const response = await axios.post("/api/game", { quizId });

            return response.data;
        },
    });

    React.useEffect(() => {
 
        createPathwayQuiz(undefined, {
            onError: (error) => {
                toast({
                    title: "Error",
                    description: "Something went wrong. Please try again later.",
                    variant: "destructive",
                  });
                router.push(`/`)
            },
            onSuccess: (data) => {
                router.push(`/play/mcq/${data.attemptId}`)

                setFinishedLoading(true);
            },
        });
    }, []);

    return (
         <LoadingQuestions finished={finishedLoading}/>
    )
}

export default LoadingPage
