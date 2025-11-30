import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export default function About({ description }: { description: string }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">About</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed">{description}</div>
      </CardContent>
    </Card>
  );
}
