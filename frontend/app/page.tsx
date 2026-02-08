"use client";

import rawData from "../data.json";
import { useState, useMemo } from "react";
import Select from "./components/Select";
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
  { index: number; drawCRS: number; drawSize: string; drawDateFull: string; drawCategory: string }[]
> = {};
for (const category of categories) {
  chartDataByCategory[category] = [...grouped[category]].reverse().map((r, i) => ({
    index: i + 1,
    drawCRS: Number(r.drawCRS),
    drawSize: r.drawSize,
    drawDateFull: r.drawDateFull,
    drawCategory: r.drawCategory,
  }));
}

export default function Home() {
  const [category, setCategory] = useState("Canadian Experience Class");
  const data = useMemo(() => chartDataByCategory[category] ?? [], [category]);

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-xl flex-col py-8 sm:py-16 px-5">
        <Select
          value={category}
          onValueChange={setCategory}
          options={categories}
          className="mb-6"
        />
        <CRSChart data={data} />
      </main>
    </div>
  );
}
