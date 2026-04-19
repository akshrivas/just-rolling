// /components/StatsBar.tsx

export default function StatsBar() {
  return (
    <div className="flex gap-3 mt-4">
      <Stat label="Pool" value="₹12,430" />
      <Stat label="Payout" value="₹11,187" />
      <Stat label="Cut" value="₹1,243" />
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl text-center min-w-[90px]">
      <p className="text-xs opacity-60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
