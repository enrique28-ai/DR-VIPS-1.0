// src/pages/Patients.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import PatientCard from "../components/PatientCard.jsx";
import EmptyPatients from "../components/EmptyPatients.jsx";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

/* ---------- UI categories (same labels you show) ---------- */
const AGE_LABELS = [
  { label: "All", value: "All" },
  { label: "Child", value: "0-12" },
  { label: "Teenager", value: "13-17" },
  { label: "Adult", value: "18-59" },
  { label: "Senior", value: "60+" },
];

/* ---------- helpers ---------- */
const inRange = (age, range) => {
  if (age == null || Number.isNaN(Number(age))) return false;
  const n = Number(age);
  switch (range) {
    case "0-12": return n >= 0 && n <= 12;
    case "13-17": return n >= 13 && n <= 17;
    case "18-59": return n >= 18 && n <= 59;
    case "60+": return n >= 60;
    default: return true;
  }
};

const uniqueById = (arr) =>
  Array.from(new Map((arr || []).map((x) => [x?._id, x])).values());

/* ---------- empty when there ARE patients but filters return none ---------- */
function EmptyResults({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <span className="text-3xl">🔎</span>
      </div>
      <h3 className="text-2xl font-bold">No matching patients</h3>
      <p className="mt-2 max-w-md text-gray-600">
        Try adjusting your search or category filters.
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

export default function Patients() {
  const { authReady, user } = useContext(AuthContext);

  const [raw, setRaw] = useState([]);     // all patients (fetched once)
  const [loading, setLoading] = useState(true);

  // client-side filters
  const [q, setQ] = useState("");
  const [ageLabel, setAgeLabel] = useState("All");

  const hasAny = raw.length > 0; // any patients in DB?

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/patients"); // fetch all; filter client-side
      setRaw(uniqueById(Array.isArray(data) ? data : []));
    } catch {
      toast.error("Failed to load patients");
      setRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    if (!user) { setLoading(false); return; }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  // derived, filtered list (instant)
  const patients = useMemo(() => {
    const qnorm = q.trim().toLowerCase();
    const selected = AGE_LABELS.find((x) => x.label === ageLabel)?.value || "All";

    return raw.filter((p) => {
      const nameOk = !qnorm || String(p?.fullname || "").toLowerCase().includes(qnorm);

      const catOk =
        selected === "All" ||
        inRange(p?.age, selected) ||
        // fallback if backend already provides ageCategory like "18-59", "60+"
        (p?.ageCategory && p.ageCategory === selected);

      return nameOk && catOk;
    });
  }, [raw, q, ageLabel]);

  const clearFilters = () => {
    setQ("");
    setAgeLabel("All");
  };

  // After delete, update client list (and DB “hasAny” state implicitly)
  const handleDeleted = (id) => {
    setRaw((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <main className="mx-auto max-w-6xl p-4">
      {/* Header: title + Add patient (show only if there are patients in DB) */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        {authReady && user && hasAny && (
          <Link
            to="/patients/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add patient
          </Link>
        )}
      </div>

      {/* Controls (show only if there are patients in DB) */}
      {authReady && user && hasAny && (
        <>
          {/* Dynamic search (same look as Diagnoses) */}
          <div className="mb-3 flex justify-center">
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-2xl gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>
          </div>

          {/* Age category chips (instant filter) */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {AGE_LABELS.map(({ label }) => (
              <button
                key={label}
                onClick={() => setAgeLabel(label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  ageLabel === label
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Content */}
      {!authReady || loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !hasAny ? (
        <EmptyPatients />
      ) : patients.length === 0 ? (
        <EmptyResults onClear={clearFilters} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <PatientCard key={p._id} patient={p} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </main>
  );
}
