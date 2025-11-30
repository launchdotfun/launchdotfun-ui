"use client";

import { getPresaleStatus, usePresaleListQuery } from "@/lib/presales/hooks";
import { EPresaleStatus } from "@/lib/presales/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import PresaleItem from "./PresaleItem";
import StatsOverview from "./StatsOverview";

export default function HomeView() {
  const {
    data: presaleList,
    isLoading,
    isPending,
  } = usePresaleListQuery(undefined, {
    enabled: true,
    refetchInterval: 20_000,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLaunches = useMemo(() => {
    return presaleList?.filter((launch) => {
      const matchesSearch =
        launch.token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        launch.token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        launch.description.toLowerCase().includes(searchTerm.toLowerCase());
      const status = getPresaleStatus(launch);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [presaleList, searchTerm, statusFilter]);

  return (
    <div className="py-6 space-y-6">
      {/* Hero Banner
      <HeroBanner /> */}

      {/* Stats Overview */}
      <StatsOverview />

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Launches */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-xl font-bold text-foreground tracking-tight">Token Launches</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search launches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-input border-border text-foreground placeholder-muted-foreground max-w-120"
                />
              </div>
              <div className="">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-input border-border text-foreground w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border" side="bottom" align="end">
                    <SelectItem value="all" className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer">
                      All Status
                    </SelectItem>
                    <SelectItem
                      value={EPresaleStatus.Upcoming}
                      className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer"
                    >
                      Upcoming
                    </SelectItem>
                    <SelectItem
                      value={EPresaleStatus.Active}
                      className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer"
                    >
                      Active
                    </SelectItem>
                    <SelectItem
                      value={EPresaleStatus.Completed}
                      className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer"
                    >
                      Completed
                    </SelectItem>
                    <SelectItem
                      value={EPresaleStatus.Failed}
                      className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer"
                    >
                      Failed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isLoading || isPending ? (
              <>
                <div className="flex items-center justify-center py-10 flex-col gap-2 text-primary">
                  <Loader2 className="size-[1.5em] animate-spin" />
                  <span className="font-sans text-sm font-medium">Loading data...</span>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredLaunches?.map((launch) => {
                    return <PresaleItem key={launch.presaleAddress} presale={launch} />;
                  })}
                  {filteredLaunches?.length === 0 && (
                    <div className="cols-span-1 lg:col-span-2 flex flex-col items-center justify-center text-center text-muted-foreground py-10 gap-2 bg-muted/50 border border-dashed border-border rounded-lg">
                      <SearchX className="size-12 opacity-50" />
                      <span className="font-bold">No launches found matching your criteria.</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
