export function unwrapResponse(response) {
  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message || "Request failed");
  }
  return body.data;
}

export function errorMessage(error) {
  return error?.response?.data?.message || error?.message || "Something went wrong";
}
