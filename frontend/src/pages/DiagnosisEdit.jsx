import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function DiagnosisEdit() {
  const { patientId, diagnosisId } = useParams(); // patient-scoped route
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    Diagnostic: "",
    description: "",
  });

  const handleBack = () => {
    navigate(`/diagnosis/patient/${patientId}`);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const loadDiagnosis = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/diagnosis/${diagnosisId}`); // /api/diagnosis/:id
      setForm({
        Diagnostic: data?.Diagnostic || "",
        description: data?.description || "",
      });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 404) toast.error("Diagnosis not found");
      else if (code === 403) toast.error("Not authorized");
      else toast.error("Failed to load diagnosis");
      navigate(`/diagnosis/patient/${patientId}`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDiagnosis(); }, [patientId, diagnosisId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.Diagnostic.trim()) {
      toast.error("Diagnosis name is required.");
      return;
    }
    setSaving(true);
    try {
      await axios.put(`/diagnosis/${diagnosisId}`, {
        Diagnostic: form.Diagnostic.trim(),
        description: form.description.trim(),
      });
      toast.success("Diagnosis updated");
      navigate(`/diagnosis/patient/${patientId}`, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update diagnosis";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="p-4">Loading...</main>;

  return (
    <main className="mx-auto max-w-2xl p-4">
      {/* Back */}
      <div className="mb-4">
        <Link
          to={`/diagnosis/patient/${patientId}`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          ← Back to Diagnoses
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Edit Diagnosis</h1>

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

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
