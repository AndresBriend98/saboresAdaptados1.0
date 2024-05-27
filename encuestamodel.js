const mongoose = require("mongoose");

const encuestaschema = mongoose.Schema({
    comida:{
        type: String,
        required: true,
    },
    tragar:{
        type: String,
        required: true,
    },
    tosio:{
        type: String,
        require: true
    },
    voz:{
        type: String,
        require: true
    },
    variasveces:{
        type: String,
        require: true
    },
    tecnicaespecial:{
        type: String,
        require: true
    },
    ayudo:{
        type: String,
        require: true
    },
    malestar:{
        type: String,
        require: true
    },
        // Otras propiedades de la encuesta...
    recipe: {
        type: mongoose.Types.ObjectId,
        ref: 'Receta'
    },
    
    paciente: {
        type: mongoose.Types.ObjectId,
        ref: 'paciente'
    }
    
},{
    timestamps:true
});
module.exports = mongoose.model('Encuesta', encuestaschema)