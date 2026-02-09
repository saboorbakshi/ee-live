"use client"

import { useState, useMemo } from "react"
import rawData from "../data.json"
import DrawChart from "./components/DrawChart"
import InvitationChart from "./components/InvitationChart"
import PoolChart from "./components/PoolChart"
import Select from "./components/Select"
import { extractRounds, formatDrawData, formatInvitationData, getPoolDistribution, filterByTime } from "./utils"
import { ApiResponseSchema } from "./types"
import { PERIODS, POOL_VIEWS } from "./constants"

const data = ApiResponseSchema.parse(rawData)
const rounds = extractRounds(data)
const years = [...new Set(rounds.map(round => round.drawDate.getFullYear()))].sort((a, b) => b - a)

const TIME_OPTIONS = [
  { label: "Periods", options: PERIODS },
  { label: "Years", options: years.map(String) },
]

const latestRound = rounds[0]
const drawData = formatDrawData(rounds)
const invitationData = formatInvitationData(rounds, years)

export default function Home() {
  // drawChart
  const categories = Object.keys(drawData)
  const [category, setCategory] = useState(categories[1] || categories[0])
  const [timeOption, setTimeOption] = useState(PERIODS[PERIODS.length - 1])

  const filteredDrawData = useMemo(() => {
    return filterByTime(drawData[category], timeOption)
  }, [category, timeOption])

  // invitationChart
  const yearOptions = years.map(String)
  const [invitationYear, setInvitationYear] = useState(yearOptions[0])

  const filteredInvitationData = useMemo(() => {
    return invitationData.filter(d => d.year === Number(invitationYear))
  }, [invitationYear])

  const totalInvitations = useMemo(() => {
    return filteredInvitationData.reduce((sum, d) => sum + d.invitations, 0)
  }, [filteredInvitationData])

  // poolChart
  const poolViewOptions = Object.keys(POOL_VIEWS) as (keyof typeof POOL_VIEWS)[]
  const [poolView, setPoolView] = useState(poolViewOptions[0])

  const filteredPoolData = useMemo(() => {
    return getPoolDistribution(latestRound, poolView)
  }, [poolView])

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-xl flex-col py-8 sm:py-16 px-5 gap-12 sm:gap-16">
        <div className="-mb-2">
          <p className="text-4xl sm:text-5xl font-medium mb-4">Canada Express Entry Statistics</p>
          <p>Bio, why i built and who is it for? Me lol, so yeah, all data from 2020, etc...</p>
        </div>

        <section>
          <div className="mb-4 flex gap-2">
            <Select value={category} onValueChange={setCategory} options={categories} />
            <Select value={timeOption} onValueChange={setTimeOption} options={TIME_OPTIONS} />
          </div>
          <DrawChart data={filteredDrawData} />
        </section>

        <section>
          <div className="mb-4 flex gap-2">
            <Select value={invitationYear} onValueChange={setInvitationYear} options={yearOptions} />
          </div>
          <InvitationChart data={filteredInvitationData} total={totalInvitations} year={Number(invitationYear)} />
        </section>

        <section>
          <div className="mb-4 flex gap-2">
            <Select value={poolView} onValueChange={(v) => setPoolView(v as keyof typeof POOL_VIEWS)} options={poolViewOptions} />
          </div>
          <PoolChart data={filteredPoolData} total={latestRound.totalCandidates} />
        </section>
      </main>
    </div>
  )
}
