import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createIssue } from "../../api/issues.api";
import { getDepartments } from "../../api/departments.api";
import { getIssueTypes } from "../../api/issueTypes.api";
import { predictIssue } from "../../api/ai.api";
import { lookupWard } from "../../api/wards.api";
import { Alert } from "../../components/ui/Alert.jsx";
import { FileUpload } from "../../components/ui/FileUpload.jsx";
import { OpenStreetMapAttribution } from "../../components/ui/OpenStreetMapAttribution.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { errorMessage } from "../../lib/apiResponse";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function ReportIssuePage() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [departmentId, setDepartmentId] = useState("");
  const [image, setImage] = useState(null);
  const [coords, setCoords] = useState(null);
  const [ward, setWard] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [issueTypeId, setIssueTypeId] = useState("");
  const [selectedIssueType, setSelectedIssueType] = useState(null);
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [aiPredictionFailed, setAiPredictionFailed] = useState(false);
  const wardLookupCache = useRef(new Map());

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    staleTime: 30 * 60_000,
  });
  const { data: issueTypes = [], isLoading: issueTypesLoading } = useQuery({
    queryKey: ["issue-types", departmentId || "all"],
    queryFn: () => getIssueTypes(departmentId ? Number(departmentId) : undefined),
    enabled: Boolean(departmentId),
    staleTime: 10 * 60_000,
  });

  function updateDepartment(nextDepartmentId) {
    setDepartmentId(nextDepartmentId);
    setIssueTypeId("");
    setSelectedIssueType(null);
    setPrediction(null);
    setMessage("");
    setError("");
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleImage(file) {
    setPrediction(null);
    setIssueTypeId("");
    setSelectedIssueType(null);
    setError("");
    setMessage("");
    setMessageTone("info");
    setAiPredictionFailed(false);
    setImage(file);
  }

  async function captureLocation() {
    setError("");
    setMessage("");
    setMessageTone("info");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
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
          setMessageTone("success");
          setMessage(`Location detected in ${wardResult.wardName}.`);
          setToastMessage(`Location detected in ${wardResult.wardName}.`);
        } catch (err) {
          setWard(null);
          setError(errorMessage(err));
        } finally {
          setLoadingStep("");
        }
      },
      (geoError) => {
        setLoadingStep("");
        setError(geoError.message || "Location permission was denied.");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }

  async function analyzeImage() {
    setError("");
    setMessage("");
    setMessageTone("info");
    setAiPredictionFailed(false);
    if (!image) {
      setError("Image file is required.");
      return;
    }
    setLoadingStep("ai");
    try {
      const result = await predictIssue(image);
      
      // Validate response contains required fields per contract
      if (!result || typeof result !== 'object') {
        throw new Error("AI service returned invalid response.");
      }
      if (!result.issue) {
        throw new Error("AI service returned empty response.");
      }
      
      const confidence = Number(result.confidence ?? 0);
      const mappedIssueTypeId = result.issueTypeId ?? null;
      
      // Auto-select only if confidence >= 0.7 AND issueTypeId is valid
      const shouldAutoSelect = Boolean(mappedIssueTypeId) && confidence >= 0.7;
      
      setPrediction({
        issue: result.issue,
        confidence: confidence,
        issueTypeId: mappedIssueTypeId,
        autoSelected: shouldAutoSelect,
      });
      
      if (shouldAutoSelect) {
        setIssueTypeId(String(mappedIssueTypeId));
        setSelectedIssueType(issueTypes.find((type) => String(type.id) === String(mappedIssueTypeId)) || null);
        setMessageTone("success");
        setMessage(`AI suggested ${result.issue} with ${Math.round(confidence * 100)}% confidence. You can override it.`);
        setToastMessage(`AI suggested ${result.issue} with ${Math.round(confidence * 100)}% confidence.`);
        setAiPredictionFailed(false);
      } else if (!mappedIssueTypeId) {
        // Mapping failed: issue type not found
        setIssueTypeId("");
        setSelectedIssueType(null);
        setMessageTone("warning");
        setMessage("AI identified a type not in the system. Please select the issue type manually.");
        setAiPredictionFailed(false);
      } else {
        // Low confidence: ask user
        setIssueTypeId("");
        setSelectedIssueType(null);
        setMessageTone("warning");
        window.alert(`AI suggested ${result.issue} but with low confidence (${Math.round(confidence * 100)}%). Please verify and select the correct issue type.`);
        setMessage(`AI suggested ${result.issue} (${Math.round(confidence * 100)}% confidence) but was not confident enough to auto-select. Please verify.`);
        setAiPredictionFailed(false);
      }
    } catch (err) {
      setPrediction({ autoSelected: false });
      setAiPredictionFailed(true);
      setMessageTone("warning");
      setMessage("AI prediction failed. You can still continue by selecting the issue type manually.");
      
      const errMsg = errorMessage(err);
      // Distinguish between different error types
      if (errMsg.includes("service unavailable") || errMsg.includes("timeout")) {
        setError("AI service unavailable. Please try again.");
      } else if (errMsg.includes("empty response")) {
        setError("AI service returned empty response. Please try again.");
      } else if (errMsg.includes("Image file")) {
        setError(errMsg);
      } else {
        setError(errMsg || "Failed to predict issue type. Please try again.");
      }
    } finally {
      setLoadingStep("");
    }
  }

  async function submitIssue(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setMessageTone("info");
    if (!departmentId) {
      setError("Select a department before choosing an issue type.");
      return;
    }
    if (!coords || !ward) {
      setError("Capture a valid location and ward before submitting.");
      return;
    }
    if (!prediction) {
      setError("Run AI prediction before creating the issue. If AI fails, select issue type manually after the attempt.");
      return;
    }
    if (!issueTypeId) {
      setError("Select an issue type before submitting.");
      return;
    }
    if (!image) {
      setError("Image is required.");
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
      setMessageTone("success");
      setMessage(`Issue submitted successfully.${duplicateMessage}`);
      setToastMessage(`Issue submitted successfully.${duplicateMessage}`);
      setForm({ title: "", description: "" });
      setImage(null);
      setCoords(null);
      setWard(null);
      setPrediction(null);
      setIssueTypeId("");
      setSelectedIssueType(null);
      setDepartmentId("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingStep("");
    }
  }

  return (
    <section className="page-stack">
      {toastMessage && <div className="toast-message">{toastMessage}</div>}
      <PageHeader eyebrow="Citizen flow" title="Report a civic issue" description="Capture evidence, verify the ward, let AI assist, then submit." />
      {message && <Alert tone={messageTone}>{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <form className="report-grid" onSubmit={submitIssue}>
        <div className="panel form-grid">
          <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} required /></label>
          <label>Description<textarea rows={5} value={form.description} onChange={(event) => update("description", event.target.value)} required /></label>
          <label>Latitude<input value={coords?.lat ?? ""} readOnly placeholder="Capture GPS to fill" required /></label>
          <label>Longitude<input value={coords?.lng ?? ""} readOnly placeholder="Capture GPS to fill" required /></label>
          <label>
            Department
            <select value={departmentId} onChange={(event) => updateDepartment(event.target.value)} disabled={departmentsLoading} required>
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </label>
          <FileUpload
            buttonText="Upload issue photo"
            label="Issue image"
            maxSize={MAX_IMAGE_SIZE}
            onChange={handleImage}
            onError={setError}
            required
            value={image}
          />
          <button type="button" className="secondary-button" onClick={captureLocation} disabled={loadingStep === "location"}>
            {loadingStep === "location" ? "Detecting location..." : "Capture GPS location"}
          </button>
          <button type="button" className="secondary-button" onClick={analyzeImage} disabled={!image || loadingStep === "ai"}>
            {loadingStep === "ai" ? "Analyzing image..." : aiPredictionFailed ? "Retry prediction" : "Analyze image with AI"}
          </button>
          <label>
            Confirm issue type
            <select value={issueTypeId} onChange={(event) => {
              const nextIssueTypeId = event.target.value;
              setIssueTypeId(nextIssueTypeId);
              setSelectedIssueType(issueTypes.find((type) => String(type.id) === nextIssueTypeId) || null);
            }} disabled={!departmentId || issueTypesLoading} required>
              <option value="">Select issue type</option>
              {issueTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.displayName}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" disabled={loadingStep === "submit"}>{loadingStep === "submit" ? "Submitting..." : "Submit issue"}</button>
        </div>
        <aside className="panel status-panel">
          <h2>Submission checks</h2>
          <Check label="Image selected" done={Boolean(image)} detail={image?.name} />
          <Check label="GPS captured" done={Boolean(coords)} detail={coords ? `${coords.lat}, ${coords.lng} (${coords.accuracy}m)` : ""} />
          <Check label="Ward verified" done={Boolean(ward)} detail={ward ? `${ward.wardName} #${ward.wardNumber}` : ""} />
          <Check label="AI attempted" done={Boolean(prediction)} detail={prediction?.issue ? `${prediction.issue} (${Math.round((prediction.confidence || 0) * 100)}%)` : ""} />
          <Check label="Issue type confirmed" done={Boolean(issueTypeId)} />
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
