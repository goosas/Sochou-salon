/**
 * SOCHOU HAIR BEAUTY SALON - Sélecteur d'images
 * =============================================
 * Interface permettant de choisir une image existante du projet.
 * Aucun téléversement, aucune utilisation de Firebase Storage.
 */

(function (window) {
  "use strict";

  const { getImagesByDossier, getAllImages } = window.SochouImages;

  /**
   * Crée et retourne un élément de sélecteur d'images.
   *
   * @param {Object} options
   * @param {string} options.dossier - dossier cible ("services", "galerie", "logo")
   * @param {string} options.valeurInitiale - chemin de l'image actuellement sélectionnée
   * @param {Function} options.onSelect - callback(chemin) appelé au choix d'une image
   * @param {HTMLElement} options.container - élément parent
   * @param {string} options.inputName - name de l'input hidden qui contiendra le chemin
   * @returns {HTMLElement} le conteneur du sélecteur
   */
  function createImageSelector(options) {
    const dossier = options.dossier || "services";
    const valeurInitiale = options.valeurInitiale || "";
    const onSelect = options.onSelect || function () {};
    const container = options.container;
    const inputName = options.inputName || "image";

    const wrapper = document.createElement("div");
    wrapper.className = "image-selector";

    // Champ caché qui contient le chemin sélectionné
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = inputName;
    hiddenInput.value = valeurInitiale;

    // Label et bouton d'ouverture
    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = "Image";

    const selectBtn = document.createElement("button");
    selectBtn.type = "button";
    selectBtn.className = "image-selector-trigger btn btn-outline btn-sm";
    selectBtn.textContent = "Sélectionner une image";

    // Zone d'aperçu
    const previewZone = document.createElement("div");
    previewZone.className = "image-selector-preview";
    previewZone.innerHTML = renderPreview(valeurInitiale);

    // Grille d'images (cachée par défaut)
    const gridContainer = document.createElement("div");
    gridContainer.className = "image-selector-grid-container hidden";

    const gridTitle = document.createElement("p");
    gridTitle.className = "image-selector-grid-title";
    gridTitle.textContent = "Images disponibles dans \"" + dossier + "\" :";

    const grid = document.createElement("div");
    grid.className = "image-selector-grid";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "image-selector-close btn btn-dark btn-sm";
    closeBtn.textContent = "Fermer";

    gridContainer.appendChild(gridTitle);
    gridContainer.appendChild(grid);
    gridContainer.appendChild(closeBtn);

    // Assemblage
    wrapper.appendChild(label);
    wrapper.appendChild(selectBtn);
    wrapper.appendChild(previewZone);
    wrapper.appendChild(gridContainer);
    wrapper.appendChild(hiddenInput);

    if (container) {
      container.appendChild(wrapper);
    }

    // Charger les images et peupler la grille
    getImagesByDossier(dossier).then(function (images) {
      grid.innerHTML = "";
      if (!images.length) {
        grid.innerHTML = '<p class="image-selector-empty">Aucune image dans ce dossier.</p>';
        return;
      }
      images.forEach(function (img) {
        const thumb = document.createElement("div");
        thumb.className = "image-selector-thumb";
        thumb.dataset.chemin = img.chemin;
        if (img.chemin === valeurInitiale) {
          thumb.classList.add("is-selected");
        }

        const imageEl = document.createElement("img");
        imageEl.src = "../../" + img.chemin;
        imageEl.alt = img.nom;
        imageEl.loading = "lazy";

        const nameEl = document.createElement("span");
        nameEl.className = "image-selector-thumb-name";
        nameEl.textContent = img.nom;

        thumb.appendChild(imageEl);
        thumb.appendChild(nameEl);

        thumb.addEventListener("click", function () {
          // Mettre à jour la sélection
          grid.querySelectorAll(".image-selector-thumb").forEach(function (t) {
            t.classList.remove("is-selected");
          });
          thumb.classList.add("is-selected");

          // Mettre à jour le champ caché et l'aperçu
          hiddenInput.value = img.chemin;
          previewZone.innerHTML = renderPreview(img.chemin);

          // Callback
          onSelect(img.chemin);

          // Fermer la grille
          gridContainer.classList.add("hidden");
        });

        grid.appendChild(thumb);
      });
    }).catch(function (err) {
      grid.innerHTML = '<p class="image-selector-empty">Erreur de chargement : ' + err.message + "</p>";
    });

    // Bouton d'ouverture
    selectBtn.addEventListener("click", function () {
      gridContainer.classList.toggle("hidden");
    });

    // Bouton fermer
    closeBtn.addEventListener("click", function () {
      gridContainer.classList.add("hidden");
    });

    return wrapper;
  }

  /**
   * Rendu HTML de l'aperçu de l'image sélectionnée.
   */
  function renderPreview(chemin) {
    if (!chemin) {
      return '<div class="image-selector-no-image">Aucune image sélectionnée</div>';
    }
    const parts = chemin.split("/");
    const fileName = parts[parts.length - 1];
    // Préfixe ../../ pour remonter depuis /pages/admin/ vers la racine
    const imagePath = "../../" + chemin;
    return (
      '<div class="image-selector-has-image">' +
      '<img src="' + imagePath + '" alt="' + fileName + '" loading="lazy">' +
      '<div class="image-selector-info">' +
      '<strong>' + fileName + "</strong>" +
      '<span class="image-selector-path">' + chemin + "</span>" +
      "</div>" +
      "</div>"
    );
  }

  // Exposition globale
  window.SochouImageSelector = {
    createImageSelector,
    renderPreview
  };
})(window);
