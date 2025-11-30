import { ManageAssetsView } from "@/components/features/manage-assets";
import { generateMetadata } from "@/lib/utils/seo";

export const metadata = generateMetadata({
  title: "Manage Assets",
  description: "Keep track of the presales and tokens you've launched.",
});

export default function ManageAssetsPage() {
  return (
    <div className="max-w-6xl mx-auto w-full py-10 px-4 lg:px-0">
      <ManageAssetsView />
    </div>
  );
}
