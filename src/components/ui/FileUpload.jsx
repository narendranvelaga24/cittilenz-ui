import { ImageUp, X } from "lucide-react";
import { useEffect, useId, useMemo } from "react";

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

export function FileUpload({
  accept = "image/*",
  buttonText = "Choose image",
  helperText = "PNG, JPG, or WebP up to 5 MB.",
  label,
  maxSize = DEFAULT_MAX_SIZE,
  onChange,
  onError,
  required,
  value,
  variant = "default",
}) {
  const inputId = useId();
  const previewUrl = useMemo(() => value ? URL.createObjectURL(value) : "", [value]);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function validateFile(file) {
    if (!file) return true;
    if (file.size === 0) {
      onError?.("Image file is empty. Please select a valid image.");
      return false;
    }
    if (!file.type.startsWith("image/")) {
      onError?.("Please upload an image file.");
      return false;
    }
    if (file.size > maxSize) {
      onError?.(`Please upload an image smaller than ${Math.round(maxSize / 1024 / 1024)} MB.`);
      return false;
    }
    return true;
  }

  function handleChange(event) {
    const file = event.target.files?.[0] || null;
    if (!validateFile(file)) {
      event.target.value = "";
      return;
    }
    onError?.("");
    onChange(file);
  }

  function clearFile() {
    onChange(null);
  }

  return (
    <div className={`file-upload file-upload-${variant}`}>
      {label && <span className="file-upload-label">{label}</span>}
      <label className="file-dropzone" htmlFor={inputId}>
        {previewUrl ? (
          <img alt={`Preview of ${value.name}`} src={previewUrl} />
        ) : (
          <span className="file-dropzone-empty">
            <ImageUp size={22} />
            <strong>{buttonText}</strong>
            <small>{helperText}</small>
          </span>
        )}
      </label>
      <input accept={accept} id={inputId} onChange={handleChange} required={required && !value} type="file" />
      {value && (
        <div className="file-upload-meta">
          <span>{value.name}</span>
          <button aria-label="Remove selected image" onClick={clearFile} type="button">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
