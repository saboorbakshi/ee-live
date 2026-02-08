import rawData from "../data.json";
import CRSChart from "./components/CRSChart";

interface Round {
  drawNumber: string;
  drawDateFull: string;
  drawSize: string;
  drawCRS: string;
  drawText2: string;
  drawDistributionAsOn: string;
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
    drawNumber: r.drawNumber,
    drawDateFull: r.drawDateFull,
    drawSize: r.drawSize,
    drawCRS: r.drawCRS,
    drawText2: r.drawText2,
    drawDistributionAsOn: r.drawDistributionAsOn,
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

function deduplicateByDistribution(rounds: Round[]): Round[] {
  const seen = new Set<string>();
  return rounds.filter((r) => {
    if (seen.has(r.drawDistributionAsOn)) return false;
    seen.add(r.drawDistributionAsOn);
    return true;
  });
}

export default function Home() {
  const rounds = extractData(rawData.payload.rounds);

  // De-duplicate dd1-dd18 by unique drawDistributionAsOn
  const uniqueDistributions = deduplicateByDistribution(rounds);

  // Chart data: all rounds, reversed for chronological order (oldest first)
  const chartData = [...rounds].reverse().map((r, i) => ({
    index: i + 1,
    drawCRS: Number(r.drawCRS),
    drawNumber: r.drawNumber,
    drawDateFull: r.drawDateFull,
    drawText2: r.drawText2,
  }));

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-xl flex-col py-8 sm:py-16 px-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-lg">Lowest CRS Score</p>
            <p className="text-5xl">549</p>
            <p className="text-foreground2 mt-1">January 21, 2026</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg mb-4">CRS Score History</h2>
          <CRSChart data={chartData} />
        </div>
      </main>
    </div>
  );
}
