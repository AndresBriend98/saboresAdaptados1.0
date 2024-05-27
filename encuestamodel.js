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
<<<<<<< HEAD
        // Otras propiedades de la encuesta...
    recipe: {
        type: mongoose.Types.ObjectId,
        ref: 'Receta'
    },
    
=======
>>>>>>> f7aa1528edb7125fc0782e650dfa68975f15d8a2
    paciente: {
        type: mongoose.Types.ObjectId,
        ref: 'paciente'
    }
<<<<<<< HEAD
    
=======
>>>>>>> f7aa1528edb7125fc0782e650dfa68975f15d8a2
},{
    timestamps:true
});
module.exports = mongoose.model('Encuesta', encuestaschema)