import { Link } from "react-router-dom";

export default function EmptyDiagnoses({ patientId }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <span className="text-3xl">🧪</span>
      </div>
      <h3 className="text-2xl font-bold">No diagnoses for this patient</h3>
      <p className="mt-2 max-w-md text-gray-600">
        Create a new diagnosis for this patient.
      </p>
      {/* 👇 Botón para crear diagnóstico */}
      <Link
        to={`/diagnosis/patient/${patientId}/new`}
        className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Create diagnosis
      </Link>
    </div>
  );
}

