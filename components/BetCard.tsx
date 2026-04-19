// /components/BetCard.tsx

type Props = {
  number: number;
  amount: string;
  percent: string;
};

export default function BetCard({ number, amount, percent }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center transition duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer">
      <p className="text-lg font-semibold">{number}</p>
      <p className="text-xs opacity-60">{amount}</p>
      <p className="text-xs opacity-40">{percent}</p>
    </div>
  );
}
