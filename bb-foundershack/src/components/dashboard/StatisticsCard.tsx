"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BarChart4 } from 'lucide-react';
type Props = {
    userId: string;
};

const StatisticsCard = (userId: Props) => {

  const router = useRouter();
  return (
    <Card
      className="hover:cursor-pointer hover:opacity-75"
      onClick={() => {
        router.push(`/user/statistics/${userId.userId}`);
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold">Statistics</CardTitle>
        <BarChart4 size={28} strokeWidth={2.5} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Track your progression overtime.
        </p>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;