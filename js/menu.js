const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      closeMenu();
    }
  });
}

const appointmentTriggers = document.querySelectorAll("[data-appointment]");

if (appointmentTriggers.length) {
  const modal = document.createElement("div");

  modal.className = "appointment-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="appointment-overlay" data-modal-close></div>
    <div class="appointment-dialog" role="dialog" aria-modal="true" aria-labelledby="appointment-title">
      <button class="appointment-close" type="button" aria-label="Fermer la fenêtre" data-modal-close>×</button>
      <span class="section-kicker">Rendez-vous</span>
      <h2 id="appointment-title">Prendre rendez-vous</h2>
      <p>Remplissez ce formulaire et notre équipe vous recontactera pour confirmer votre passage au salon.</p>

      <form class="appointment-form" action="#" method="post">
        <div class="form-grid">
          <div class="form-field"><label for="appointment-name">Nom complet</label><input id="appointment-name" name="name" type="text" placeholder="Votre nom" required></div>
          <div class="form-field"><label for="appointment-phone">Téléphone</label><input id="appointment-phone" name="phone" type="tel" placeholder="+228 ..." required></div>
          <div class="form-field">
            <label for="appointment-service">Service souhaité</label>
            <select id="appointment-service">
              <option>Coiffures</option>
              <option>tresses</option>
              <option>pédicure</option>
              <option>manucure</option>
              <option>soins capillaires</option>
              <option>pose-perruques</option>
            </select>
          </div>
          <div class="form-field"><label for="appointment-date">Date souhaitée</label><input id="appointment-date" name="date" type="date"></div>
          <div class="form-field full"><label for="appointment-message">Message</label><textarea id="appointment-message" name="message" placeholder="Ajoutez une précision si besoin"></textarea></div>
          <div class="form-field full"><button class="btn btn-dark" type="submit">Envoyer la demande</button></div>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Charger dynamiquement les services dans le select
  const serviceSelect = document.getElementById("appointment-service");
  if (serviceSelect && window.SochouServices) {
    window.SochouServices.getServices(true).then((services) => {
      if (services.length) {
        serviceSelect.innerHTML = "";
        services.forEach((service) => {
          const option = document.createElement("option");
          option.value = service.nom;
          option.textContent = service.nom;
          serviceSelect.appendChild(option);
        });
      }
    }).catch(() => {});
  }

  const closeButtons = modal.querySelectorAll("[data-modal-close]");
  const form = modal.querySelector(".appointment-form");
  const firstInput = modal.querySelector("input");

  const openAppointmentModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => firstInput.focus(), 80);
  };

  const closeAppointmentModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  appointmentTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openAppointmentModal();
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeAppointmentModal);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";

    const data = {
      nomClient: document.getElementById("appointment-name").value.trim(),
      telephone: document.getElementById("appointment-phone").value.trim(),
      service: document.getElementById("appointment-service").value,
      date: document.getElementById("appointment-date").value,
      message: document.getElementById("appointment-message").value.trim(),
      heure: ""
    };

    // Si Firebase est disponible, enregistrer le rendez-vous
    if (window.SochouRendezVous) {
      window.SochouRendezVous.createRendezVous(data).then(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer la demande";
        closeAppointmentModal();
        if (window.SochouData && window.SochouData.showThankYou) {
          window.SochouData.showThankYou(
            "Demande de rendez-vous envoyée !",
            "Merci pour votre confiance. Notre équipe vous recontactera très rapidement pour confirmer votre passage au salon."
          );
        }
      }).catch((err) => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer la demande";
        closeAppointmentModal();
        if (window.SochouData && window.SochouData.showToast) {
          window.SochouData.showToast("Erreur lors de l'envoi : " + err.message, "error");
        } else {
          alert("Erreur lors de l'envoi : " + err.message);
        }
      });
    } else {
      // Mode dégradé sans Firebase
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer la demande";
      closeAppointmentModal();
      if (window.SochouData && window.SochouData.showThankYou) {
        window.SochouData.showThankYou(
          "Demande de rendez-vous envoyée !",
          "Merci pour votre confiance. Notre équipe vous recontactera très rapidement pour confirmer votre passage au salon."
        );
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeAppointmentModal();
    }
  });
}
