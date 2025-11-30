import Modals from "@/components/modals/Modals";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { generateMetadata } from "@/lib/utils/seo";
import type { Metadata } from "next";
import Script from "next/script";
import DataPrefetch from "@/components/layout/DataPrefetch";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  ...generateMetadata(),
  title: {
    default: "Launch.Fun – Confidential Token Launchpad",
    template: "%s | Launch.Fun",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`} suppressHydrationWarning>
        <div>
          <Providers>
            <Header />
            <div className="flex min-h-[calc(100vh-80px)]">
              <div className="hidden lg:block">
                <Sidebar />
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
              </div>
            </div>
            <DataPrefetch />
            <Modals />
            <Toaster
              duration={8000}
              position="top-right"
              richColors
              closeButton
              expand
              visibleToasts={3}
              toastOptions={{
                actionButtonStyle: {
                  backgroundColor: "#4A90E2",
                  color: "#FFFFFF",
                  borderRadius: "0px",
                  padding: "0.25rem 0.5rem",
                  border: "2px solid black",
                  boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
                },
                style: {
                  pointerEvents: "auto",
                  borderRadius: "0px",
                  border: "2px solid black",
                  boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                },
              }}
            />
          </Providers>
        </div>
        <Script
          src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"
          type="text/javascript"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
