import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getUserProfile, updateProfile } from "../../api/users.api";
import { Alert } from "../../components/ui/Alert.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { formatDate } from "../../lib/format";
import { useAuth } from "../auth/useAuth";

export function ProfilePage() {
  const { refreshUser, user } = useAuth();
  const isCitizen = user.role === "CITIZEN";
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    enabled: isCitizen,
  });
  const profileUser = profile || user;
  const [form, setForm] = useState({ fullName: user.fullName || "", email: user.email || "", mobile: user.mobile || "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const city = profileUser.city || profileUser.cityName;
  const createdAt = profileUser.createdAt || profileUser.created_at || profileUser.createdOn || profileUser.createdDate;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!isCitizen) {
      setError("Profile update is available only for citizen accounts in this backend.");
      return;
    }
    setError("");
    setMessage("");
    const changes = {};
    for (const field of ["fullName", "email", "mobile"]) {
      if (form[field] !== (user[field] || "")) changes[field] = form[field];
    }
    if (!Object.keys(changes).length) {
      setMessage("No profile changes to save.");
      return;
    }
    try {
      await updateProfile(changes);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setMessage("Profile updated.");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Account" title="Your profile" description="Keep contact details accurate for civic notifications." />
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="detail-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <label>Full name<input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} disabled={!isCitizen} /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} disabled={!isCitizen} /></label>
          <label>Mobile<input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} disabled={!isCitizen} /></label>
          {isCitizen ? <button className="primary-button">Save changes</button> : <p className="muted">This role is read-only in profile update APIs.</p>}
        </form>
        <div className="panel">
          <h2>Account details</h2>
          <dl className="details-list">
            <dt>Username</dt><dd>{user.username}</dd>
            <dt>Role</dt><dd>{user.role}</dd>
            <dt>City</dt><dd>{city || "Not sent by backend"}</dd>
            <dt>Created at</dt><dd>{createdAt ? formatDate(createdAt) : "Not sent by backend"}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
