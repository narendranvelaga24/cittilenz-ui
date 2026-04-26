export function unwrapResponse(response) {
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || "Request failed");
  }
  return body.data;
}

function validationMessage(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "";
  const messages = Object.values(data)
    .filter((value) => typeof value === "string" && value.trim() !== "");
  return messages[0] || "";
}

export function errorMessage(error) {
  const body = error?.response?.data;
  const fieldMessage = validationMessage(body?.data);
  return fieldMessage || body?.message || error?.message || "Something went wrong";
}
