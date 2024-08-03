'use client'
import { Pathways } from "@prisma/client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import z from "zod"
import { pathwaySchema } from "@/schemas/pathway";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import LoadingQuestions from "./LoadingPathways";



type Props = {
  pathwaysList: Pathways[];
  realUserId: {
    userId: string;
}
};

const PathwaysCards = ({ pathwaysList, realUserId }: Props) => {

  const router = useRouter();
  const { toast } = useToast()
  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);

  const gridColumns = [
    "grid-cols-1",
    "sm:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-4",
    "xl:grid-cols-5",
  ];

  const getGridColsClass = (numItems: number) => {
    if (numItems >= 5) return gridColumns.join(" ");
    return gridColumns.slice(0, numItems).join(" ");
  };

  const { mutate: selectPathway, isLoading } = useMutation({
    mutationFn: async (pathwayId: string) => {

      const payload: z.infer<typeof pathwaySchema> = {
        pathwayId: pathwayId,
        userId: realUserId.userId,
      };
      const response = await axios.post("/api/pathways", payload); 

      return response.data;
    },
  });


  const onSubmit = async (pathwayId: string) => {

    setShowLoader(true);
    selectPathway(pathwayId, {
      onError: (error) => {
        setShowLoader(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 500) {
            toast({
              title: "Error",
              description: "Something went wrong. Please try again later.",
              variant: "destructive",
            });
          }
        }
      },
      onSuccess: ({ userPathwayId }: { userPathwayId: string }) => {

        setFinishedLoading(true);

        setTimeout(() => {
          router.push(`pathways/${userPathwayId}`)
        }, 2000);
      },
    });
  };

  if (showLoader) {
    return <LoadingQuestions finished={finishedLoading}/>
  }
  

  return (
    <div className="flex justify-center items-center h-[calc(100vh-56px)]">
      <div
        className={`grid gap-6 p-4 ${getGridColsClass(pathwaysList.length)}`}
        style={{ justifyItems: "center" }}
      >
        {pathwaysList.map((pathway) => (
          <Card
            key={pathway.pathwayId}
            className="w-[260px] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus-within:scale-[1.02] focus-within:shadow-md"
          >
            <CardHeader className="mb-auto">
              <CardTitle className="text-wrap text-xl font-bold">
                {pathway.name}
              </CardTitle>
              <CardDescription>
                {pathway.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled={isLoading}
                onClick={() => onSubmit(pathway.pathwayId)
                  
                }
              >
                Start
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PathwaysCards;
