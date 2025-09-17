// src/pages/DiagnosisDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function DiagnosisDetail() {
  const { patientId, diagnosisId } = useParams(); // 👈 patient-scoped params
  const navigate = useNavigate();

  const [diag, setDiag] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/diagnosis/${diagnosisId}`); // backend by diagnosis id
      setDiag(data);
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, diagnosisId]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this diagnosis? This cannot be undone.")) return;
    try {
      await axios.delete(`/diagnosis/${diagnosisId}`);
      toast.success("Diagnosis deleted");
      navigate(`/diagnosis/patient/${patientId}`, { replace: true });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 404) {
        toast.success("Diagnosis deleted");
        navigate(`/diagnosis/patient/${patientId}`, { replace: true });
      } else {
        const msg = err?.response?.data?.error || "Failed to delete diagnosis";
        toast.error(msg);
      }
    }
  };

  if (loading) return <main className="p-4">Loading...</main>;
  if (!diag) return null;

  const { Diagnostic, description, createdAt, updatedAt } = diag;

  return (
    <main className="mx-auto max-w-3xl p-4">
      {/* Back to this patient's diagnoses */}
      <div className="mb-4">
        <Link
          to={`/diagnosis/patient/${patientId}`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          ← Back to Diagnoses
        </Link>
      </div>

      <header className="mb-4">
        <h1 className="text-3xl font-bold">{Diagnostic}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Created: {createdAt ? new Date(createdAt).toLocaleString() : "—"} •{" "}
          Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {description?.trim() ? description : "—"}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/diagnosis/patient/${patientId}/${diagnosisId}/edit`}
            state={{ from: "detail", patientId }}
            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
          <Link
            to={`/diagnosis/patient/${patientId}`}
            className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
          >
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}
