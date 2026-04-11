import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createIssue } from "../../api/issues.api";
import { getIssueTypes } from "../../api/issueTypes.api";
import { predictIssue } from "../../api/ai.api";
import { lookupWard } from "../../api/wards.api";
import { Alert } from "../../components/ui/Alert.jsx";
import { FileUpload } from "../../components/ui/FileUpload.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { errorMessage } from "../../lib/apiResponse";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function ReportIssuePage() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [image, setImage] = useState(null);
  const [coords, setCoords] = useState(null);
  const [ward, setWard] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [issueTypeId, setIssueTypeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");

  const { data: issueTypes = [], isLoading: issueTypesLoading } = useQuery({
    queryKey: ["issue-types"],
    queryFn: () => getIssueTypes(),
    staleTime: 10 * 60_000,
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleImage(file) {
    setPrediction(null);
    setIssueTypeId("");
    setError("");
    setImage(file);
  }

  async function captureLocation() {
    setError("");
    setMessage("");
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
          const wardResult = await lookupWard(nextCoords.lat, nextCoords.lng);
          setWard(wardResult);
          setMessage(`Location detected in ${wardResult.wardName}.`);
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
    if (!image) {
      setError("Upload an image before running AI prediction.");
      return;
    }
    setLoadingStep("ai");
    try {
      const result = await predictIssue(image);
      setPrediction(result);
      if (result.autoSelected && result.issueTypeId) {
        setIssueTypeId(String(result.issueTypeId));
        setMessage(`AI suggested ${result.issue} with ${Math.round((result.confidence || 0) * 100)}% confidence. You can override it.`);
      } else {
        setMessage("AI was not confident. Please select the issue type manually.");
      }
    } catch (err) {
      setPrediction({ autoSelected: false });
      setMessage("AI prediction failed. You can still continue by selecting the issue type manually.");
      setError(errorMessage(err));
    } finally {
      setLoadingStep("");
    }
  }

  async function submitIssue(event) {
    event.preventDefault();
    setError("");
    setMessage("");
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
      setMessage(`Issue submitted successfully.${duplicateMessage}`);
      setForm({ title: "", description: "" });
      setImage(null);
      setPrediction(null);
      setIssueTypeId("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingStep("");
    }
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Citizen flow" title="Report a civic issue" description="Capture evidence, verify the ward, let AI assist, then submit." />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <form className="report-grid" onSubmit={submitIssue}>
        <div className="panel form-grid">
          <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} required /></label>
          <label>Description<textarea rows={5} value={form.description} onChange={(event) => update("description", event.target.value)} required /></label>
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
            {loadingStep === "ai" ? "Analyzing image..." : "Analyze image with AI"}
          </button>
          <label>
            Confirm issue type
            <select value={issueTypeId} onChange={(event) => setIssueTypeId(event.target.value)} disabled={issueTypesLoading} required>
              <option value="">Select issue type</option>
              {issueTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.displayName || type.name}</option>
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
        </aside>
      </form>
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
