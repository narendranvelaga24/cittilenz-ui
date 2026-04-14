import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createIssue } from "../../api/issues.api";
import { getIssueTypes } from "../../api/issueTypes.api";
import { predictIssue } from "../../api/ai.api";
import { lookupWard } from "../../api/wards.api";
import { FileUpload } from "../../components/ui/FileUpload.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { useQueryClient } from "@tanstack/react-query";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function ReportIssuePage() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [image, setImage] = useState(null);
  const [coords, setCoords] = useState(null);
  const [ward, setWard] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [issueTypeId, setIssueTypeId] = useState("");
  const [selectedIssueType, setSelectedIssueType] = useState(null);
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const [loadingStep, setLoadingStep] = useState("");
  const [aiPredictionFailed, setAiPredictionFailed] = useState(false);
  const wardLookupCache = useRef(new Map());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ message: "", tone: "info" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast.message]);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
  }

  const { data: issueTypes = [], isLoading: issueTypesLoading } = useQuery({
    queryKey: ["issue-types", "all"],
    queryFn: () => getIssueTypes(),
    staleTime: 10 * 60_000,
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleImage(file) {
    setPrediction(null);
    setIssueTypeId("");
    setSelectedIssueType(null);
    setAiPredictionFailed(false);
    setImage(file);
  }

  async function captureLocation() {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by this browser.", "danger");
      return;
    }
    setLoadingStep("location");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
        };
        setCoords(nextCoords);
        try {
          const cacheKey = `${nextCoords.lat.toFixed(5)}:${nextCoords.lng.toFixed(5)}`;
          const cachedWard = wardLookupCache.current.get(cacheKey);
          const wardResult = cachedWard || await lookupWard(nextCoords.lat, nextCoords.lng);
          if (!cachedWard) {
            wardLookupCache.current.set(cacheKey, wardResult);
          }
          setWard(wardResult);
          showToast(`Location detected in ${wardResult.wardName}.`, "success");
        } catch (err) {
          setWard(null);
          showToast(errorMessage(err), "danger");
        } finally {
          setLoadingStep("");
        }
      },
      (geoError) => {
        setLoadingStep("");
        showToast(geoError.message || "Location permission was denied.", "danger");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }

  async function analyzeImage() {
    setAiPredictionFailed(false);
    if (!image) {
      showToast("Image file is required.", "danger");
      return;
    }
    setLoadingStep("ai");
    try {
      const result = await predictIssue(image);

      if (!result || typeof result !== "object") {
        throw new Error("AI service returned invalid response.");
      }
      if (!result.issue) {
        throw new Error("AI service returned empty response.");
      }

      const confidence = Number(result.confidence ?? 0);
      const mappedIssueTypeId = result.issueTypeId ?? null;
      const matchedIssueType = issueTypes.find((type) => String(type.id) === String(mappedIssueTypeId));
      const shouldAutoSelect = Boolean(mappedIssueTypeId) && confidence >= 0.7;

      setPrediction({
        issue: result.issue,
        confidence: confidence,
        issueTypeId: mappedIssueTypeId,
        autoSelected: shouldAutoSelect,
      });

      if (shouldAutoSelect && matchedIssueType) {
        setIssueTypeId(String(mappedIssueTypeId));
        setSelectedIssueType(matchedIssueType);
        showToast(`AI suggested ${result.issue} with ${Math.round(confidence * 100)}% confidence.`, "success");
        setAiPredictionFailed(false);
      } else if (!mappedIssueTypeId) {
        setIssueTypeId("");
        setSelectedIssueType(null);
        showToast("AI identified a type not in the system. Please select issue type and department manually.", "warning");
        setAiPredictionFailed(false);
      } else {
        setIssueTypeId("");
        setSelectedIssueType(null);
        showToast(`AI confidence is low (${Math.round(confidence * 100)}%). Please verify issue type before submitting.`, "warning");
        setAiPredictionFailed(false);
      }
    } catch (err) {
      setPrediction({ autoSelected: false });
      setAiPredictionFailed(true);
      const errMsg = errorMessage(err);
      if (errMsg.includes("service unavailable") || errMsg.includes("timeout")) {
        showToast("AI service unavailable. Please try again.", "danger");
      } else if (errMsg.includes("empty response")) {
        showToast("AI service returned empty response. Please try again.", "danger");
      } else if (errMsg.includes("Image file")) {
        showToast(errMsg, "danger");
      } else {
        showToast(errMsg || "Failed to predict issue type. Please try again.", "danger");
      }
    } finally {
      setLoadingStep("");
    }
  }

  async function submitIssue(event) {
    event.preventDefault();
    if (!coords || !ward) {
      showToast("Capture a valid location and ward before submitting.", "danger");
      return;
    }
    if (!prediction) {
      showToast("Run AI prediction before creating the issue. If AI fails, select issue type manually after the attempt.", "danger");
      return;
    }
    if (!issueTypeId) {
      showToast("Select an issue type before submitting.", "danger");
      return;
    }
    if (!image) {
      showToast("Image is required.", "danger");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("latitude", coords.lat);
    payload.append("longitude", coords.lng);
    payload.append("issueTypeId", issueTypeId);
    payload.append("image", image);

    setLoadingStep("submit");
    try {
      const created = await createIssue(payload);
      const duplicateMessage = created?.reportCount > 1 ? " Existing issue found, and your report was linked." : "";
      showToast(`Issue submitted successfully.${duplicateMessage}`, "success");
      await queryClient.invalidateQueries({ queryKey: ["my-issues"] });
      await queryClient.invalidateQueries({ queryKey: ["citizen-dashboard"] });
      if (created?.id != null) {
        queryClient.setQueryData(["issue", String(created.id)], created);
      }
      setForm({ title: "", description: "" });
      setImage(null);
      setCoords(null);
      setWard(null);
      setPrediction(null);
      setIssueTypeId("");
      setSelectedIssueType(null);
    } catch (err) {
      showToast(errorMessage(err), "danger");
    } finally {
      setLoadingStep("");
    }
  }

  return (
    <section className="page-stack">
      {toast.message && (
        <div className={`toast-message toast-${toast.tone}`} role={toast.tone === "danger" ? "alert" : "status"} aria-live="polite">
          {toast.message}
        </div>
      )}
      <PageHeader eyebrow="Citizen flow" title="Report a civic issue" description="Capture evidence, verify the ward, let AI assist, then submit." />
      <form className="report-grid" onSubmit={submitIssue}>
        <div className="panel form-grid">
          <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} required /></label>
          <label>Description<textarea rows={5} value={form.description} onChange={(event) => update("description", event.target.value)} required /></label>
          <button type="button" className="secondary-button" onClick={captureLocation} disabled={loadingStep === "location"}>
            {loadingStep === "location" ? "Detecting location..." : "Capture GPS location"}
          </button>
          <label>Latitude<input value={coords?.lat ?? ""} readOnly placeholder="Capture GPS to fill" required /></label>
          <label>Longitude<input value={coords?.lng ?? ""} readOnly placeholder="Capture GPS to fill" required /></label>
          <label>Ward<input value={ward ? `${ward.wardName} (#${ward.wardNumber})` : ""} readOnly placeholder="Ward will appear after GPS capture" required /></label>
          <FileUpload
            buttonText="Upload issue photo"
            label="Issue image"
            maxSize={MAX_IMAGE_SIZE}
            onChange={handleImage}
            onError={(nextError) => showToast(nextError, "danger")}
            required
            value={image}
          />
          <button type="button" className="secondary-button" onClick={analyzeImage} disabled={!image || loadingStep === "ai"}>
            {loadingStep === "ai" ? "Analyzing image..." : aiPredictionFailed ? "Retry prediction" : "Analyze image with AI"}
          </button>
          <label>
            Confirm issue type
            <select value={issueTypeId} onChange={(event) => {
              const nextIssueTypeId = event.target.value;
              const nextIssueType = issueTypes.find((type) => String(type.id) === nextIssueTypeId) || null;
              setIssueTypeId(nextIssueTypeId);
              setSelectedIssueType(nextIssueType);
            }} disabled={issueTypesLoading} required>
              <option value="">Select issue type</option>
              {issueTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.displayName}</option>
              ))}
            </select>
          </label>
          <label>Department<input value={selectedIssueType?.departmentName || ""} readOnly placeholder="Department will be derived from AI or issue type" required /></label>
          <button className="primary-button" disabled={loadingStep === "submit"}>{loadingStep === "submit" ? "Submitting..." : "Submit issue"}</button>
        </div>
        <aside className="panel status-panel">
          <h2>Submission checks</h2>
          <Check label="Image selected" done={Boolean(image)} detail={image?.name} />
          <Check label="GPS captured" done={Boolean(coords)} detail={coords ? `${coords.lat}, ${coords.lng} (${coords.accuracy}m)` : ""} />
          <Check label="Ward verified" done={Boolean(ward)} detail={ward ? `${ward.wardName} #${ward.wardNumber}` : ""} />
          <Check label="AI attempted" done={Boolean(prediction)} detail={prediction?.issue ? `${prediction.issue} (${Math.round((prediction.confidence || 0) * 100)}%)` : ""} />
          <Check label="Issue type confirmed" done={Boolean(issueTypeId)} />
          <Check label="Department inferred" done={Boolean(selectedIssueType?.departmentName)} detail={selectedIssueType?.departmentName || ""} />
          <Check label="Selected issue type" done={Boolean(selectedIssueType)} detail={selectedIssueType ? `${selectedIssueType.displayName} · ${selectedIssueType.priority} · ${selectedIssueType.slaHours}h` : ""} />
        </aside>
      </form>
      <OpenStreetMapAttribution />
    </section>
  );
}

function Check({ label, done, detail }) {
  const status = done ? "Complete" : "Pending";
  return (
    <div className={`check-row ${done ? "done" : ""}`} aria-label={`${label}: ${status}`}>
      <span>{done ? "✓" : "•"}</span>
      <div>
        <strong>{label}</strong>
        <em>{status}</em>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}
