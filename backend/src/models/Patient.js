import mongoose from "mongoose";

export const AGE_BANDS = [
  { key: "0-12",  min: 0,  max: 12 },
  { key: "13-17", min: 13, max: 17 },
  { key: "18-59", min: 18, max: 59 },
  { key: "60+",   min: 60, max: Infinity }
];

function mapAgeToBand(age) {
  if (age == null) return undefined;
  const band = AGE_BANDS.find(b => age >= b.min && age <= b.max);
  return band?.key;
}

const patientSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true,
        unique:true
    },
    diseases: [
        {
            type: String,
            required: true
        }
    ],
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },

    ageCategory: { 
        type: String, 
        enum: AGE_BANDS.map(b => b.key) 
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},{
    timestamps: true
});

patientSchema.pre("save", function(next){
  this.ageCategory = mapAgeToBand(this.age);
  next();
});
patientSchema.pre("findOneAndUpdate", function(next){
  const upd = this.getUpdate() || {};
  if (Object.prototype.hasOwnProperty.call(upd, "age")) {
    upd.ageCategory = mapAgeToBand(upd.age);
    this.setUpdate(upd);
  }
  next();
});

patientSchema.index({ createdBy: 1 });               // buscar pacientes por usuario
patientSchema.index({ createdBy: 1, age: 1 });

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;