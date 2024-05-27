const mongoose = require("mongoose");

const patientsSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    surname:{
        type: String,
        require: true
    },
    dni:{
        type: String,
        require: true
    },
    birthDate:{
        type: String,
        require: true
    },
    healthReport:{
        type: String,
        require: true
    },
    level:{
        type: String,
        require: true
    },
    encuestas: [{
        type: mongoose.Types.ObjectId,
        ref: 'encuestas'
    }]
},{
    timestamps:true
});
module.exports = mongoose.model('Patients', patientsSchema)