import "./TopGauges.css";
import { TurnSignal } from "./TurnSignal";

export function TopGauges() {
  return `
    <div id="top-gauges">
      ${TurnSignal("left")}
      ${TurnSignal("right")}
    </div>
  `;
}
