import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export default function Requirements({
  validTokenAddress,
  fundingGoalsSet,
  timelineSet,
  projectDescriptionProvided,
}: {
  validTokenAddress: boolean;
  fundingGoalsSet: boolean;
  timelineSet: boolean;
  projectDescriptionProvided: boolean;
}) {
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">REQUIREMENTS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${validTokenAddress ? "bg-primary" : "bg-neutral-600"}`} />
          <span className={validTokenAddress ? "text-white" : "text-neutral-400"}>Valid token contract</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${fundingGoalsSet ? "bg-primary" : "bg-neutral-600"}`} />
          <span className={fundingGoalsSet ? "text-white" : "text-neutral-400"}>Set funding goals</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${timelineSet ? "bg-primary" : "bg-neutral-600"}`} />
          <span className={timelineSet ? "text-white" : "text-neutral-400"}>Set timeline</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${projectDescriptionProvided ? "bg-primary" : "bg-neutral-600"}`} />
          <span className={projectDescriptionProvided ? "text-white" : "text-neutral-400"}>Project description</span>
        </div>
      </CardContent>
    </Card>
  );
}
