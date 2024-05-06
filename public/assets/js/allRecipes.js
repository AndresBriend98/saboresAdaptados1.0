$(document).ready(function () {
    // Obtener todas las recetas
    function fetchAllRecipes() {
        $.get("/recipes", function (recipes) {
            const content = recipes.map((recipe, index) => `
                <div class="col-lg-4 col-sm-6 dish-box-wp all level${recipe.level}">
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
                                <button id="open-recipe-modal-${index + 1}" 
                                        class="dish-add-btn" 
                                        style="width: 100px; height: 80px; font-size: 1em; padding: 5px; border-radius: 5px; color: white; margin-top: 28px">
                                    Visualizar receta
                                </button>
                                <button id="delete-recipe-${index + 1}" 
                                        class="dish-delete-btn" 
                                        data-id="${recipe._id}"
                                        style="width: 100px; height: 80px; font-size: 1em; padding: 5px; border-radius: 5px; background: #ff0000; color: white; margin-top: 28px">
                                    Eliminar receta
                                </button>
                                    <button id="edit-recipe-${index + 1}" class="dish-edit-btn" data-id="${recipe._id}">Editar receta</button>
                                </li>
                            </ul>
                        </div>

                        <!-- Modal para mostrar detalles de la receta -->
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
            `).join(""); // Crear contenido a partir de las recetas

            $("#recipe-container").html(content); // Insertar contenido en el contenedor de recetas

            // Configurar eventos para abrir/cerrar modales y eliminar recetas
            var modalOpenButtons = document.querySelectorAll("[id^='open-recipe-modal-']");
            var modals = document.querySelectorAll("[id^='recipe-modal-']");
            var closeButtons = document.querySelectorAll(".close-button");

            modalOpenButtons.forEach((button, index) => {
                button.addEventListener("click", function (e) {
                    e.preventDefault(); // Prevenir el comportamiento predeterminado
                    const modal = modals[index];
                    modal.style.display = "block"; // Abrir el modal

                    // Evento para cerrar el modal al hacer clic fuera de él
                    $(document).on("click", function (e) {
                        const target = e.target;
                        if (!modal.contains(target) && target !== button) {
                            modal.style.display = "none"; // Cerrar el modal
                        }
                    });

                    // Cerrar el modal cuando el mouse se quita del área del modal
                    modal.addEventListener("mouseleave", function () {
                        modal.style.display = "none"; // Cerrar el modal al salir el mouse
                    });
                });
            });

            // Evento para cerrar el modal al hacer clic en el botón de cierre
            closeButtons.forEach((button, index) => {
                button.addEventListener("click", function (e) {
                    e.preventDefault(); // Prevenir el comportamiento por defecto
                    modals[index].style.display = "none"; // Cerrar el modal
                });
            });


            closeButtons.forEach((button, index) => {
                button.addEventListener("click", function (e) {
                    e.preventDefault(); // Prevenir comportamiento por defecto
                    modals[index].style.display = "none"; // Cerrar el modal
                });
            }); 

            // Evento para abrir el modal de edición
            $(".dish-edit-btn").on("click", function (e) {
                e.preventDefault(); // Prevenir el comportamiento por defecto
                const recipeId = $(this).data("id"); // Obtener el ID de la receta
                const recipe = recipes.find(r => r._id === recipeId); // Encontrar la receta correspondiente

                // Rellenar los campos del modal con los datos de la receta
                $("#edit-recipe-name").val(recipe.name);
                $("#edit-recipe-ingredients").val(recipe.ingredients.join(", "));
                $("#edit-recipe-preparation").val(recipe.preparation.join(", "));
                $("#edit-recipe-level").val(recipe.level);
                if (!recipeId) {
                    console.error("ID no proporcionado para editar receta");
                    return;
                }

                $("#edit-recipe-modal").show(); // Mostrar el modal de edición
                $("#edit-recipe-modal").data("recipe-id", recipeId); // Asignar el ID al modal
            });
            $(document).ready(function () {
                const modal = $("#edit-recipe-modal");
            
                // Evento para abrir el modal
                $(".dish-edit-btn").on("click", function (e) {
                    e.preventDefault(); // Prevenir comportamiento por defecto
                    modal.show(); // Abrir el modal
                });
            
                // Evento para cerrar el modal al hacer clic fuera de él
                $(document).on("click", function (e) {
                    // Si el clic no es dentro del modal, cerrarlo
                    if (!modal[0].contains(e.target) && !$(e.target).hasClass("dish-edit-btn")) {
                        modal.hide(); // Cerrar el modal
                    }
                });
            
                // Evento para cerrar el modal con el botón de cierre
                $(".close").on("click", function (e) {
                    e.preventDefault(); // Prevenir comportamiento por defecto
                    modal.hide(); // Cerrar el modal
                });
            });
            

            $(".close").on("click", function (e) {
                e.preventDefault(); // Prevenir el comportamiento por defecto
                $("#edit-recipe-modal").hide(); // Cerrar el modal de edición
            });

            // Configurar evento para guardar cambios al editar una receta
            $("#edit-recipe-form").on("submit", function (e) {
                e.preventDefault(); // Prevenir el comportamiento por defecto

                const formData = new FormData(); // Usar FormData para permitir archivos
                const recipeId = $("#edit-recipe-modal").data("recipe-id"); // Obtener el ID de la receta a modificar

                // Agregar datos al FormData
                formData.append("name", $("#edit-recipe-name").val());
                formData.append("ingredients", $("#edit-recipe-ingredients").val());
                formData.append("preparation", $("#edit-recipe-preparation").val());
                formData.append("level", $("#edit-recipe-level").val());
                formData.append("image", $("#edit-recipe-image")[0].files[0]); // Archivo de imagen

                $.ajax({
                    url: `/admin/recipe/${recipeId}`, // Ruta para editar receta
                    type: "PUT",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        $("#edit-recipe-modal").hide(); // Cerrar el modal después de editar
                        fetchAllRecipes(); // Recargar las recetas para ver los cambios
                    },
                    error: function (xhr) {
                        alert("Error al modificar receta: " + xhr.responseText); // Mostrar error
                    },
                });
            });
            // Configurar evento para filtrar por nivel
            $(".filter").on("click", function (e) {
                e.preventDefault(); // Prevenir comportamiento por defecto
                const filter = $(this).data("filter"); // Obtener el filtro
                $(".dish-box-wp").hide(); // Ocultar todas las recetas
                $(filter).show(); // Mostrar solo las recetas que coincidan con el filtro
            });

            // Activar el filtro "Todos" por defecto para mostrar todas las recetas
            $(".filter[data-filter='.all']").trigger("click");

            // Configurar evento para eliminar recetas con un modal de confirmación
            $(".dish-delete-btn").on("click", function (e) {
                e.preventDefault(); // Prevenir el comportamiento predeterminado
                const recipeId = $(this).data("id"); // Obtener el ID de la receta
                $("#delete-recipe-modal").data("recipe-id", recipeId).show(); // Mostrar el modal de confirmación
            });

            // Evento para cerrar el modal
            $(".close").on("click", function (e) {
                e.preventDefault(); // Prevenir el comportamiento predeterminado
                $("#delete-recipe-modal").hide(); // Cerrar el modal de confirmación
            });

            // Evento para confirmar la eliminación
            $("#confirm-delete").on("click", function (e) {
                e.preventDefault(); // Prevenir el comportamiento predeterminado
                const recipeId = $("#delete-recipe-modal").data("recipe-id"); // Obtener el ID de la receta
                $.ajax({
                    url: `/admin/recipe/${recipeId}`, // Ruta para eliminar receta
                    type: "DELETE",
                    success: function () {
                        fetchAllRecipes(); // Recargar la lista de recetas
                        $("#delete-recipe-modal").hide(); // Cerrar el modal después de eliminar
                    },
                });
            });
            
        });
    }

    fetchAllRecipes(); // Cargar todas las recetas al iniciar
    // Define estilos con hover para botones
    const hoverStyles = `
        .btn-green {
            background: #28a745;
            width: 70px;
            height: 30px;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }

        .btn-green:hover {
            background: #218838; // Efecto hover para el botón "Sí"
        }

        .dish-edit-btn{
            background: #28a745;
            width: 100px;
            height: 80px;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .dish-edit-btn:hover{
            background: #218838; // Efecto hover para el botón "Sí"
        }
        .btn-red {
            background: rgb(255, 0, 0);
            width: 70px;
            height: 30px;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }

        .btn-red:hover {
            background: rgb(200, 0, 0); // Efecto hover para el botón "No"
        }

        .btn
        `;

    // Añade el estilo CSS al documento
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.appendChild(document.createTextNode(hoverStyles));
    document.head.appendChild(styleElement);
    // Modal para confirmación de eliminación de receta, con estilo más compacto
    const deleteRecipeModal = `
        <div id="delete-recipe-modal" style="display: none; position: fixed; z-index: 1000; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 0px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); max-width: 500px; max-height: 500px">
            <div class="modal-content" style="text-align: center;">
                <div style="display: flex; justify-content: flex-end;">
                    <span class="close" style="cursor: pointer; font-size: 30px;">&times;</span>
                </div>
                <h3 class="mt-1" style="font-size: 1.3em; mb-5">¿Estás seguro/a que quieres eliminar esta receta?</h3>
                <div style="display: flex; justify-content: center; gap: 80px;">
                    <button id="confirm-delete" class="btn-red mt-3" style="background: #28a745; width: 70px; height: 30px;">Sí</button>
                    <button class="close btn-red mt-3" style="background: rgb(255, 0, 0); width: 70px; height: 30px;">No</button>
                </div>

            </div>
        </div>
    `;

    $("body").append(deleteRecipeModal); // Agregar el modal al cuerpo del documento
});
