const PUBLIC_SUPABASE_URL = "https://wenwseckngextivnulqy.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbndzZWNrbmdleHRpdm51bHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDQwODIsImV4cCI6MjA5NTUyMDA4Mn0.vhH_AbPB0Hs9yehPUOWRR7XLn_ei--g4efy8u-X9aok";

const PublicData = (() => {
  const client =
    window.supabase &&
    PUBLIC_SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
    PUBLIC_SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
      ? window.supabase.createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
      : null;

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  function setHref(id, href) {
    const el = document.getElementById(id);
    if (el && href) el.setAttribute("href", href);
  }

  function applySiteSettings(settings) {
    if (!settings) return;
    setText("footer-phone-text", settings.phone);
    setText("footer-email-text", settings.email);
    setText("footer-address-text", settings.address);
    setHref("footer-phone-link", settings.phone ? `tel:${settings.phone.replace(/\s+/g, "")}` : "");
    setHref("footer-email-link", settings.email ? `mailto:${settings.email}` : "");
    setHref("footer-map-link", settings.map_link);

    document.querySelectorAll(".wa-float").forEach((el) => {
      if (settings.whatsapp) el.setAttribute("href", `https://wa.me/${settings.whatsapp.replace(/\D+/g, "")}`);
    });
  }

  async function loadSiteSettings() {
    if (!client) return null;
    const { data, error } = await client.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) return null;
    applySiteSettings(data);
    return data;
  }

  function chipList(tags = "") {
    const source = Array.isArray(tags) ? tags : String(tags || "").split(",");
    return source
      .map((t) => String(t || "").trim())
      .filter(Boolean)
      .map((tag) => `<span class="trust-chip">${tag}</span>`)
      .join("");
  }

  function initialsFromName(name = "") {
    return String(name || "Team Member")
      .split(" ")
      .map((x) => x[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "TM";
  }

  async function renderTeamPage() {
    const list = document.getElementById("team-dynamic-list");
    const loading = document.getElementById("team-loading");
    const empty = document.getElementById("team-empty");
    const fallback = document.getElementById("team-fallback-content");
    const fallbackExtra = document.getElementById("team-fallback-extra");
    const modal = document.getElementById("team-profile-modal");
    const modalClose = document.getElementById("team-modal-close");
    const modalImage = document.getElementById("team-modal-image");
    const modalName = document.getElementById("team-modal-name");
    const modalDesignation = document.getElementById("team-modal-designation");
    const modalTags = document.getElementById("team-modal-tags");
    const modalBio = document.getElementById("team-modal-bio");
    const modalDescription = document.getElementById("team-modal-description");

    if (!list) {
      console.warn("[TeamPage] Missing #team-dynamic-list container");
      return;
    }
    list.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    if (!client) {
      console.warn("[TeamPage] Supabase client unavailable");
      if (loading) loading.textContent = "Configure public Supabase keys in assets/js/public-data.js";
      if (fallback) fallback.classList.remove("hidden");
      if (fallbackExtra) fallbackExtra.classList.remove("hidden");
      return;
    }

    const { data, error } = await client
      .from("team_members")
      .select("id, name, designation, bio, profile_description, image_url, tags, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    console.log("[TeamPage] Query result", { hasError: !!error, rows: Array.isArray(data) ? data.length : 0 });

    if (loading) loading.classList.add("hidden");
    if (error || !data || data.length === 0) {
      if (empty) empty.classList.remove("hidden");
      if (fallback) fallback.classList.remove("hidden");
      if (fallbackExtra) fallbackExtra.classList.remove("hidden");
      if (error) console.error("[TeamPage] team_members query error", error);
      return;
    }

    const esc = (v) => String(v ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));

    list.innerHTML = data
      .map((m, i) => {
        const safeName = m.name || "Team Member";
        const safeDesignation = m.designation || "Professional";
        const safeBio = m.bio || "";
        const initials = initialsFromName(safeName);
        const image = m.image_url
          ? `<img src="${m.image_url}" alt="${esc(safeName)}" class="team-dynamic-avatar h-20 w-20 rounded-full border border-[#e2e8f3] object-cover" />`
          : `<div class="team-dynamic-initial mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-[#e2e8f3] bg-[#f7f9fd] text-navy text-xl font-bold">${initials}</div>`;

        return `<article class="team-card card lift p-6 cursor-pointer border border-slate-200/80 shadow-[0_14px_28px_rgba(15,39,71,0.08)] transition hover:border-[#d9c48a]/60 min-h-[320px] flex flex-col items-center text-center max-w-[360px] w-full mx-auto" data-team-index="${i}">
          ${image}
          <h2 class="mt-4 text-center text-xl font-bold text-navy">${esc(safeName)}</h2>
          <p class="mt-1 text-center text-sm font-semibold text-[#e9a31a]">${esc(safeDesignation)}</p>
          <p class="subtitle text-sm mt-3 text-center leading-relaxed line-clamp-3">${esc(safeBio)}</p>
          <div class="mt-3 flex flex-wrap justify-center gap-2">${chipList(m.tags)}</div>
          <button class="btn-secondary mt-auto pt-4 team-view-profile" type="button" data-team-index="${i}">View Profile</button>
        </article>`;
      })
      .join("");

    list.querySelectorAll("img.team-dynamic-avatar").forEach((img) => {
      img.addEventListener("error", () => {
        const card = img.closest("article.team-card");
        const name = card?.querySelector("h2")?.textContent?.trim() || "Team Member";
        const initials = initialsFromName(name);
        const fallbackAvatar = document.createElement("div");
        fallbackAvatar.className = "team-dynamic-initial mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border border-[#e2e8f3] bg-[#f7f9fd] text-navy text-xl font-bold";
        fallbackAvatar.textContent = initials;
        img.replaceWith(fallbackAvatar);
      });
    });

    const renderedCount = list.querySelectorAll("article.team-card").length;
    console.log("[TeamPage] Rendered cards", renderedCount);
    if (renderedCount > 0) {
      if (fallback) fallback.classList.add("hidden");
      if (fallbackExtra) fallbackExtra.classList.add("hidden");
      if (empty) empty.classList.add("hidden");
    } else {
      if (fallback) fallback.classList.remove("hidden");
      if (fallbackExtra) fallbackExtra.classList.remove("hidden");
      if (empty) empty.classList.remove("hidden");
      return;
    }

    const openModal = (member) => {
      if (!modal || !member) return;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      if (modalImage) {
        modalImage.src = member.image_url || "assets/images/logo.png";
        modalImage.alt = member.name || "Team member";
        modalImage.onerror = () => {
          modalImage.src = "assets/images/logo.png";
        };
      }
      if (modalName) modalName.textContent = member.name || "";
      if (modalDesignation) modalDesignation.textContent = member.designation || "";
      if (modalTags) modalTags.innerHTML = chipList(member.tags);
      if (modalBio) modalBio.textContent = member.bio || "";
      if (modalDescription) modalDescription.textContent = member.profile_description || member.bio || "";
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      if (!modal) return;
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    };

    list.querySelectorAll("[data-team-index]").forEach((el) => {
      el.addEventListener("click", () => openModal(data[Number(el.getAttribute("data-team-index"))]));
    });
    list.querySelectorAll(".team-view-profile").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(data[Number(el.getAttribute("data-team-index"))]);
      });
    });

    modalClose?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  async function renderCareersPage() {
    const jobs = document.getElementById("careers-jobs-list");
    const interns = document.getElementById("careers-intern-list");
    const loading = document.getElementById("careers-loading");
    const empty = document.getElementById("careers-empty");
    if (!jobs || !interns) return;
    if (!client) {
      if (loading) loading.textContent = "Configure public Supabase keys in assets/js/public-data.js";
      return;
    }

    const { data, error } = await client.from("career_openings").select("*").eq("is_active", true).order("id", { ascending: false });
    if (loading) loading.classList.add("hidden");
    if (error || !data || data.length === 0) {
      if (empty) empty.classList.remove("hidden");
      return;
    }

    const renderCard = (j) => `<article class="service-card lift reveal"><h3 class="font-bold text-navy">${j.title || ""}</h3><p class="subtitle text-sm mt-2">${j.description || ""}</p><p class="text-xs mt-3 text-navy font-semibold">Experience: ${j.experience_level || "N/A"}</p><p class="text-xs text-gold font-semibold">Type: ${j.employment_type || (j.is_internship ? "Internship" : "Full-Time")}</p></article>`;
    const jobItems = data.filter((d) => !d.is_internship);
    const internItems = data.filter((d) => !!d.is_internship);

    jobs.innerHTML = jobItems.length ? jobItems.map(renderCard).join("") : `<p class="subtitle text-sm">No active full-time openings.</p>`;
    interns.innerHTML = internItems.length ? internItems.map(renderCard).join("") : `<p class="subtitle text-sm">No active internships.</p>`;
  }

  async function renderComplianceCalendarPage() {
    const cardsContainer = document.getElementById("compliance-cards");
    const stateSelector = document.getElementById("state-selector");
    const filters = document.querySelectorAll("#calendar-filters .filter-btn");
    const countEl = document.getElementById("filter-result-count");
    const loading = document.getElementById("compliance-loading");
    const empty = document.getElementById("compliance-empty");
    if (!cardsContainer || !stateSelector || !filters.length) return;

    const slugify = (value = "") =>
      String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const normalizeCategory = (value = "") => slugify(value) || "business-compliance";

    const parseStaticCards = () => {
      return Array.from(cardsContainer.querySelectorAll("article.calendar-card")).map((card, index) => {
        const title = card.querySelector("h3")?.textContent?.trim() || "Compliance Item";
        const unique_key = card.dataset.uniqueKey || slugify(title) || `static-${index}`;
        return {
          unique_key,
          title,
          category: normalizeCategory(card.dataset.category || "business-compliance"),
          state: card.dataset.state || "all-india",
          due_date: card.querySelector(".calendar-date")?.textContent?.trim() || "As notified",
          status: card.querySelector(".trust-chip")?.textContent?.trim() || "Indicative",
          applicable_to: card.querySelectorAll("p")[2]?.textContent?.replace("Applicable to:", "").trim() || "N/A",
          description: card.querySelectorAll("p")[3]?.textContent?.replace("Description:", "").trim() || "N/A",
          source_url: card.querySelectorAll("p")[4]?.textContent?.replace("Source note:", "").trim() || "Reference placeholder",
          is_active: true,
          display_order: index,
          _static: true,
        };
      });
    };

    const renderCards = (items) => {
      cardsContainer.innerHTML = items
        .map((item) => {
          const state = item.state || (item.is_national ? "all-india" : "other-states");
          const category = normalizeCategory(item.category);
          return `<article class="calendar-card lift reveal" data-unique-key="${item.unique_key || slugify(item.title)}" data-category="${category}" data-state="${state}"><span class="calendar-date">${item.due_date || item.frequency || "As notified"}</span><span class="trust-chip ml-2">${item.status || "Indicative"}</span><h3 class="mt-3 font-bold text-navy">${item.title || ""}</h3><p class="subtitle text-sm mt-2"><strong>Category:</strong> ${item.category || "N/A"}</p><p class="subtitle text-sm"><strong>State applicability:</strong> ${state}</p><p class="subtitle text-sm"><strong>Applicable to:</strong> ${item.applicable_to || "N/A"}</p><p class="subtitle text-sm"><strong>Description:</strong> ${item.description || "N/A"}</p><p class="subtitle text-sm"><strong>Source note:</strong> ${item.source_url || "Reference placeholder"}</p></article>`;
        })
        .join("");
    };

    const staticItems = parseStaticCards();
    let mergedItems = [...staticItems];

    try {
      if (client) {
        const { data, error } = await client
          .from("compliance_calendar")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true, nullsFirst: false })
          .order("due_date", { ascending: true });

        if (!error && Array.isArray(data)) {
          const map = new Map(staticItems.map((item) => [item.unique_key, item]));
          data.forEach((record, idx) => {
            const unique_key = record.unique_key || slugify(record.title) || `supabase-${record.id || idx}`;
            map.set(unique_key, {
              ...record,
              unique_key,
              category: normalizeCategory(record.category),
              state: record.state || (record.is_national ? "all-india" : "other-states"),
            });
          });
          mergedItems = Array.from(map.values()).sort((a, b) => {
            const ao = Number.isFinite(a.display_order) ? a.display_order : 99999;
            const bo = Number.isFinite(b.display_order) ? b.display_order : 99999;
            if (ao !== bo) return ao - bo;
            return String(a.title || "").localeCompare(String(b.title || ""));
          });
        }
      }
    } catch (_) {
      // Graceful fallback: static cards remain the baseline.
      mergedItems = [...staticItems];
    }

    if (loading) loading.classList.add("hidden");
    if (empty) empty.classList.add("hidden");
    renderCards(mergedItems);

    let activeCategory = "all";
    const cards = () => cardsContainer.querySelectorAll("[data-category][data-state]");

    const applyFilters = () => {
      const selectedState = stateSelector.value || "all-india";
      let visibleCount = 0;
      cards().forEach((card) => {
        const category = card.dataset.category;
        const states = (card.dataset.state || "").split(",").map((s) => s.trim());
        const categoryMatch = activeCategory === "all" || activeCategory === category;
        const stateMatch = selectedState === "all-india" ? states.includes("all-india") : states.includes("all-india") || states.includes(selectedState);
        const show = categoryMatch && stateMatch;
        card.style.transition = "opacity .22s ease";
        card.style.opacity = show ? "1" : "0";
        card.style.display = show ? "" : "none";
        if (show) visibleCount += 1;
      });
      if (countEl) countEl.textContent = `Showing ${visibleCount} compliance items`;
    };

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.filter || "all";
        filters.forEach((b) => {
          b.classList.remove("btn-primary");
          b.classList.add("btn-secondary");
        });
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
        applyFilters();
      });
    });
    stateSelector.addEventListener("change", applyFilters);
    applyFilters();
  }

  return {
    loadSiteSettings,
    renderTeamPage,
    renderCareersPage,
    renderComplianceCalendarPage,
  };
})();
