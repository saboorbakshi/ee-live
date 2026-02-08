import rawData from "../data.json";
import CRSChart from "./components/CRSChart";

interface Round {
  drawDateFull: string;
  drawSize: string;
  drawCRS: string;
  drawCategory: string;
  drawDistributionDate: string;
  dd1: string;
  dd2: string;
  dd3: string;
  dd4: string;
  dd5: string;
  dd6: string;
  dd7: string;
  dd8: string;
  dd9: string;
  dd10: string;
  dd11: string;
  dd12: string;
  dd13: string;
  dd14: string;
  dd15: string;
  dd16: string;
  dd17: string;
  dd18: string;
}

function extractData(rounds: Record<string, string>[]): Round[] {
  return rounds.map((r) => ({
    drawDateFull: r.drawDateFull,
    drawSize: r.drawSize,
    drawCRS: r.drawCRS,
    drawCategory: r.drawName,
    drawDistributionDate: r.drawDistributionAsOn,
    dd1: r.dd1,
    dd2: r.dd2,
    dd3: r.dd3,
    dd4: r.dd4,
    dd5: r.dd5,
    dd6: r.dd6,
    dd7: r.dd7,
    dd8: r.dd8,
    dd9: r.dd9,
    dd10: r.dd10,
    dd11: r.dd11,
    dd12: r.dd12,
    dd13: r.dd13,
    dd14: r.dd14,
    dd15: r.dd15,
    dd16: r.dd16,
    dd17: r.dd17,
    dd18: r.dd18,
  }));
}

function deduplicateByDistributionDate(rounds: Round[]): Round[] {
  const seen = new Set<string>();
  return rounds.filter((r) => {
    if (seen.has(r.drawDistributionDate)) return false;
    seen.add(r.drawDistributionDate);
    return true;
  });
}

function groupByCategory(rounds: Round[]): Record<string, Round[]> {
  const groups: Record<string, Round[]> = {};
  for (const r of rounds) {
    if (!groups[r.drawCategory]) groups[r.drawCategory] = [];
    groups[r.drawCategory].push(r);
  }
  return groups;
}

export default function Home() {
  const rounds = extractData(rawData.payload.rounds);
  const uniqueDistributions = deduplicateByDistributionDate(rounds);
  const grouped = groupByCategory(rounds);

  const category = "Canadian Experience Class";
  const categoryRounds = grouped[category] ?? [];

  const chartData = [...categoryRounds].reverse().map((r, i) => ({
    index: i + 1,
    drawCRS: Number(r.drawCRS),
    drawSize: r.drawSize,
    drawDateFull: r.drawDateFull,
    drawCategory: r.drawCategory,
  }));

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-xl flex-col py-8 sm:py-16 px-5">
        <CRSChart data={chartData} />
      </main>
    </div>
  );
}
