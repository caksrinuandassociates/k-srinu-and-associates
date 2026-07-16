(() => {
  const SUPABASE_URL = "https://wenwseckngextivnulqy.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_G_0-8rqFdUjIKvvvwuWbvA_jVANjCuJ";
  const SELECT_COLUMNS = "id,title,summary,content,category,link_url,pdf_url,starts_at,expires_at,display_order,created_at";
  let notifications = [];
  let loadPromise = null;
  let lastFocusedElement = null;

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  async function fetchNotifications() {
    const endpoint = new URL(`${SUPABASE_URL}/rest/v1/notifications`);
    endpoint.searchParams.set("select", SELECT_COLUMNS);
    endpoint.searchParams.set("order", "display_order.asc,starts_at.desc");
    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) throw new Error(`Notifications request failed (${response.status})`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  function ensureModal() {
    let modal = document.getElementById("notification-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "notification-modal";
    modal.className = "notification-modal hidden";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <button class="notification-modal-backdrop" type="button" data-notification-close aria-label="Close notification"></button>
      <section class="notification-modal-panel" role="dialog" aria-modal="true" aria-labelledby="notification-modal-title">
        <button class="notification-modal-close" type="button" data-notification-close aria-label="Close notification">×</button>
        <div class="notification-modal-meta">
          <span id="notification-modal-category"></span>
          <time id="notification-modal-date"></time>
        </div>
        <h2 id="notification-modal-title"></h2>
        <p id="notification-modal-summary" class="notification-modal-summary"></p>
        <div id="notification-modal-content" class="notification-modal-content"></div>
        <div class="notification-modal-actions">
          <a id="notification-modal-pdf" class="btn-secondary hidden" href="#" target="_blank" rel="noopener">View PDF</a>
          <a id="notification-modal-link" class="btn-secondary hidden" href="#" target="_blank" rel="noopener">Open related link</a>
          <a id="notification-modal-permalink" class="btn-primary" href="news.html">Open on News page</a>
          <button class="btn-secondary" type="button" data-notification-close>Close</button>
        </div>
      </section>`;
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-notification-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    });
    return modal;
  }

  function closeModal() {
    const modal = document.getElementById("notification-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("notification-modal-open");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function openNotification(id) {
    const item = notifications.find((record) => String(record.id) === String(id));
    if (!item) return;
    const modal = ensureModal();
    lastFocusedElement = document.activeElement;
    modal.querySelector("#notification-modal-category").textContent = item.category || "General";
    modal.querySelector("#notification-modal-date").textContent = formatDate(item.starts_at || item.created_at);
    modal.querySelector("#notification-modal-title").textContent = item.title || "Update";
    const summary = modal.querySelector("#notification-modal-summary");
    summary.textContent = item.summary || "";
    summary.hidden = !item.summary;
    modal.querySelector("#notification-modal-content").textContent = item.content || "";
    const pdfLink = modal.querySelector("#notification-modal-pdf");
    pdfLink.href = item.pdf_url || "#";
    pdfLink.classList.toggle("hidden", !item.pdf_url);
    const relatedLink = modal.querySelector("#notification-modal-link");
    relatedLink.href = item.link_url || "#";
    relatedLink.classList.toggle("hidden", !item.link_url);
    modal.querySelector("#notification-modal-permalink").href = `news.html?id=${encodeURIComponent(item.id)}`;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("notification-modal-open");
    modal.querySelector(".notification-modal-close")?.focus();
  }

  function createTickerGroup(items, duplicate = false) {
    const group = document.createElement("div");
    group.className = "notification-ticker-group";
    if (duplicate) group.setAttribute("aria-hidden", "true");
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "notification-ticker-item";
      button.dataset.notificationId = item.id;
      button.tabIndex = duplicate ? -1 : 0;
      const prefix = document.createElement("span");
      prefix.className = "notification-ticker-bullet";
      prefix.textContent = "";
      const copy = document.createElement("span");
      copy.className = "notification-ticker-copy";
      const title = document.createElement("strong");
      title.textContent = item.title || "Update";
      copy.appendChild(title);
      if (item.summary) {
        const summary = document.createElement("span");
        summary.textContent = item.summary;
        copy.appendChild(summary);
      }
      if (item.pdf_url || item.link_url) {
        const attachment = document.createElement("span");
        attachment.className = "notification-ticker-attachment";
        attachment.textContent = item.pdf_url ? "PDF" : "LINK";
        copy.appendChild(attachment);
      }
      button.append(prefix, copy);
      button.addEventListener("click", () => openNotification(item.id));
      group.appendChild(button);
    });
    return group;
  }

  function renderTicker(items = notifications) {
    const strip = document.getElementById("notification-strip");
    const ticker = document.getElementById("notification-ticker");
    if (!strip || !ticker) return;
    ticker.replaceChildren();
    if (!items.length) {
      strip.classList.add("hidden");
      return;
    }
    const track = document.createElement("div");
    track.className = "notification-ticker-track";
    const totalCharacters = items.reduce((sum, item) => sum + String(item.title || "").length + String(item.summary || "").length, 0);
    track.style.setProperty("--notification-duration", `${Math.min(90, Math.max(28, Math.round(totalCharacters / 7)))}s`);
    track.append(createTickerGroup(items), createTickerGroup(items, true));
    ticker.appendChild(track);
    strip.classList.remove("hidden");
  }

  function renderArchive(items = notifications) {
    const list = document.getElementById("news-list");
    const loading = document.getElementById("news-loading");
    const empty = document.getElementById("news-empty");
    if (!list) return;
    if (loading) loading.classList.add("hidden");
    list.replaceChildren();
    if (!items.length) {
      if (empty) empty.classList.remove("hidden");
      return;
    }
    if (empty) empty.classList.add("hidden");
    items.forEach((item) => {
      const article = document.createElement("article");
      article.className = "news-card card";
      const meta = document.createElement("div");
      meta.className = "news-card-meta";
      const category = document.createElement("span");
      category.textContent = item.category || "General";
      const date = document.createElement("time");
      date.textContent = formatDate(item.starts_at || item.created_at);
      meta.append(category, date);
      const title = document.createElement("h2");
      title.textContent = item.title || "Update";
      const summary = document.createElement("p");
      summary.textContent = item.summary || String(item.content || "").slice(0, 180);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "news-card-button";
      button.textContent = "Read full notification →";
      button.addEventListener("click", () => openNotification(item.id));
      article.append(meta, title, summary, button);
      list.appendChild(article);
    });
  }

  async function load() {
    if (!loadPromise) {
      loadPromise = fetchNotifications()
        .then((data) => {
          notifications = data;
          return data;
        })
        .catch(() => {
          notifications = [];
          return [];
        });
    }
    return loadPromise;
  }

  async function init() {
    ensureModal();
    const items = await load();
    renderTicker(items);
    renderArchive(items);
    const requestedId = new URLSearchParams(window.location.search).get("id");
    if (requestedId && items.some((item) => String(item.id) === requestedId)) {
      openNotification(requestedId);
    }
    return items;
  }

  window.NotificationCenter = {
    init,
    open: openNotification,
    close: closeModal,
    render(items) {
      notifications = Array.isArray(items) ? items : [];
      renderTicker(notifications);
      renderArchive(notifications);
    },
  };

  init();
})();
