import { CreateTokenView } from "@/components/features/create-token";
import { generateMetadata } from "@/lib/utils/seo";
import React from "react";

export const metadata = generateMetadata({
  title: "Create Token",
  description: "Create your own token with ease using our token creation tool.",
});

export default function CreateTokenPage() {
  return (
    <>
      <CreateTokenView />
    </>
  );
}
