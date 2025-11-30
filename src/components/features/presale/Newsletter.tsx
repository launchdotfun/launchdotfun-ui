import Button from "@/components/common/Button";
import ComingSoonTooltipWrapper from "@/components/common/ComingSoonTooltipWrapper";
import Input from "@/components/common/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Newsletter() {
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">Newsletters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-xs text-neutral-400">
            Sign up our mailing list to receive our new presales, features, tips and reviews for next 1000x projects.
          </p>
          <Input
            placeholder="your@email.com"
            className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400"
          />
          <ComingSoonTooltipWrapper comingSoon={true}>
            <Button className="w-full bg-primary hover:bg-primary/80 text-black">Subscribe</Button>
          </ComingSoonTooltipWrapper>
        </div>
      </CardContent>
    </Card>
  );
}
