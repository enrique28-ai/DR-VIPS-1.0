// routes/patient.routes.js
import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  createPatient, getMyPatients, getPatientById, updatePatient, deletePatient
} from '../controllers/patientController.js'

const router = Router()
router.post('/', protect, createPatient)
router.get('/', protect, getMyPatients)          // ?category=0-12|13-17|18-59|60+  & ?q=
router.get('/:id', protect, getPatientById)
router.put('/:id', protect, updatePatient)
router.delete('/:id', protect, deletePatient)

export default router
