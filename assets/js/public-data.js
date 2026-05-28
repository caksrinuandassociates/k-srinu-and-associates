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
    return String(tags)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((tag) => `<span class="trust-chip">${tag}</span>`)
      .join("");
  }

  async function renderTeamPage() {
    const list = document.getElementById("team-dynamic-list");
    const loading = document.getElementById("team-loading");
    const empty = document.getElementById("team-empty");
    if (!list) return;
    if (!client) {
      if (loading) loading.textContent = "Configure public Supabase keys in assets/js/public-data.js";
      return;
    }

    const { data, error } = await client
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (loading) loading.classList.add("hidden");
    if (error || !data || data.length === 0) {
      if (empty) empty.classList.remove("hidden");
      return;
    }

    list.innerHTML = data
      .map((m) => {
        const initials = (m.name || "TM")
          .split(" ")
          .map((x) => x[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const image = m.image_url
          ? `<img src="${m.image_url}" alt="${m.name}" class="h-16 w-16 rounded-full border border-slate-200 object-cover" />`
          : `<div class="profile-initial">${initials}</div>`;
        return `<article class="team-card lift reveal">${image}<h2 class="mt-4 font-bold text-navy text-xl">${m.name || ""}</h2><p class="text-sm font-semibold text-gold mt-1">${m.designation || ""}</p><p class="subtitle text-sm mt-2">${m.bio || ""}</p><div class="mt-3 flex flex-wrap gap-2">${chipList(m.tags)}</div></article>`;
      })
      .join("");
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
    if (!client) {
      if (loading) loading.textContent = "Configure public Supabase keys in assets/js/public-data.js";
      return;
    }

    const { data, error } = await client
      .from("compliance_calendar")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("due_date", { ascending: true });

    if (loading) loading.classList.add("hidden");
    if (error || !data || data.length === 0) {
      if (empty) empty.classList.remove("hidden");
      cardsContainer.innerHTML = "";
      return;
    }

    cardsContainer.innerHTML = data
      .map((item) => {
        const state = item.state || (item.is_national ? "all-india" : "other-states");
        return `<article class="calendar-card lift reveal" data-category="${item.category || "business-compliance"}" data-state="${state}"><span class="calendar-date">${item.due_date || item.frequency || "As notified"}</span><span class="trust-chip ml-2">${item.status || "Indicative"}</span><h3 class="mt-3 font-bold text-navy">${item.title || ""}</h3><p class="subtitle text-sm mt-2"><strong>Category:</strong> ${item.category || "N/A"}</p><p class="subtitle text-sm"><strong>State applicability:</strong> ${state}</p><p class="subtitle text-sm"><strong>Applicable to:</strong> ${item.applicable_to || "N/A"}</p><p class="subtitle text-sm"><strong>Description:</strong> ${item.description || "N/A"}</p><p class="subtitle text-sm"><strong>Source note:</strong> ${item.source_url || "Reference placeholder"}</p></article>`;
      })
      .join("");

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
