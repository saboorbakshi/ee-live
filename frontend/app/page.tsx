"use client";

import rawData from "../data.json";
import { useState, useMemo } from "react";
import Select from "./components/Select";
import CRSChart from "./components/CRSChart";
import InvitationChart from "./components/InvitationChart";

interface Round {
  drawDate: string;
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
  return rounds.filter((r) => {
    const year = parseInt(r.drawDateFull.split(", ").pop() ?? "0", 10);
    return year >= 2020;
  }).map((r) => ({
    drawDate: r.drawDate,
    drawDateFull: r.drawDateFull,
    drawSize: r.drawSize,
    drawCRS: r.drawCRS,
    drawCategory: r.drawName.replace(/Version /gi, "V").replace(/ occupations/gi, ""),
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

const rounds = extractData(rawData.payload.rounds);
const uniqueDistributions = deduplicateByDistributionDate(rounds);
const grouped = groupByCategory(rounds);
const categories = Object.keys(grouped);

const chartDataByCategory: Record<
  string,
  { index: number; drawDate: string; drawCRS: number; drawSize: string; drawDateFull: string; drawCategory: string }[]
> = {};
for (const category of categories) {
  chartDataByCategory[category] = [...grouped[category]].reverse().map((r, i) => ({
    index: i + 1,
    drawDate: r.drawDate,
    drawCRS: Number(r.drawCRS),
    drawSize: r.drawSize,
    drawDateFull: r.drawDateFull,
    drawCategory: r.drawCategory,
  }));
}

const timeOptions = ["1Y", "2Y", "All", "2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const yearOptions = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

function filterByTime(
  data: typeof chartDataByCategory[string],
  period: string,
) {
  let filtered;
  if (period === "All") {
    filtered = data;
  } else if (period === "1Y" || period === "2Y") {
    const cutoff = new Date();
    const years = period === "1Y" ? 1 : 2;
    cutoff.setFullYear(cutoff.getFullYear() - years);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    filtered = data.filter((d) => d.drawDate >= cutoffStr);
  } else {
    filtered = data.filter((d) => d.drawDate.startsWith(period));
  }
  return filtered.map((d, i) => ({ ...d, index: i + 1 }));
}

export default function Home() {
  const [category, setCategory] = useState("Canadian Experience Class");
  const [timePeriod, setTimePeriod] = useState("1Y");
  const [invitationYear, setInvitationYear] = useState("2026");
  const filteredScores = useMemo(
    () => filterByTime(chartDataByCategory[category] ?? [], timePeriod),
    [category, timePeriod],
  );

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-xl flex-col py-8 sm:py-16 px-5 gap-16">
        <div>
          <div className="mb-6 flex gap-2">
            <Select
              value={category}
              onValueChange={setCategory}
              options={categories}
            />
            <Select
              value={timePeriod}
              onValueChange={setTimePeriod}
              options={timeOptions}
            />
          </div>
          <CRSChart data={filteredScores} />
        </div>

        <div>
          <div className="mb-6 flex gap-2">
            <Select
              value={invitationYear}
              onValueChange={setInvitationYear}
              options={yearOptions}
            />
          </div>
          <InvitationChart data={rounds} year={invitationYear} />
        </div>
      </main>
    </div>
  );
}

