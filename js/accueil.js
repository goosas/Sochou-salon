/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Accueil
   Remplit la grille produits #accueil-products-grid depuis
   la base locale partagée (mêmes données que l'admin).
   ========================================================= */
(function () {
  "use strict";

  var D = window.SochouData;
  var grid = document.getElementById("accueil-products-grid");
  if (!D || !grid) return;

  var products = D.getProducts();
  if (!products.length) return;

  // Sélection : premier produit de chaque catégorie, puis
  // complément avec les produits suivants jusqu'à 6 cartes.
  var seen = {};
  var selection = [];

  D.CATEGORIES.forEach(function (cat) {
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      if ((p.categorie === cat.key || p.categorie === cat.label) && !seen[p.id]) {
        seen[p.id] = true;
        selection.push(p);
        break;
      }
    }
  });

  for (var j = 0; j < products.length && selection.length < 6; j++) {
    if (!seen[products[j].id]) {
      seen[products[j].id] = true;
      selection.push(products[j]);
    }
  }

  var html = selection.map(function (p) {
    var nom = D.escapeHtml(p.nom);
    var desc = D.escapeHtml(p.description);
    var prix = D.formatPrice(p.prix);
    var img = D.escapeHtml(D.resolveImagePath(p.image || "images/produits/huile de coco.jpeg"));
    return (
      '<article class="card product-card">' +
        '<div class="card-media"><img src="' + img + '" alt="' + nom + '"></div>' +
        '<div class="card-body">' +
          '<h3 class="product-name">' + nom + "</h3>" +
          '<p class="product-price">Prix unitaire : <strong>' + prix + " FCFA</strong></p>" +
          '<p class="product-desc">' + desc + "</p>" +
          '<a class="btn btn-dark" href="pages/boutique.html">Voir plus</a>' +
        "</div>" +
      "</article>"
    );
  }).join("");

  grid.innerHTML = html;
})();