import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export default function FeeStructure() {
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">FEE STRUCTURE</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Platform Fee:</span>
          <span className="text-white">0%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Token Fee:</span>
          <span className="text-white">0%</span>
        </div>
        <div className="border-t border-neutral-700 pt-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-neutral-400">Total Fees:</span>
            <span className="text-primary">0%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
