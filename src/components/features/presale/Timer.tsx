import useTimerCountdown from "@/lib/hooks/useTimerCountdown";

export default function CountdownTimer({ to }: { to: number | undefined }) {
  const countdown = useTimerCountdown({
    to: to,
  });

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      <div className="bg-muted border border-border p-2 sm:p-3 text-center rounded-lg shadow-sm">
        <div className="text-xl sm:text-2xl font-bold text-primary font-sans">{countdown?.formatted.day || "00"}</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-sans">Days</div>
      </div>
      <div className="bg-muted border border-border p-2 sm:p-3 text-center rounded-lg shadow-sm">
        <div className="text-xl sm:text-2xl font-bold text-primary font-sans">{countdown?.formatted.hour || "00"}</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-sans">Hours</div>
      </div>
      <div className="bg-muted border border-border p-2 sm:p-3 text-center rounded-lg shadow-sm">
        <div className="text-xl sm:text-2xl font-bold text-primary font-sans">
          {countdown?.formatted.minute || "00"}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-sans">Min</div>
      </div>
      <div className="bg-muted border border-border p-2 sm:p-3 text-center rounded-lg shadow-sm">
        <div className="text-xl sm:text-2xl font-bold text-primary font-sans">
          {countdown?.formatted.second || "00"}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-sans">Sec</div>
      </div>
    </div>
  );
}
