import { TPresale } from "@/lib/presales/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Globe, Heart, MessageSquare, Share2 } from "lucide-react";

export default function BannerAndToken({ launchpadData }: { launchpadData: TPresale }) {
  return (
    <Card className="bg-card border-border overflow-hidden py-0">
      <div
        className="aspect-[3.85] bg-primary/20 relative"
        style={
          launchpadData.thumbnail
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7)), url(${launchpadData.thumbnail || "/images/default-banner.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "transparent",
              }
            : {}
        }
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 lg:left-6 flex items-center gap-2 sm:gap-3 lg:gap-4 max-w-[calc(100%-1rem)] sm:max-w-none">
          <Avatar className="size-12 sm:size-14 lg:size-16 flex-shrink-0">
            <AvatarImage src={launchpadData.token.icon || "/images/empty-token.webp"} alt={launchpadData.token.name} />
            <AvatarFallback className="bg-primary text-white text-xs sm:text-sm lg:text-base">
              {launchpadData.token.symbol}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{launchpadData.name}</h1>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
              <Badge className="bg-primary text-white text-[10px] sm:text-xs">PRESALE</Badge>
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
