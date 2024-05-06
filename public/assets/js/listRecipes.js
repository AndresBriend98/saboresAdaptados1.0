// Un único archivo JS para manejar recetas y modales
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
                const content = recipes.map((recipe, index) => `
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
                `).join("");

                $("#menu-dish").html(content); // Insertar recetas generadas dinámicamente

                // Agregar eventos para abrir y cerrar modales
                var modalOpenButtons = document.querySelectorAll("[id^='open-recipe-modal-']");
                var modals = document.querySelectorAll("[id^='recipe-modal-']");
                var closeButtons = document.querySelectorAll(".close-button");

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

            }).fail(function (xhr) {
                $("#menu-dish").html(`<p>Error al obtener recetas para el nivel ${level}: ${xhr.responseText}</p>`);
            });

        }).fail(function (xhr) {
            $("#menu-dish").html(`<p>Error al obtener información del paciente: ${xhr.responseText}</p>`);
        });
    }

    // Generar recetas cuando el documento está listo
    generateRecipes();
});
