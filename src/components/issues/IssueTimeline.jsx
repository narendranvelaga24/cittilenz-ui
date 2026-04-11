import { formatDate } from "../../lib/format";

const fallbackSteps = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

export function IssueTimeline({ history = [], status }) {
  if (history.length) {
    return (
      <div className="timeline">
        {history.map((item, index) => (
          <div className="timeline-item" key={item.id || `${item.status}-${index}`}>
            <strong>{item.status || item.action || "Update"}</strong>
            <span>{item.remarks || item.message || "Status changed"}</span>
            <small>{formatDate(item.createdAt || item.timestamp)}</small>
          </div>
        ))}
      </div>
    );
  }

  const activeIndex = Math.max(0, fallbackSteps.indexOf(status));
  return (
    <div className="timeline compact">
      {fallbackSteps.map((step, index) => (
        <div className={`timeline-item ${index <= activeIndex ? "active" : ""}`} key={step}>
          <strong>{step.replace("_", " ")}</strong>
        </div>
      ))}
    </div>
  );
}
