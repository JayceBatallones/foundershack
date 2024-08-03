import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass } from "lucide-react";

import { format } from "date-fns";

type Props = {
  timeTaken: Date;
};

const TimeTakenCard = ({ timeTaken }: Props) => {

  const isoString: string = timeTaken.toISOString();
  const timeString: string = isoString.slice(11, 19);

  return (
    <Card className="md:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold">Time Taken</CardTitle>
        <Hourglass />
      </CardHeader>
      <CardContent>
        <div className="text-sm font-medium">{timeString}</div>
      </CardContent>
    </Card>
  );
};

export default TimeTakenCard;
