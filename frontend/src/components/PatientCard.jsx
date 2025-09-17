// src/components/PatientCard.jsx
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PatientCard({ patient, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;

    if (!window.confirm("Delete this patient? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await axios.delete(`/patients/${patient._id}`); // -> /api/patients/:id
      onDeleted?.(patient._id);        // quita del estado
      toast.success("Patient deleted");
    } catch (err) {
      if (err?.response?.status === 404) {
        onDeleted?.(patient._id);
        toast.success("Patient deleted");
      } else {
        const msg = err?.response?.data?.error || "Failed to delete patient";
        toast.error(msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      {/* Nombre → detalle */}
      <h3 className="text-lg font-semibold">
        <Link to={`/patients/${patient._id}`} className="hover:underline">
          {patient.fullname}
        </Link>
      </h3>

      {/* 👇 Edad del paciente */}
      {patient?.age != null && (
        <p className="mt-1 text-sm text-gray-600">Age: {patient.age}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        {/* Diagnósticos directos */}
        <Link
          to={`/diagnosis/patient/${patient._id}`}
          className="inline-block rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
        >
          View diagnoses
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-3 text-gray-500">
          <Link
            to={`/patients/${patient._id}/edit`}
            title="Edit patient"
            className="hover:text-blue-600"
          >
            <Pencil className="w-5 h-5" />
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            title="Delete patient"
            className="hover:text-red-600 disabled:opacity-50"
            disabled={deleting}
            aria-label="Delete patient"
          >
            <Trash2 className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      </div>
    </article>
  );
}
