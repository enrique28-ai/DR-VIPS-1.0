import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function DiagnosisCreate() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ Diagnostic: "", description: "" });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.Diagnostic.trim()) {
      toast.error("Diagnosis name is required.");
      return;
    }
    setSaving(true);
    try {
      await axios.post("/diagnosis", {
        Diagnostic: form.Diagnostic.trim(),
        description: form.description.trim(),
        patient: patientId,
      });
      toast.success("Diagnosis created");
      navigate(`/diagnosis/patient/${patientId}`, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to create diagnosis";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-4">
      <div className="mb-4">
        <Link to={`/diagnosis/patient/${patientId}`} className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100">
          ← Back to Diagnoses
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Create Diagnosis</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
            <input
              name="Diagnostic"
              value={form.Diagnostic}
              onChange={onChange}
              required
              placeholder="e.g., Hypertension"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notes…"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
