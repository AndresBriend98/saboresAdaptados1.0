function getBotResponse(input) {
    if (input == "hola") {
        return "¡Hola! ¿En que puedo ayudarte?";
    } else if (input == "adios") {
        return "¡Hasta pronto!";
    }

    if (input == "menu") {
        return "1) Almuerzo" ;
    } else if (input == "reportar") {
        return "Reportado!";
    } else {
        return "¡Pregúntame algo distinto!";
    }
    
}