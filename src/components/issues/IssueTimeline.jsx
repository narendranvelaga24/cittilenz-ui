import { formatDate } from "../../lib/format";

const fallbackSteps = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "ESCALATED", "REASSIGNED", "RESOLVED"];

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function normalizeHistoryItem(item) {
  const nextStatus = pickFirst(item?.newStatus, item?.status, item?.action, "Update");
  const previousStatus = pickFirst(item?.oldStatus);
  const remarks = pickFirst(item?.remarks, item?.message, item?.description, "Status changed");
  const actor = pickFirst(item?.changedByName, item?.actorName, item?.updatedByName);
  const timestamp = pickFirst(item?.changedAt, item?.createdAt, item?.timestamp);

  return {
    actor,
    key: item?.id || `${timestamp || "time"}-${nextStatus}`,
    label: nextStatus,
    message: previousStatus ? `${previousStatus} to ${nextStatus}${remarks ? `: ${remarks}` : ""}` : remarks,
    timestamp,
  };
}

export function IssueTimeline({ history = [], status }) {
  if (history.length) {
    return (
      <div className="timeline">
        {history.map((item, index) => {
          const normalized = normalizeHistoryItem(item);
          return (
            <div className="timeline-item" key={`${normalized.key}-${index}`}>
              <strong>{normalized.label}</strong>
              <span>{normalized.message}</span>
              {normalized.actor ? <small>By: {normalized.actor}</small> : null}
              <small>{formatDate(normalized.timestamp)}</small>
            </div>
          );
        })}
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
