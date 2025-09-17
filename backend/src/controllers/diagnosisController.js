// controllers/diagnosis.controller.js
import Diagnosis from '../models/Diagnosis.js'
import Patient from '../models/Patient.js'

// Helper: verificar que el paciente pertenece al usuario
const ownsPatient = async (patientId, userId) =>
  !!(await Patient.exists({ _id: patientId, createdBy: userId }))

// POST /api/diagnoses
export const createDiagnosis = async (req, res, next) => {
  try {
    const { Diagnostic, description, patient } = req.body
    if (!Diagnostic || !patient) {
      return res.status(400).json({ error: 'Diagnostic y patient son requeridos' })
    }
    if (!(await ownsPatient(patient, req.user._id))) {
      return res.status(403).json({ error: 'No autorizado para este paciente' })
    }
    const d = await Diagnosis.create({
      Diagnostic,
      description: description ?? '',
      patient,
      createdBy: req.user._id,
    })
    res.status(201).json(d)
  } catch (err) {
    next(err)
  }
}

// GET /api/diagnoses/patient/:patientId
export const getDiagnosesByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params
    if (!(await ownsPatient(patientId, req.user._id))) {
      return res.status(403).json({ error: 'No autorizado para este paciente' })
    }
    const list = await Diagnosis.find({
      patient: patientId,
      createdBy: req.user._id,
    }).sort({ createdAt: -1 })
    res.json(list)
  } catch (err) {
    next(err)
  }
}

// GET /api/diagnoses/:id
export const getDiagnosisById = async (req, res, next) => {
  try {
    const d = await Diagnosis.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
    if (!d) return res.status(404).json({ error: 'Diagnóstico no encontrado' })

    // defensa adicional: confirmar que el patient de ese diagnóstico también es del usuario
    if (!(await ownsPatient(d.patient, req.user._id))) {
      return res.status(403).json({ error: 'No autorizado' })
    }
    res.json(d)
  } catch (err) {
    next(err)
  }
}

// PUT /api/diagnoses/:id
export const updateDiagnosis = async (req, res, next) => {
  try {
    const d = await Diagnosis.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
    if (!d) return res.status(404).json({ error: 'Diagnóstico no encontrado' })
    if (!(await ownsPatient(d.patient, req.user._id))) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    // Solo campos permitidos
    if (req.body.Diagnostic != null) d.Diagnostic = req.body.Diagnostic
    if (req.body.description != null) d.description = req.body.description

    await d.save()
    res.json(d)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/diagnoses/:id
export const deleteDiagnosis = async (req, res, next) => {
  try {
    const d = await Diagnosis.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
    if (!d) return res.status(404).json({ error: 'Diagnóstico no encontrado' })
    if (!(await ownsPatient(d.patient, req.user._id))) {
      return res.status(403).json({ error: 'No autorizado' })
    }
    await d.deleteOne()
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
