import mongoose from 'mongoose'

const diagnosisSchema = new mongoose.Schema({
  Diagnostic: { 
    type: String, 
    required: true 
},          
  description: { 
    type: String,
    required: true 
  },                     
  patient: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Patient',
      required: true
    },
  createdBy: { type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
      required: true 
    },
}, { 
    timestamps: true 
});

diagnosisSchema.index({ createdBy: 1, patient: 1 })

const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);

export default Diagnosis;

