// routes/diagnosis.routes.js
import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { createDiagnosis, getDiagnosesByPatient, getDiagnosisById, updateDiagnosis, deleteDiagnosis } from '../controllers/diagnosisController.js'
const router = Router()

router.post('/', protect, createDiagnosis)
router.get('/patient/:patientId', protect, getDiagnosesByPatient)
router.get('/:id', protect, getDiagnosisById)
router.put('/:id', protect, updateDiagnosis)
router.delete('/:id', protect, deleteDiagnosis)

export default router
