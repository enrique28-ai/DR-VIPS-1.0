import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function PatientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    age: "",
    diseases: "", // comma-separated in the UI
  });

  // Back: intenta volver a la vista anterior; si no, cae a /patients
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (location.state?.from === "detail") {
      navigate(`/patients/${id}`);
    } else {
      navigate("/patients");
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const loadPatient = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/patients/${id}`);
      setForm({
        fullname: data.fullname || "",
        email: data.email || "",
        phone: data.phone || "",
        age: data.age ?? "",
        diseases: Array.isArray(data.diseases) ? data.diseases.join(", ") : "",
      });
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

  useEffect(() => { loadPatient(); }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const diseasesArr = form.diseases
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await axios.put(`/patients/${id}`, {
        fullname: form.fullname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        age: Number(form.age),
        diseases: diseasesArr,
      });

      toast.success("Patient updated");
      // Si llegaste desde el detalle, vuelve al detalle; si no, a la lista
      if (location.state?.from === "detail") {
        navigate(`/patients/${id}`, { replace: true });
      } else {
        navigate("/patients", { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update patient";
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
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          ← Back
        </button>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Edit Patient</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              name="fullname"
              value={form.fullname}
              onChange={onChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5551234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                min={0}
                name="age"
                value={form.age}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="45"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diseases (comma-separated)
            </label>
            <input
              name="diseases"
              value={form.diseases}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hypertension, Diabetes"
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
