import { PresaleView } from "@/components/features/presale";
import { generateMetadata } from "@/lib/utils/seo";

export const metadata = generateMetadata({
  title: "Launchpad Detail",
});

export default function LaunchpadDetailPage() {
  return (
    <>
      <PresaleView />
    </>
  );
}
