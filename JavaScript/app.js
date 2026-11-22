
(() => {
  "use strict";

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  const $ = (id) => document.getElementById(id);

  const API = window.APP_CONFIG?.apiBaseUrl || "./api";

  let tickets = [];
  let toastTimer;

  // ==========================================
  // COMUNICACIÓN CON EL BACKEND
  // ==========================================

  async function api(path, options = {}) {
    const response = await fetch(`${API}/${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Error del servidor (${response.status}).`
      );
    }

    return data;
  }

  // ==========================================
  // NOTIFICACIONES
  // ==========================================

  function toast(message) {
    const element = $("toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      element.classList.remove("show");
    }, 3200);
  }

  // ==========================================
  // SEGURIDAD: ESCAPAR HTML
  // ==========================================

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);
  }

  // ==========================================
  // ETIQUETAS DE ESTADO
  // ==========================================

  function statusBadge(status) {
    let className = "other";

    if (status === "Pendiente") {
      className = "pending";
    }

    if (status === "En proceso") {
      className = "progress";
    }

    if (status === "Resuelta") {
      className = "resolved";
    }

    return `
      <span class="badge ${className}">
        ${escapeHTML(status)}
      </span>
    `;
  }

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  function updateStats() {
    $("stat-total").textContent = tickets.length;

    $("stat-pending").textContent =
      tickets.filter(t => t.status === "Pendiente").length;

    $("stat-progress").textContent =
      tickets.filter(t => t.status === "En proceso").length;

    $("stat-resolved").textContent =
      tickets.filter(t => t.status === "Resuelta").length;
  }

  // ==========================================
  // SOLICITUDES RECIENTES
  // ==========================================

  function renderRecent() {
    const recent = tickets.slice(0, 5);

    $("recent-body").innerHTML = recent.length
      ? recent.map(ticket => `
          <tr>
            <td>
              <b>${escapeHTML(ticket.code)}</b>
            </td>

            <td>
              ${escapeHTML(ticket.subject)}
            </td>

            <td>
              ${escapeHTML(ticket.requester)}
            </td>

            <td>
              ${escapeHTML(ticket.priority)}
            </td>

            <td>
              ${statusBadge(ticket.status)}
            </td>
          </tr>
        `).join("")
      : `
          <tr>
            <td colspan="5" class="empty">
              Todavía no hay solicitudes registradas.
            </td>
          </tr>
        `;
  }

  // ==========================================
  // TABLA DE SOLICITUDES
  // ==========================================

  function renderTickets() {
    const query = $("ticket-search").value.trim().toLowerCase();

    const status = $("status-filter").value;

    const filtered = tickets.filter(ticket => {
      const matchesStatus =
        !status || ticket.status === status;

      const searchable = [
        ticket.code,
        ticket.subject,
        ticket.requester,
        ticket.email
      ].some(value =>
        String(value ?? "").toLowerCase().includes(query)
      );

      return matchesStatus && searchable;
    });

    $("ticket-count").textContent =
      `${filtered.length} ${
        filtered.length === 1 ? "solicitud" : "solicitudes"
      }`;

    $("tickets-body").innerHTML = filtered.length
      ? filtered.map(ticket => `
          <tr>
            <td>
              <b>${escapeHTML(ticket.code)}</b>
            </td>

            <td>
              ${escapeHTML(ticket.subject)}
            </td>

            <td>
              ${escapeHTML(ticket.requester)}
            </td>

            <td>
              ${escapeHTML(ticket.priority)}
            </td>

            <td>
              ${statusBadge(ticket.status)}
            </td>

            <td>
              ${escapeHTML(ticket.created_at || "—")}
            </td>

            <td>
              <div class="ticket-actions">

                <select
                  class="action-select"
                  data-status-id="${Number(ticket.id)}"
                  aria-label="Cambiar estado"
                >
                  ${["Pendiente", "En proceso", "Resuelta"].map(value => `
                    <option
                      value="${value}"
                      ${value === ticket.status ? "selected" : ""}
                    >
                      ${value}
                    </option>
                  `).join("")}
                </select>

                <button
                  type="button"
                  class="action-button edit"
                  data-action="edit"
                  data-id="${Number(ticket.id)}"
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="action-button delete"
                  data-action="delete"
                  data-id="${Number(ticket.id)}"
                >
                  Eliminar
                </button>

              </div>
            </td>
          </tr>
        `).join("")
      : `
          <tr>
            <td colspan="7" class="empty">
              No se encontraron solicitudes.
            </td>
          </tr>
        `;
  }

  // ==========================================
  // RENDERIZAR INFORMACIÓN
  // ==========================================

  function render() {
    updateStats();
    renderRecent();
    renderTickets();
  }

  // ==========================================
  // CARGAR SOLICITUDES
  // ==========================================

  async function loadTickets() {
    try {
      const data = await api("tickets.php");

      tickets = Array.isArray(data.tickets)
        ? data.tickets
        : [];

      render();

    } catch (error) {
      toast(error.message);

      $("recent-body").innerHTML = `
        <tr>
          <td colspan="5" class="empty">
            No se pudieron cargar las solicitudes.
          </td>
        </tr>
      `;

      $("tickets-body").innerHTML = `
        <tr>
          <td colspan="7" class="empty">
            No se pudieron cargar las solicitudes.
          </td>
        </tr>
      `;
    }
  }

  // ==========================================
  // NAVEGACIÓN
  // ==========================================

  function navigate(viewId) {
    document.querySelectorAll(".view").forEach(section => {
      section.classList.toggle(
        "active",
        section.id === viewId
      );
    });

    document.querySelectorAll("[data-view]").forEach(link => {
      link.classList.toggle(
        "active",
        link.dataset.view === viewId
      );
    });

    const titles = {
      dashboard: "Resumen general",
      tickets: "Solicitudes de soporte",
      "new-ticket": "Nueva solicitud",
      alojamientos: "Procedimientos ALOJAMIENTOS"
    };

    $("page-title").textContent =
      titles[viewId] || "SoporteTI";

    if (viewId === "tickets" || viewId === "dashboard") {
      loadTickets();
    }
  }

  document.querySelectorAll("[data-view]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      navigate(link.dataset.view);
    });
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      navigate(button.dataset.go);
    });
  });

  // ==========================================
  // BÚSQUEDA Y FILTROS
  // ==========================================

  $("ticket-search").addEventListener("input", renderTickets);

  $("status-filter").addEventListener("change", renderTickets);

  // ==========================================
  // CREAR SOLICITUD
  // ==========================================

  $("ticket-form").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;

    const submitButton =
      form.querySelector('[type="submit"]');

    submitButton.disabled = true;

    try {
      const payload = Object.fromEntries(
        new FormData(form).entries()
      );

      const result = await api("tickets.php", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      form.reset();

      toast(
        result.code
          ? `Solicitud ${result.code} registrada correctamente.`
          : "Solicitud registrada correctamente."
      );

      navigate("tickets");

    } catch (error) {
      toast(error.message);

    } finally {
      submitButton.disabled = false;
    }
  });

  // ==========================================
  // ABRIR VENTANA DE EDICIÓN
  // ==========================================

  function openEditModal(id) {
    const ticket = tickets.find(
      item => Number(item.id) === Number(id)
    );

    if (!ticket) {
      toast("No se encontró la solicitud.");

      return;
    }

    const form = $("edit-form");

    form.elements.namedItem("id").value = ticket.id;

    form.elements.namedItem("requester").value =
      ticket.requester || "";

    form.elements.namedItem("email").value =
      ticket.email || "";

    form.elements.namedItem("subject").value =
      ticket.subject || "";

    form.elements.namedItem("category").value =
      ticket.category || "Otro";

    form.elements.namedItem("priority").value =
      ticket.priority || "Media";

    form.elements.namedItem("description").value =
      ticket.description || "";

    $("edit-modal").classList.add("show");

    $("edit-modal").setAttribute(
      "aria-hidden",
      "false"
    );
  }

  // ==========================================
  // CERRAR VENTANA DE EDICIÓN
  // ==========================================

  function closeEditModal() {
    $("edit-modal").classList.remove("show");

    $("edit-modal").setAttribute(
      "aria-hidden",
      "true"
    );

    $("edit-form").reset();
  }

  $("close-modal").addEventListener(
    "click",
    closeEditModal
  );

  $("cancel-edit").addEventListener(
    "click",
    closeEditModal
  );

  $("edit-modal").addEventListener("click", event => {
    if (event.target === $("edit-modal")) {
      closeEditModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      $("edit-modal").classList.contains("show")
    ) {
      closeEditModal();
    }
  });

  // ==========================================
  // ACTUALIZAR SOLICITUD
  // ==========================================

  $("edit-form").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;

    const submitButton =
      form.querySelector('[type="submit"]');

    const payload = Object.fromEntries(
      new FormData(form).entries()
    );

    const id = payload.id;

    delete payload.id;

    submitButton.disabled = true;

    try {
      await api(
        `tickets.php?id=${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload)
        }
      );

      closeEditModal();

      toast("Solicitud actualizada correctamente.");

      await loadTickets();

    } catch (error) {
      toast(error.message);

    } finally {
      submitButton.disabled = false;
    }
  });

  // ==========================================
  // EVENTOS DE EDITAR Y ELIMINAR
  // ==========================================

  $("tickets-body").addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const { id, action } = button.dataset;

    // EDITAR SOLICITUD
    if (action === "edit") {
      openEditModal(id);

      return;
    }

    // ELIMINAR SOLICITUD
    if (action === "delete") {
      const confirmed = confirm(
        "¿Deseas eliminar esta solicitud? Esta acción no se puede deshacer."
      );

      if (!confirmed) return;

      button.disabled = true;

      try {
        await api(
          `ticket-delete.php?id=${encodeURIComponent(id)}`,
          {
            method: "DELETE"
          }
        );

        toast("Solicitud eliminada correctamente.");

        await loadTickets();

      } catch (error) {
        toast(error.message);

        button.disabled = false;
      }
    }
  });

  // ==========================================
  // CAMBIAR ESTADO
  // ==========================================

  $("tickets-body").addEventListener("change", async event => {
    const select = event.target.closest("[data-status-id]");

    if (!select) return;

    const previousTicket = tickets.find(
      ticket =>
        Number(ticket.id) === Number(select.dataset.statusId)
    );

    const previousStatus = previousTicket?.status;

    select.disabled = true;

    try {
      await api(
        `ticket-status.php?id=${encodeURIComponent(select.dataset.statusId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: select.value
          })
        }
      );

      toast("Estado actualizado correctamente.");

      await loadTickets();

    } catch (error) {
      toast(error.message);

      if (previousStatus) {
        select.value = previousStatus;
      }

    } finally {
      select.disabled = false;
    }
  });

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  $("current-year").textContent =
    new Date().getFullYear();

  loadTickets();

})();
