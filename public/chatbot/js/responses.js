function cleanInput(input) {
    // Elimina signos de puntuación y caracteres no alfanuméricos
    return input.replace(/[^a-záéíóúñü❤️ ]/gi, '').toLowerCase().trim();
}

function getBotResponse(input) {
    // Limpia el input de signos de puntuación y lo convierte a minúsculas
    input = cleanInput(input);

    if (input.includes("❤️")) {
        return "❤️";
    }

    // Saludos
    if (["hola", "buenas", "hello", "hi"].includes(input)) {
        return "¡Hola! ¿En qué puedo ayudarte?";
    } else if (["buenos días", "buen día"].includes(input)) {
        return "¡Buenos días!";
    } else if (["buenas tardes"].includes(input)) {
        return "¡Buenas tardes!";
    } else if (["buenas noches"].includes(input)) {
        return "¡Buenas noches!";

        // Despedidas
    } else if (["adios", "chau", "bye", "hasta luego", "nos vemos"].includes(input)) {
        return "¡Hasta pronto!";

        // Preguntas generales
    } else if (["como estas", "como estas", "que tal"].includes(input)) {
        return "Estoy bien, gracias por preguntar. ¿En qué puedo ayudarte?";

        // Información de contacto
    } else if (["contacto", "como contacto", "informacion de contacto"].includes(input)) {
        return "Puedes contactarnos por correo electrónico en saboresadaptados@gmail.com o llamando al +54 - 3794461980.";
    } else if (["donde estan ubicados", "ubicacion"].includes(input)) {
        return "Estamos ubicados en Corrientes, Capital.";

        // Preguntas sobre el chatbot
    } else if (["que puedes hacer", "cuales son tus funciones"].includes(input)) {
        return "Puedo ayudarte con información sobre menús, horarios, ubicaciones, contacto, y otras preguntas relacionadas con nuestro servicio.";

        // Consultas sobre horarios
    } else if (["horarios", "cuales son sus horarios", "horarios de atencion", "que dias trabajan"].includes(input)) {
        return "Estamos disponibles las 24 horas, todos los días de la semana.";

        // Respuestas genéricas
    } else if (["gracias", "thank you"].includes(input)) {
        return "¡De nada! ¿Hay algo más en lo que pueda ayudarte?";
    } else if (["disculpa", "lo siento"].includes(input)) {
        return "No hay problema. ¿Hay algo más que quieras saber?";


        // Consultas sobre qué ofrece la empresa
    } else if (["que ofrecen", "que ofrecen ustedes", "en que se especializan", "cuales son sus servicios", "servicios", "que hacen", "que brindan","beneficios"].includes(input)) {
        return (
            "Aquí obtendrás productos alimenticios con texturas modificadas o adaptadas para facilitar una adecuada nutrición " +
            "para personas con disfagia. Esto es importante para una deglución segura y eficaz, minimizando el riesgo de " +
            "atragantamiento y ayudando a reducir el miedo a atragantarse, lo que puede llevar a problemas de salud como " +
            "deshidratación o desnutrición."
        );

    } else if (["testimonios", "opiniones", "comentarios","opiniones de pacientes","comentarios de pacientes","testimonios de pacientes" ].includes(input)) {
        return (
            "Aquí tienes algunos comentarios de nuestros clientes:<br>" +
            "<br>• Lucia Campayo: <br>'Excelentes recetas.'<br>" +
            "<br>• Alfredo Dominguez: 'Sinceramente, mejoraron mis días, ¡gracias!'<br>" +
            "<br>• Pedro Wildemer: <br> 'Recetas bien explicadas.'<br>" +
            "<br>• Josias Rodriguez: 'Buenísimas las recetas.'"
        );

        // Descargar una receta
    } else if (["como descargar una receta", "descargar receta", "guardar receta", "descargar","descargar recetas", "guardar recetas"].includes(input)) {
        return (
            "Pasos para descargar una receta:<br>" +
            "1- Acceder a “Ver recetas”.<br>" +
            "2- Presionar en el botón con icono de descarga de la receta que quieras descargar.<br>" +
            "3- Se abrirá una ventana donde debes seleccionar donde quieres guardarla.<br>" +
            "4- ¡Listo!"
        );

        // Ver una receta
    } else if (["como ver una receta", "recetas", "ver una receta", "informacion de la receta", "visualizar una receta", "visualizar recetas","ver recetas","receta"].includes(input)) {
        return (
            "Pasos para visualizar una receta:<br>" +
            "1- Acceder a “Ver recetas”.<br>" +
            "2- Presionar en el botón de “Ver receta” de la receta que quieras visualizar, de esta forma se te desplegara una ventana.<br>" +
            "3- Dicha ventana, te mostrará los ingredientes y cómo prepararla.<br>" +
            "4- ¡A disfrutar!"
        );


    } else {
        return "No entiendo esa pregunta. ¿Podrías reformularla o preguntar algo diferente?";
    }

}
