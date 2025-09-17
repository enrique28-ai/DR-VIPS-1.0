// controllers/patient.controller.js
import Patient from '../models/Patient.js'

export const createPatient = async (req, res) => {
  try {
    const { fullname, diseases, email, phone, age } = req.body
    if (!fullname || !Array.isArray(diseases) || !diseases.length || !email || !phone || age == null) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const patient = await Patient.create({
      fullname, diseases, email, phone, age,
      createdBy: req.user._id
    })
    res.status(201).json(patient)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getMyPatients = async (req, res) => {
  const { category, q } = req.query
  const query = { createdBy: req.user._id }

  // filtro por banda de edad (ej. "18-59", "60+")
  if (category && category !== 'All') {
    query.ageCategory = category
  }

  // búsqueda simple por nombre/email
  if (q) {
    query.$or = [
      { fullname: { $regex: q, $options: 'i' } },
      { email:    { $regex: q, $options: 'i' } }
    ]
  }

  const patients = await Patient.find(query).sort({ createdAt: -1 }).lean()
  res.json(patients)
}

export const getPatientById = async (req, res) => {
  const p = await Patient.findOne({ _id: req.params.id, createdBy: req.user._id }).lean()
  if (!p) return res.status(404).json({ error: 'Paciente no encontrado' })
  res.json(p)
}

export const updatePatient = async (req, res) => {
  try {
    // solo campos permitidos; NOTA: ageCategory se recalcula en el hook
    const { fullname, diseases, email, phone, age } = req.body
    const updated = await Patient.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { fullname, diseases, email, phone, age },
      { new: true }
    )
    if (!updated) return res.status(404).json({ error: 'Paciente no encontrado' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const deletePatient = async (req, res) => {
  const deleted = await Patient.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id })
  if (!deleted) return res.status(404).json({ error: 'Paciente no encontrado' })
  // (Opcional) Borrado en cascada de diagnósticos aquí
  res.status(204).end()
}
