import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { TimelineEvent } from "@/features/escrow/api/agreement";
import { shortAddress } from "@/lib/web3/wallet";

interface Props {
  events: TimelineEvent[];
  height?: number;
}

const STAGES: TimelineEvent["type"][] = [
  "AgreementFunded",
  "WorkSubmitted",
  "DisputeRaised",
  "DisputeResolved",
  "FundsReleased",
  "ClientRefunded",
];

const COLOR: Record<TimelineEvent["type"], string> = {
  AgreementFunded: "#6366f1",
  WorkSubmitted: "#22d3ee",
  DisputeRaised: "#ef4444",
  DisputeResolved: "#a855f7",
  FundsReleased: "#22c55e",
  ClientRefunded: "#f59e0b",
};

// React owns the lifecycle; D3 paints inside the SVG via a ref + useEffect.
export function EscrowTimelineChart({ events, height = 220 }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const wrapWidth = wrapRef.current?.clientWidth ?? 800;
    const margin = { top: 24, right: 24, bottom: 36, left: 110 };
    const width = wrapWidth;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Y axis = the discrete event types (stages of the escrow lifecycle).
    const y = d3
      .scalePoint<string>()
      .domain(STAGES)
      .range([0, innerH])
      .padding(0.5);

    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .call((sel) => sel.select(".domain").remove())
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "12px");

    // Horizontal guideline through each stage.
    g.append("g")
      .selectAll("line")
      .data(STAGES)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", (d) => y(d) ?? 0)
      .attr("y2", (d) => y(d) ?? 0)
      .attr("stroke", "#243155")
      .attr("stroke-dasharray", "3,3");

    if (events.length === 0) {
      g.append("text")
        .attr("x", innerW / 2)
        .attr("y", innerH / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "13px")
        .text("No on-chain events yet — fund the agreement to begin.");
      return;
    }

    // X axis = block number (best-effort proxy for time).
    const minBlock = d3.min(events, (e) => e.blockNumber) ?? 0;
    const maxBlock = d3.max(events, (e) => e.blockNumber) ?? minBlock + 1;
    const x = d3
      .scaleLinear()
      .domain([minBlock, Math.max(maxBlock, minBlock + 1)])
      .range([0, innerW])
      .nice();

    const xAxis = d3
      .axisBottom(x)
      .ticks(Math.min(8, events.length))
      .tickFormat((d) => `#${d}`);
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .call((sel) => sel.selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px"))
      .call((sel) => sel.select(".domain").attr("stroke", "#243155"))
      .call((sel) => sel.selectAll("line").attr("stroke", "#243155"));

    // The "happy path" connector: chain ordered events into a single polyline
    // so the user can read the lifecycle direction at a glance.
    const ordered = [...events].sort((a, b) => a.blockNumber - b.blockNumber);

    g.append("path")
      .datum(ordered)
      .attr("fill", "none")
      .attr("stroke", "#7c83ff")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6)
      .attr(
        "d",
        d3
          .line<TimelineEvent>()
          .x((d) => x(d.blockNumber))
          .y((d) => y(d.type) ?? 0)
          .curve(d3.curveMonotoneX) as any,
      );

    // Event dots.
    const dots = g
      .append("g")
      .selectAll("circle")
      .data(ordered)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.blockNumber))
      .attr("cy", (d) => y(d.type) ?? 0)
      .attr("r", 6)
      .attr("fill", (d) => COLOR[d.type])
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 2);

    // Native browser tooltip — keeps the demo focused without extra deps.
    dots.append("title").text(
      (d) =>
        `${d.type}\nblock #${d.blockNumber}\nactor: ${shortAddress(d.actor)}` +
        (d.detail ? `\n${d.detail}` : ""),
    );
  }, [events, height]);

  return (
    <div ref={wrapRef} style={{ width: "100%", overflowX: "auto" }}>
      <svg ref={ref} role="img" aria-label="Escrow event timeline" />
    </div>
  );
}
