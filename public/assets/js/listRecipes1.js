document.addEventListener("DOMContentLoaded", function () {
    // Función para obtener el DNI de la URL
    
    function getDniFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("dni");
    }

    // Función para generar recetas y mostrarlas en el HTML
    function generateRecipes() {
        const dni = getDniFromUrl();

        if (!dni) {
            $("#menu-dish").html("<p>Error: DNI no encontrado en la URL.</p>");
            return;
        }

        $.get(`/patient/${dni}`, function (patient) {
            const level = patient.level;

            if (!level) {
                $("#menu-dish").html("<p>Error: El nivel del paciente no está definido.</p>");
                return;
            }

            $.get(`/recipes/level/${level}`, function (recipes) {
                if (recipes.length === 0) {
                    $("#menu-dish").html(`<p>No se encontraron recetas para el nivel ${level}.</p>`);
                    return;
                }

                // Generar el contenido basado en la estructura del HTML proporcionado
                const content = recipes.map((recipe, index) => {
                    const downloadUrl = recipe.download;
                    return `
                    <div class="col-lg-4 col-sm-6 dish-box-wp" data-cat="recipe-${index + 1}">
                        <div class="dish-box text-center">
                            <div class="dist-img">
                                <img src="${recipe.image}" alt="${recipe.name}" style="width: 300px; height: 200px;">
                            </div>
                            <div class="dish-title">
                                <h3 class="h3-title">${recipe.name}</h3>
                            </div>
                            <div class="dist-bottom-row">
                                <ul>
                                    <li>
                                        <button id="open-recipe-modal-${index + 1}" class="dish-add-btn">Ver receta</button>
                                    </li>
                                    <li>
                                        <a href="${downloadUrl}" download class="dish-add-btn-download">
                                            <i class="uil uil-download-alt"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <button class="encuesta-btn btn-blue" data-recipe-id="${recipe._id}">Responder encuesta</button>
                                        <input type="hidden" id="encuesta-recipe-id" name="encuesta-recipe-id">
                                    </li>
                                </ul>
                            </div>

                            <!-- Modal -->
                            <div id="recipe-modal-${index + 1}" class="modal">
                                <div class="modal-content">
                                    <span class="close-button">&times;</span>
                                    <h4 class="mt-4">Ingredientes:</h4>
                                    <ul>
                                        ${recipe.ingredients.map(ing => `<li>• ${ing}</li>`).join("")}
                                    </ul>
                                    <h4 class="mt-4">Preparación:</h4>
                                    <ol>
                                        ${recipe.preparation.map(step => `<li>${step}</li>`).join("")}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join("");

                $("#menu-dish").html(content); // Insertar recetas generadas dinámicamente

                // Agregar eventos para abrir y cerrar modales
                var modalOpenButtons = document.querySelectorAll("[id^='open-recipe-modal-']");
                var modals = document.querySelectorAll("[id^='recipe-modal-']");
                var closeButtons = document.querySelectorAll(".close-button");
                var encuestaButtons = document.querySelectorAll(".encuesta-btn");

                modalOpenButtons.forEach((button, index) => {
                    button.addEventListener("click", function () {
                        modals[index].style.display = "block"; // Abrir el modal correspondiente
                    });
                });

                closeButtons.forEach((button, index) => {
                    button.addEventListener("click", function () {
                        modals[index].style.display = "none"; // Cerrar el modal correspondiente
                    });
                });

                modals.forEach((modal, index) => {
                    modal.addEventListener("mouseleave", function () {
                        modal.style.display = "none"; // Cerrar el modal cuando el mouse sale del área del modal
                    });
                });
                

                // Agregar evento para abrir el modal de la encuesta al hacer clic en "Responder encuesta"
                encuestaButtons.forEach(button => {
                    button.addEventListener("click", function () {
                        const recipeId = button.getAttribute("data-recipe-id");
                        openEncuestaModal(recipeId);
                    });
                });
            }).fail(function (xhr) {
                $("#menu-dish").html(`<p>Error al obtener recetas para el nivel ${level}: ${xhr.responseText}</p>`);
            });

        }).fail(function (xhr) {
            $("#menu-dish").html(`<p>Error al obtener información del paciente: ${xhr.responseText}</p>`);
        });
    }

    // Función para abrir el modal de la encuesta y almacenar el ID de la receta
    function openEncuestaModal(recipeId) {
        const encuestaModal = document.getElementById("encuesta-modal");
        encuestaModal.style.display = "block";
        // Almacena el ID de la receta en un campo oculto dentro del modal de la encuesta
        document.getElementById("encuesta-recipe-id").value = recipeId;
    }


    // Función para cerrar el modal de la encuesta
    function closeEncuestaModal() {
        const encuestaModal = document.getElementById("encuesta-modal");
        encuestaModal.style.display = "none";
    }

    // Función para guardar la encuesta en la base de datos
    function saveEncuesta() {
        const dni = getDniFromUrl();
        const recipeId = document.getElementById("encuesta-recipe-id").value;
        // Obtener el ID del paciente basado en su DNI
        $.get(`/patient/byDni/${dni}`, function (patient) {
            const pacienteID = patient._id;

            // Formar el objeto de datos para la encuesta
            const formData = {
                comida: $("input[name='comida']:checked").val(),
                tragar: $("input[name='tragar']:checked").val(),
                tosio: $("input[name='tosio']:checked").val(),
                voz: $("input[name='voz']:checked").val(),
                variasveces: $("input[name='variasveces']:checked").val(),
                tecnicaespecial: $("input[name='tecnicaespecial']:checked").val(),
                ayudo: $("input[name='ayudo']:checked").val(),
                malestar: $("input[name='malestar']:checked").val(),
                pacienteID: pacienteID, // Usar el ID del paciente
                recipeId: recipeId
            };

            // Guardar la encuesta en la base de datos
            $.post(`/encuestas/${pacienteID}`, formData, function (data) {
                alert(data); // Mostrar mensaje de éxito
                closeEncuestaModal(); // Cerrar el modal después de guardar la encuesta
            }).fail(function (xhr) {
                alert(`Error al guardar la encuesta: ${xhr.responseText}`); // Mostrar mensaje de error
            });

        }).fail(function (xhr) {
            alert(`Error al obtener información del paciente: ${xhr.responseText}`); // Mostrar mensaje de error
        });
    }

    // Generar recetas cuando el documento está listo
    generateRecipes();

    // Evento para cerrar el modal de la encuesta cuando se hace clic en la "X"
    $(".close-encuesta-modal").click(function () {
        closeEncuestaModal();
    });

    // Escuchar el envío del formulario de encuesta
    $("#encuesta-form").on("submit", function (e) {
        e.preventDefault(); // Prevenir el envío por defecto

        // Aquí puedes agregar la lógica para enviar la encuesta
        saveEncuesta(); // Guardar la encuesta
        // Mostrar notificación de éxito con SweetAlert2
        Swal.fire({
            icon: 'success',
            title: '¡Encuesta enviada!',
            text: '¡Gracias por tu participación!',
            showConfirmButton: false,
            timer: 2000 // Cerrar automáticamente después de 2 segundos
        });
        // Recargar la página después de un tiempo determinado
        setTimeout(function () {
            location.reload(); // Recargar la página actual
        }, 1500); // Recargar después de 3 segundos (3000 milisegundos)

    });

});
