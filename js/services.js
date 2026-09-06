/* =========================================================
   SOCHOU HAIR BEAUTY SALON - Rendu des services
   Remplit les grilles #services-grid depuis la base locale.
   ========================================================= */
(function () {
  "use strict";

  var grids = document.querySelectorAll("#services-grid");
  if (!grids.length || !window.SochouData) return;

  var services = window.SochouData.getServices();

  var html = services.map(function (service) {
    var icon = window.SochouData.escapeHtml(service.icone || (service.nom ? service.nom.charAt(0) : "S"));
    var name = window.SochouData.escapeHtml(service.nom);
    var desc = window.SochouData.escapeHtml(service.description);
    var image = window.SochouData.resolveImagePath(service.image || "images/services/coiffures.png");
    return (
      '<article class="card">' +
        '<div class="card-media"><img src="' + image + '" alt="' + name + '"></div>' +
        '<div class="card-body">' +
          '<span class="service-icon">' + icon + '</span>' +
          '<h3>' + name + '</h3>' +
          '<p>' + desc + '</p>' +
          '<a class="btn btn-dark" href="contact.html">Réserver</a>' +
        '</div>' +
      '</article>'
    );
  }).join("");

  grids.forEach(function (grid) {
    grid.innerHTML = html;
  });
})();