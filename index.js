var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var cors = require("cors");
const multer = require("multer");
const path = require("path");
const Patients = require("./patientmodel")
const Encuesta = require("./encuestamodel")

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config(); // Cargar variables de entorno al inicio del servidor


const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`DB connected with host: ${mongoose.connection.host}`);
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

var db = mongoose.connection;

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets/images/recipes/"); // Carpeta donde se almacenarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Nombre del archivo
    },
});

const upload = multer({ storage });


app.post("/admin/login", async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    try {
        var admin = await db.collection("admin").findOne({ email });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).send("Email o contraseña incorrectos");
        }

        console.log("Administrador autenticado exitosamente");
        res.status(200).send("Login exitoso"); // Devolver texto simple para evitar errores
    } catch (error) {
        console.error("Error durante el login:", error);
        res.status(500).send("Error durante el login.");
    }
});

app.post("/admin/add-patient", async (req, res) => {
    const { name, surname, dni, birthDate, healthReport, level, image } = req.body;

    try {
        const admin = await db.collection("admin").findOne({ email: "saboresadaptados@gmail.com" });

        if (!admin) {
            return res.status(403).send("Acceso denegado");
        }

        // Verificar si el DNI ya existe en la colección de pacientes
        const existingPatient = await db.collection("patients").findOne({ dni });

        if (existingPatient) {
            // Si el DNI ya está registrado, devolver un error con código 409 (conflicto)
            return res.status(409).send("DNI ya registrado");
        }

        // Si no hay duplicados, agregar el nuevo paciente
        const patients = new Patients({
            name,
            surname,
            dni,
            birthDate,
            healthReport,
            level
        });
        await db.collection("patients").insertOne(patients); // Insertar el nuevo paciente

        // Devolver un mensaje de éxito si se insertó correctamente
        res.status(200).send("Paciente agregado con éxito");
    } catch (error) {
        // Si hay un error inesperado, devolver un código 500
        console.error("Error al agregar paciente:", error);
        res.status(500).send("Error al agregar paciente.");
    }
});
//Creacion de cuestionarios
app.post("/encuestas/:pacienteID", async (req, res) => {
    const {pacienteID} = req.params;//buscar paciente que creo el cuestionario
    var patient = await Patients.findById(pacienteID)
    const {comida, tragar, tosio, voz, variasveces,tecnicaespecial, ayudo, malestar} = req.body;

    try {
        const admin = await db.collection("admin").findOne({ email: "saboresadaptados@gmail.com" });

        if (!admin) {
            return res.status(403).send("Acceso denegado");
        }

        // Si no hay duplicados, agregar el nuevo paciente
        const encuestas = new Encuesta({
            comida,
            tragar,
            tosio,
            voz,
            variasveces,
            tecnicaespecial,
            ayudo,
            malestar,
            paciente: pacienteID
        });
        patient.encuestas.push(encuestas._id)
        await patient.save()//guardar cuestionario en el paciente
        await db.collection("encuestas").insertOne(encuestas); // Insertar el nuevo cuestionario

        // Devolver un mensaje de éxito si se insertó correctamente
        res.status(200).send("Cuestionario creado con exito");
    } catch (error) {
        // Si hay un error inesperado, devolver un código 500
        console.error("Error al agregar paciente:", error);
        res.status(500).send("Error al agregar paciente.");
    }
});
//Obtener informacion de respuestas
app.get("/encuestas/:encuestaID", async (req, res)=>{
    const {encuestaID} = req.params;//buscar la encuesta por encuesta
    try{
        const encuesta = await Encuesta.findById(encuestaID)
        if (!encuesta) {
            return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
        }
        res.status(200).json(encuesta);// devulve la informacion de la encuesta
    }catch (error) {
        console.error('Error al obtener la encuesta:', error);
        res.status(500).json({ mensaje: 'Error del servidor al obtener la encuesta' });
    }
})
// Endpoint para que el paciente acceda a sus datos usando el DNI
app.get("/patient/:dni", async (req, res) => {
    var dni = req.params.dni;

    try {
        var patient = await db.collection("patients").findOne({ dni: dni });

        if (!patient) {
            return res.status(404).send("Paciente no encontrado");
        }

        res.status(200).send(patient);
    } catch (error) {
        console.error("Error al buscar paciente:", error);
        res.status(500).send("Error al buscar paciente.");
    }
});

app.post("/patient/login", async (req, res) => {
    const dni = req.body.dni;

    try {
        const patient = await db.collection("patients").findOne({ dni });

        if (!patient) {
            return res.status(404).send("Paciente no registrado"); // Devuelve 404 si el paciente no se encuentra
        }

        res.status(200).send("Login exitoso!"); // Devuelve 200 si el paciente se encuentra
    } catch (error) {
        console.error("Error durante el login:", error);
        res.status(500).send("Error durante el login."); // Manejo de errores del servidor
    }
});

app.get("/patient/recipes/:dni", async (req, res) => {
    var dni = req.params.dni;

    try {
        var patient = await db.collection("patients").findOne({ dni: dni });

        if (!patient || !patient.recipes) {
            return res.status(404).send("No se encontraron recetas para este paciente");
        }

        const recipesArray = Array.isArray(patient.recipes) ? patient.recipes : [patient.recipes]; // Convertir en array si no lo es
        res.status(200).send(recipesArray);
    } catch (error) {
        console.error("Error al obtener recetas:", error);
        res.status(500).send("Error al obtener recetas.");
    }
});

// Endpoint para obtener todas las recetas disponibles
app.get("/recipes", async (req, res) => {
    try {
        const recipes = await db.collection("recipes").find({}).toArray(); // Recuperar todas las recetas
        res.status(200).json(recipes); // Devolver como JSON
    } catch (error) {
        console.error("Error al obtener recetas:", error);
        res.status(500).send("Error al obtener recetas.");
    }
});

app.get("/admin/patients", async (req, res) => {
    try {
        const patients = await db.collection("patients").find({}).toArray();
        res.status(200).send(patients);
    } catch (error) {
        console.error("Error al obtener pacientes:", error);
        res.status(500).send("Error al obtener pacientes.");
    }
});

// Redirigir "/" a "index.html"
app.get("/", (req, res) => {
    res.redirect("/index.html");
});

app.get("/recipes/level/:level", async (req, res) => {
    const level = parseInt(req.params.level, 10); // Asegurarse de que sea un número

    try {
        const recipes = await db.collection("recipes").find({ level }).toArray(); // Recetas por nivel

        if (recipes.length === 0) {
            return res.status(404).send("No se encontraron recetas para este nivel.");
        }

        res.status(200).json(recipes); // Devolver como JSON
    } catch (error) {
        console.error("Error al obtener recetas por nivel:", error);
        res.status(500).send("Error al obtener recetas por nivel.");
    }
});

app.post("/admin/add-recipe", upload.single("image"), async (req, res) => {
    const { name, ingredients, preparation, level } = req.body;
    const image = `assets/images/recipes/${req.file.originalname}`; // Ruta de la imagen guardada

    try {
        await db.collection("recipes").insertOne({
            name,
            image,
            ingredients: ingredients.split(",").map(item => item.trim()), // Procesar ingredientes
            preparation: preparation.split(",").map(item => item.trim()), // Procesar preparación
            level: parseInt(level, 10), // Convertir a número
        });

        res.status(200).send("Receta agregada con éxito!");
    } catch (error) {
        console.error("Error al agregar receta:", error);
        res.status(500).send("Error al agregar receta.");
    }
});

app.delete("/admin/recipe/:id", async (req, res) => {
    const recipeId = req.params.id;

    try {
        const objectId = new mongoose.Types.ObjectId(recipeId);
        const result = await db.collection("recipes").deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return res.status(404).send("Receta no encontrada.");
        }

        res.status(200).send("Receta eliminada con éxito.");
    } catch (error) {
        console.error("Error al eliminar receta:", error);
        res.status(500).send("Error del servidor al eliminar receta.");
    }
});

app.put("/admin/update-patient-level", async (req, res) => {
    const { dni, newLevel } = req.body;

    try {
        // Actualizar el nivel del paciente basado en el DNI
        const result = await db.collection("patients").updateOne(
            { dni }, // Criterio para encontrar el paciente
            { $set: { level: parseInt(newLevel, 10) } } // Actualizar el nivel
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Paciente no encontrado");
        }

        res.status(200).send("Nivel de adaptación modificado con éxito");
    } catch (error) {
        console.error("Error al modificar el nivel de adaptación:", error);
        res.status(500).send("Error al modificar el nivel de adaptación.");
    }
});
app.put("/admin/recipe/:id", upload.single("image"), async (req, res) => {
    const recipeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        return res.status(400).send("ID inválido");
    }

    const { name, ingredients, preparation, level } = req.body;
    const newImage = req.file ? `assets/images/recipes/${req.file.originalname}` : null;

    try {
        const updateData = {
            name,
            ingredients: ingredients.split(",").map((item) => item.trim()),
            preparation: preparation.split(",").map((item) => item.trim()),
            level: parseInt(level, 10),
        };

        if (newImage) {
            updateData.image = newImage;
        }

        const result = await db.collection("recipes").updateOne(
            { _id: new mongoose.Types.ObjectId(recipeId) },
            { $set: updateData }
        );

        res.status(200).send("Receta actualizada con éxito");
    } catch (error) {
        console.error("Error al actualizar receta:", error);
        res.status(500).send("Error al actualizar receta.");
    }
});

app.delete("/admin/patient/:dni", async (req, res) => {
    const dni = req.params.dni; // Obtener el DNI del parámetro de la solicitud

    try {
        const result = await db.collection("patients").deleteOne({ dni }); // Eliminar el paciente por DNI

        if (result.deletedCount === 0) { // Si no se eliminó nada
            return res.status(404).send("Paciente no encontrado"); // Respuesta con 404
        }

        res.status(200).send("Paciente eliminado con éxito"); // Respuesta con éxito
    } catch (error) {
        console.error("Error al eliminar paciente:", error);
        res.status(500).send("Error del servidor al eliminar paciente"); // Respuesta para errores del servidor
    }
});