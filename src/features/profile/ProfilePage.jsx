import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { deactivateAccount, deleteAccount, getUserProfile, changePassword, updateProfile } from "../../api/users.api";
import { Button } from "../../components/ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { ToastNotification } from "../../components/ui/ToastNotification.jsx";
import { errorMessage } from "../../lib/apiResponse";
import { isValidEmail, isValidIndianMobile } from "../../lib/validation";
import { useAuth } from "../auth/useAuth";

export function ProfilePage() {
  const { refreshUser, logout, user } = useAuth();
  const isCitizen = user.role === "CITIZEN";
  const queryClient = useQueryClient();
  useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    enabled: isCitizen,
  });
  const [form, setForm] = useState({ fullName: user.fullName || "", email: user.email || "", mobile: user.mobile || "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [toast, setToast] = useState({ message: "", tone: "info" });
  const [accountAction, setAccountAction] = useState("");

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ message: "", tone: "info" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast.message]);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
  }

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      showToast("Password changed successfully. Please sign in again.", "success");
      await logout();
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAccount,
    onSuccess: async () => {
      showToast("Account deactivated.", "success");
      await logout();
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      showToast("Account deleted.", "success");
      await logout();
    },
    onError: (err) => showToast(errorMessage(err), "danger"),
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!isCitizen) {
      showToast("Profile update is available only for citizen accounts in this backend.", "danger");
      return;
    }
    if (form.email && !isValidEmail(form.email)) {
      showToast("Enter a valid email address.", "danger");
      return;
    }
    if (form.mobile && !isValidIndianMobile(form.mobile)) {
      showToast("Enter a valid mobile number (10 digits starting with 6-9).", "danger");
      return;
    }
    const changes = {};
    for (const field of ["fullName", "email", "mobile"]) {
      if (form[field] !== (user[field] || "")) changes[field] = form[field];
    }
    if (!Object.keys(changes).length) {
      showToast("No profile changes to save.");
      return;
    }
    try {
      await updateProfile(changes);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast(errorMessage(err), "danger");
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    if (!isCitizen) {
      showToast("Password change is available only for citizen accounts in this backend.", "danger");
      return;
    }
    if (!passwordForm.oldPassword) {
      showToast("Current password is required.", "danger");
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "danger");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast("New passwords do not match.", "danger");
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  }

  function updatePassword(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  }

  function handleDeactivate() {
    setAccountAction("");
    deactivateMutation.mutate();
  }

  function handleDelete() {
    setAccountAction("");
    deleteMutation.mutate();
  }

  return (
    <section className="page-stack profile-shell">
      <ToastNotification message={toast.message} tone={toast.tone} />
      <PageHeader eyebrow="Account" title="Your profile" description="Keep contact details accurate for civic notifications." />
      <div className="detail-grid">
        <form className="panel form-grid" onSubmit={submit} noValidate>
          <label>Full name<input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} disabled={!isCitizen} /></label>
          <label>Email<input inputMode="email" value={form.email} onChange={(event) => update("email", event.target.value)} disabled={!isCitizen} /></label>
          <label>Mobile<input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} disabled={!isCitizen} /></label>
          {isCitizen ? <button className="primary-button">Save changes</button> : <p className="muted">This role is read-only in profile update APIs.</p>}
        </form>
        {isCitizen && (
          <form className="panel form-grid" onSubmit={submitPassword} noValidate>
            <h2>Change password</h2>
            <label>Current password<input type="password" value={passwordForm.oldPassword} onChange={(event) => updatePassword("oldPassword", event.target.value)} /></label>
            <label>New password<input type="password" value={passwordForm.newPassword} onChange={(event) => updatePassword("newPassword", event.target.value)} /></label>
            <label>Confirm new password<input type="password" value={passwordForm.confirmNewPassword} onChange={(event) => updatePassword("confirmNewPassword", event.target.value)} /></label>
            <button className="primary-button" disabled={changePasswordMutation.isPending || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmNewPassword}>
              {changePasswordMutation.isPending ? "Changing..." : "Change password"}
            </button>
          </form>
        )}
        <div className="panel">
          <h2>Account details</h2>
          <dl className="details-list">
            <dt>Username</dt><dd>{user.username}</dd>
            <dt>Role</dt><dd>{user.role}</dd>
          </dl>
          {isCitizen && (
            <div className="action-cell">
              <button type="button" className="secondary-button" onClick={() => setAccountAction("deactivate")} disabled={deactivateMutation.isPending}>
                {deactivateMutation.isPending ? "Deactivating..." : "Deactivate account"}
              </button>
              <button type="button" className="danger-button" onClick={() => setAccountAction("delete")} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Delete account"}
              </button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={Boolean(accountAction)} onOpenChange={(open) => !open && setAccountAction("")}>
        <DialogContent className="admin-edit-dialog">
          <DialogHeader>
            <DialogTitle>{accountAction === "delete" ? "Delete account?" : "Deactivate account?"}</DialogTitle>
            <DialogDescription>
              {accountAction === "delete"
                ? "This permanently removes your citizen account and cannot be undone."
                : "This deactivates your citizen account and logs you out immediately."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAccountAction("")}>Cancel</Button>
            <Button
              type="button"
              variant={accountAction === "delete" ? "destructive" : "secondary"}
              onClick={accountAction === "delete" ? handleDelete : handleDeactivate}
              disabled={deactivateMutation.isPending || deleteMutation.isPending}
            >
              {accountAction === "delete" ? "Delete account" : "Deactivate account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
