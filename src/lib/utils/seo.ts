import { Metadata } from "next";

export type TSEO = {
  title: string;
  keywords?: string[];
  description: string;
  thumbnail: string;
};

const defaultSEO: TSEO = {
  title: "Launch.Fun – Privacy-Preserving Launchpad Protocol",
  description:
    "Launch.Fun is a decentralized launchpad focused on financial privacy, powered by Fully Homomorphic Encryption (FHE).",
  thumbnail: "/thumbnail.png",
  keywords: ["Launch", "Launchpad", "Confidential DeFi", "FHE"],
};

export function generateMetadata({ title, description, thumbnail, keywords }: Partial<TSEO> = {}): Metadata {
  return {
    title: title ?? defaultSEO.title,
    description: description ?? defaultSEO.description,
    // metadataBase: new URL(""),
    keywords: keywords ?? defaultSEO.keywords,
    twitter: {
      title: title ?? defaultSEO.title,
      description: description ?? defaultSEO.description,
      images: [thumbnail ?? defaultSEO.thumbnail],
      site: "@zama_fhe",
    },
    openGraph: {
      title: title ?? defaultSEO.title,
      description: description ?? defaultSEO.description,
      images: [thumbnail ?? defaultSEO.thumbnail],
      siteName: "launch.fun",
    },
  };
}
