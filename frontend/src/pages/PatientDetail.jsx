// src/pages/PatientDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Helpers to display the same category labels used in Patients
const ageToLabel = (age) => {
  if (age == null || Number.isNaN(Number(age))) return null;
  const n = Number(age);
  if (n <= 12) return "Child";
  if (n <= 17) return "Teenager";
  if (n <= 59) return "Adult";
  return "Senior";
};

const backendCategoryToLabel = (cat) => {
  if (!cat) return null;
  switch (cat) {
    case "0-12": return "Child";
    case "13-17": return "Teenager";
    case "18-59": return "Adult";
    case "60+": return "Senior";
    default: return cat; // in case backend already sends a readable label
  }
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/patients/${id}`); // -> /api/patients/:id
      setPatient(data);
    } catch (err) {
      const code = err?.response?.status;
      if (code === 404) toast.error("Patient not found");
      else if (code === 403) toast.error("Not authorized");
      else toast.error("Failed to load patient");
      navigate("/patients", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this patient? This cannot be undone.")) return;
    try {
      await axios.delete(`/patients/${id}`); // -> /api/patients/:id
      toast.success("Patient deleted");
      navigate("/patients", { replace: true });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 404) {
        // already gone; consider success for UX/idempotency
        toast.success("Patient deleted");
        navigate("/patients", { replace: true });
      } else {
        const msg = err?.response?.data?.error || "Failed to delete patient";
        toast.error(msg);
      }
    }
  };

  if (loading) return <main className="p-4">Loading...</main>;
  if (!patient) return null;

  const { fullname, email, phone, age, ageCategory, diseases, createdAt, updatedAt } = patient;
  const categoryLabel = ageToLabel(age) ?? backendCategoryToLabel(ageCategory) ?? null;

  return (
    <main className="mx-auto max-w-3xl p-4">
      {/* Back */}
      <div className="mb-4">
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          ← Back to Patients
        </Link>
      </div>

      {/* Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold">{fullname}</h1>
        <p className="text-gray-500 mt-1 flex flex-wrap gap-x-2">
          {age != null && (
            <span>
              Age: <span className="font-medium text-gray-700">{age}</span>
            </span>
          )}
          {categoryLabel && (
            <>
              <span>•</span>
              <span>
                Category: <span className="font-medium text-gray-700">{categoryLabel}</span>
              </span>
            </>
          )}
        </p>
      </header>

      {/* Info */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <ul className="space-y-2 text-gray-700">
          <li><span className="font-medium">Email:</span> {email || "—"}</li>
          <li><span className="font-medium">Phone:</span> {phone || "—"}</li>
          <li>
            <span className="font-medium">Diseases:</span>{" "}
            {Array.isArray(diseases) && diseases.length ? diseases.join(", ") : "—"}
          </li>
          <li className="text-sm text-gray-500 mt-2">
            Created: {createdAt ? new Date(createdAt).toLocaleString() : "—"} • Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
          </li>
        </ul>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/patients/${id}/edit`}
            state={{ from: "detail" }}
            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            Edit
          </Link>

          <button
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 cursor-pointer"
          >
            Delete
          </button>

          <Link
            to={`/diagnosis/patient/${id}`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            View diagnoses
          </Link>

          <Link
            to="/patients"
            className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
          >
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}
