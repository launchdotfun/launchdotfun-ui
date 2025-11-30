"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileCode, Monitor, Play, Rocket } from "lucide-react";
import Link from "next/link";

export default function AboutView() {
  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto">
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border py-4">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl font-bold text-foreground tracking-tight">About Launch.Fun</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4 text-foreground">
            <p className="text-base leading-relaxed">
              <strong className="text-primary">Launch.Fun</strong> is a decentralized launchpad platform (DApp) built on
              the Launch blockchain, enabling users to create and participate in token presales securely and
              transparently.
            </p>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-2">
                <li>Create new tokens with customizable parameters</li>
                <li>Create and manage presale launchpads for your tokens</li>
                <li>Participate in investments for active presales</li>
                <li>Manage assets and track presales you&apos;ve participated in</li>
                <li>Support for zWETH (wrapped ETH) for secure transactions</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Technology:</h3>
              <p className="text-base text-muted-foreground">
                The DApp is built with Next.js, React, and integrates with the Launch Relayer SDK to ensure security and
                privacy for transactions. Smart contracts are deployed on the Launch blockchain with support for Fully
                Homomorphic Encryption (FHE).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="default" size="lg" className="flex-1">
                <Link
                  href="https://github.com/launchdotfun/smart-contracts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <FileCode className="w-5 h-5" />
                  <span>Smart Contracts</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>

              <Button asChild variant="default" size="lg" className="flex-1">
                <Link
                  href="https://github.com/launchdotfun/launchdotfun-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Monitor className="w-5 h-5" />
                  <span>Frontend Interface</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link
                  href="https://www.youtube.com/watch?v=your-video-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Video Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
