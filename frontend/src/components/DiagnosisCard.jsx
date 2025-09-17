// src/components/DiagnosisCard.jsx
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DiagnosisCard({ diagnosis, patientId, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const updated = diagnosis.updatedAt
    ? new Date(diagnosis.updatedAt).toLocaleString()
    : "—";

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    if (!window.confirm("Delete this diagnosis? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await axios.delete(`/diagnosis/${diagnosis._id}`);
      toast.success("Diagnosis deleted");
      onDeleted?.(diagnosis._id);   // <- solo notifica al padre para que quite la card
    } catch (err) {
      if (err?.response?.status === 404) {
        onDeleted?.(diagnosis._id);
        toast.success("Diagnosis deleted");
      } else {
        toast.error(err?.response?.data?.error || "Failed to delete diagnosis");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold">
        <Link to={`/diagnosis/patient/${patientId}/${diagnosis._id}`} className="hover:underline">
          {diagnosis.Diagnostic}
        </Link>
      </h3>

      <p className="mt-2 text-sm text-gray-600">Updated: {updated}</p>

      <div className="mt-4 flex items-center justify-between">
        <Link
          to={`/diagnosis/patient/${patientId}/${diagnosis._id}/edit`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          <Pencil className="w-4 h-4" /> Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:text-red-600 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </article>
  );
}
