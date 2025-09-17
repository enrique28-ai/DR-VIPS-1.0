import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";
import DiagnosisCard from "../components/DiagnosisCard.jsx";
import EmptyDiagnoses from "../components/EmptyDiagnoses.jsx";

// util local YYYY-MM-DD
const pad = (n) => String(n).padStart(2, "0");
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Estado vacío cuando hay 0 resultados pero SÍ existen diagnósticos del paciente
function EmptyResults({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <span className="text-3xl">🔎</span>
      </div>
      <h3 className="text-2xl font-bold">No matching diagnoses</h3>
      <p className="mt-2 max-w-md text-gray-600">
        Try adjusting your search or date filter.
      </p>
      <button
        onClick={onClear}
        className="mt-6 inline-block rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black"
      >
        Clear filters
      </button>
    </div>
  );
}

export default function DiagnosesByPatient() {
  const { patientId } = useParams();
  const { authReady, user } = useContext(AuthContext);

  const [raw, setRaw] = useState([]);   // todos los diagnósticos del paciente
  const [loading, setLoading] = useState(true);

  // filtros
  const [q, setQ] = useState("");
  const [onDate, setOnDate] = useState(todayLocal()); // un solo día (updatedAt)

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/diagnosis/patient/${patientId}`);
      setRaw(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load diagnoses");
      setRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    if (!user) { setLoading(false); return; }
    load();
  }, [authReady, user, patientId]);

  // 🔎 Filtrar SOLO por updatedAt (coincidencia exacta de día local)
  const display = useMemo(() => {
    const qnorm = q.trim().toLowerCase();
    return raw.filter((d) => {
      const nameOk = !qnorm || String(d.Diagnostic || "").toLowerCase().includes(qnorm);

      const ts = d.updatedAt; // 👈 solo updatedAt
      if (!ts) return false;  // si por alguna razón no existe, no coincide
      const t = new Date(ts);
      const key = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;

      const dateOk = !onDate || key === onDate;
      return nameOk && dateOk;
    });
  }, [raw, q, onDate]);

  const clearFilters = () => {
    setQ("");
    setOnDate(todayLocal());
  };

  const handleDeleted = (id) => {
    setRaw((prev) => prev.filter((d) => d._id !== id));
  };

  const hasAny = raw.length > 0; // ¿el paciente tiene algún diagnóstico?

  return (
    <main className="mx-auto max-w-6xl p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Diagnoses</h1>
        <div className="flex gap-2">
          <Link
            to={`/patients/${patientId}`}
            className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100"
          >
            ← Back to Patient
          </Link>
          {hasAny && (
            <Link
              to={`/diagnosis/patient/${patientId}/new`}
              className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              Create Diagnosis
            </Link>
          )}
        </div>
      </div>

      {/* Controles SOLO si existen diagnósticos */}
      {authReady && user && hasAny && (
        <>
          {/* Buscador por nombre */}
          <div className="mb-3 flex justify-center">
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-2xl gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by diagnosis name..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>
          </div>

          {/* Filtro por un día basado en updatedAt */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <label className="text-sm text-gray-700">On date</label>
            <input
              type="date"
              value={onDate}
              onChange={(e) => setOnDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={() => setOnDate(todayLocal())}
              className="rounded-md bg-gray-200 px-3 py-2 hover:bg-gray-300"
              title="Today"
            >
              Today
            </button>
          </div>
        </>
      )}

      {/* Contenido */}
      {!authReady || loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !hasAny ? (
        <EmptyDiagnoses patientId={patientId} />
      ) : display.length === 0 ? (
        <EmptyResults onClear={clearFilters} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((d) => (
            <DiagnosisCard
              key={d._id}
              diagnosis={d}
              patientId={patientId}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </main>
  );
}
