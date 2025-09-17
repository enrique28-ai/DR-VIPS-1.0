import { AuthProvider } from "./context/AuthContext.jsx";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Patients from "./pages/Patients.jsx";
import PatientCreate from "./pages/PatientCreate.jsx";
import PatientDetail from "./pages/PatientDetail.jsx";
import PatientEdit from "./pages/PatientEdit.jsx";
import DiagnosesByPatient from "./pages/DiagnosesByPatient.jsx";
import DiagnosisCreate from "./pages/DiagnosisCreate.jsx";
import DiagnosisDetail from "./pages/DiagnosesDetail.jsx";
import DiagnosisEdit from "./pages/DiagnosisEdit.jsx";
function App() {
  return (
    <AuthProvider>
        <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/patients" element={<Patients/>}/>
        <Route path="/patients/new" element={<PatientCreate/>}/>
        <Route path="/patients/:id" element={<PatientDetail/>}/>
        <Route path="/patients/:id/edit" element={<PatientEdit/>}/>
        <Route path="/diagnosis/patient/:patientId" element={<DiagnosesByPatient/>}/>
        <Route path="/diagnosis/patient/:patientId/new" element={<DiagnosisCreate/>}/>
        <Route path="/diagnosis/patient/:patientId/:diagnosisId" element={<DiagnosisDetail/>}/>
        <Route path="/diagnosis/patient/:patientId/:diagnosisId/edit" element={<DiagnosisEdit/>}/>
      </Routes>
    </AuthProvider>
  )
}

export default App;
