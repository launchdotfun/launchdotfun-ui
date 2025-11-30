import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroBanner() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden bg-card/50 border border-border p-4 mb-6 rounded-xl">
      <div className="relative z-10 px-6 py-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full text-xs text-foreground shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">The Future of Token Launches</span>
          </div>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create, launch, and manage your token presales with unparalleled financial privacy. Powered by Fully
            Homomorphic Encryption (FHE) via the Launch protocol, Launch.Fun lets users invest without ever revealing
            individual purchase amounts.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
            <Button
              size="default"
              className="px-6 py-2 shadow-lg hover:shadow-xl group"
              onClick={() => router.push("/create-launchpad")}
            >
              <Rocket className="w-4 h-4 group-hover:animate-bounce" />
              Launch Privately
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="default"
              className="bg-card text-foreground hover:bg-muted border-border px-6 py-2 shadow-sm hover:shadow-md group"
              asChild
            >
              <a
                href={"https://drive.google.com/file/d/12WK8mYl9Wst-00h34rqEQ8lOr-LC2L6y/view"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </a>
            </Button>

            <Button
              variant="outline"
              size="default"
              className="bg-card text-foreground hover:bg-muted border-border px-6 py-2 shadow-sm hover:shadow-md group"
              asChild
            >
              <a href={"https://github.com/zama-ai"} target="_blank" rel="noopener noreferrer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Instant Deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <span>Secure & Audited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
