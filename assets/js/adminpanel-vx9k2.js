const SUPABASE_URL = "https://wenwseckngextivnulqy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbndzZWNrbmdleHRpdm51bHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDQwODIsImV4cCI6MjA5NTUyMDA4Mn0.vhH_AbPB0Hs9yehPUOWRR7XLn_ei--g4efy8u-X9aok";
const ALLOWED_ADMIN_EMAIL = "your-admin@email.com";

const authMessage = document.getElementById("auth-message");
const adminMessage = document.getElementById("admin-message");
const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");

function setAuthMessage(message, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b91c1c" : "#334155";
}

function setAdminMessage(message, isError = false) {
  if (!adminMessage) return;
  adminMessage.textContent = message;
  adminMessage.style.color = isError ? "#b91c1c" : "#334155";
}

if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_URL" || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
  setAuthMessage("Configure SUPABASE_URL and SUPABASE_ANON_KEY in assets/js/adminpanel-vx9k2.js", true);
}

const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function setViewAuthenticated(isAuthenticated) {
  if (!loginPanel || !dashboard) return;
  loginPanel.classList.toggle("hidden", isAuthenticated);
  dashboard.classList.toggle("hidden", !isAuthenticated);
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-secondary");
  });

  const panel = document.getElementById(`tab-${tabName}`);
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (panel) panel.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.classList.remove("btn-secondary");
    activeBtn.classList.add("btn-primary");
  }
}

async function ensureAdminSession() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setAuthMessage(error.message, true);
    return;
  }

  const session = data?.session;
  if (!session) {
    setViewAuthenticated(false);
    return;
  }

  const email = session.user?.email?.toLowerCase();
  if (email !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    await supabaseClient.auth.signOut();
    setAuthMessage("Access denied. Only allowed admin email can log in.", true);
    setViewAuthenticated(false);
    return;
  }

  setViewAuthenticated(true);
  switchTab("compliance");
  await Promise.all([loadComplianceItems(), loadTeamMembers(), loadCareers(), loadSiteSettings()]);
}

async function handleLogin(event) {
  event.preventDefault();
  if (!supabaseClient) return;

  const email = document.getElementById("admin-email")?.value?.trim().toLowerCase();
  const password = document.getElementById("admin-password")?.value;

  if (email !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    setAuthMessage("Access denied. Unauthorized admin email.", true);
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    setAuthMessage(error.message, true);
    return;
  }

  setAuthMessage("Login successful.");
  await ensureAdminSession();
}

async function handleLogout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  setViewAuthenticated(false);
  setAuthMessage("Logged out.");
}

function renderListItem(container, row, onEdit, onDelete) {
  const item = document.createElement("div");
  item.className = "card p-3 flex items-start justify-between gap-3";
  const preview = document.createElement("div");
  preview.className = "text-sm subtitle";
  preview.textContent = JSON.stringify(row);
  const actions = document.createElement("div");
  actions.className = "flex gap-2";
  const editBtn = document.createElement("button");
  editBtn.className = "btn-secondary";
  editBtn.textContent = "Edit";
  editBtn.onclick = () => onEdit(row);
  const delBtn = document.createElement("button");
  delBtn.className = "btn-secondary";
  delBtn.textContent = "Delete";
  delBtn.onclick = () => onDelete(row.id);
  actions.append(editBtn, delBtn);
  item.append(preview, actions);
  container.appendChild(item);
}

async function loadComplianceItems() {
  if (!supabaseClient) return;
  const container = document.getElementById("compliance-list");
  if (!container) return;
  container.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("compliance_calendar")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    setAdminMessage(`Compliance load error: ${error.message}`, true);
    return;
  }

  (data || []).forEach((row) => {
    renderListItem(
      container,
      row,
      (item) => {
        document.getElementById("compliance-id").value = item.id || "";
        document.getElementById("c-title").value = item.title || "";
        document.getElementById("c-category").value = item.category || "";
        document.getElementById("c-state").value = item.state || "";
        document.getElementById("c-due-date").value = item.due_date || "";
        document.getElementById("c-frequency").value = item.frequency || "";
        document.getElementById("c-applicable").value = item.applicable_to || "";
        document.getElementById("c-description").value = item.description || "";
        document.getElementById("c-status").value = item.status || "";
        document.getElementById("c-source").value = item.source_url || "";
        document.getElementById("c-national").checked = !!item.is_national;
        document.getElementById("c-active").checked = item.is_active !== false;
      },
      async (id) => {
        const { error: delError } = await supabaseClient.from("compliance_calendar").delete().eq("id", id);
        if (delError) return setAdminMessage(delError.message, true);
        setAdminMessage("Compliance item deleted.");
        await loadComplianceItems();
      }
    );
  });
}

async function saveComplianceItem(event) {
  event.preventDefault();
  if (!supabaseClient) return;

  const id = document.getElementById("compliance-id").value;
  const payload = {
    title: document.getElementById("c-title").value,
    category: document.getElementById("c-category").value,
    state: document.getElementById("c-state").value,
    due_date: document.getElementById("c-due-date").value,
    frequency: document.getElementById("c-frequency").value,
    applicable_to: document.getElementById("c-applicable").value,
    description: document.getElementById("c-description").value,
    status: document.getElementById("c-status").value,
    source_url: document.getElementById("c-source").value,
    is_national: document.getElementById("c-national").checked,
    is_active: document.getElementById("c-active").checked,
  };

  const query = id
    ? supabaseClient.from("compliance_calendar").update(payload).eq("id", id)
    : supabaseClient.from("compliance_calendar").insert([payload]);

  const { error } = await query;
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage(id ? "Compliance item updated." : "Compliance item added.");
  event.target.reset();
  document.getElementById("compliance-id").value = "";
  await loadComplianceItems();
}

async function loadTeamMembers() {
  if (!supabaseClient) return;
  const container = document.getElementById("team-list");
  if (!container) return;
  container.innerHTML = "";

  const { data, error } = await supabaseClient.from("team_members").select("*").order("display_order", { ascending: true });
  if (error) return setAdminMessage(`Team load error: ${error.message}`, true);

  (data || []).forEach((row) => {
    renderListItem(
      container,
      row,
      (item) => {
        document.getElementById("team-id").value = item.id || "";
        document.getElementById("t-name").value = item.name || "";
        document.getElementById("t-designation").value = item.designation || "";
        document.getElementById("t-bio").value = item.bio || "";
        document.getElementById("t-image").value = item.image_url || "";
        document.getElementById("t-tags").value = item.tags || "";
        document.getElementById("t-order").value = item.display_order || "";
        document.getElementById("t-active").checked = item.is_active !== false;
      },
      async (id) => {
        const { error: delError } = await supabaseClient.from("team_members").delete().eq("id", id);
        if (delError) return setAdminMessage(delError.message, true);
        setAdminMessage("Team member deleted.");
        await loadTeamMembers();
      }
    );
  });
}

async function saveTeamMember(event) {
  event.preventDefault();
  const id = document.getElementById("team-id").value;
  const payload = {
    name: document.getElementById("t-name").value,
    designation: document.getElementById("t-designation").value,
    bio: document.getElementById("t-bio").value,
    image_url: document.getElementById("t-image").value,
    tags: document.getElementById("t-tags").value,
    display_order: Number(document.getElementById("t-order").value || 0),
    is_active: document.getElementById("t-active").checked,
  };

  const query = id ? supabaseClient.from("team_members").update(payload).eq("id", id) : supabaseClient.from("team_members").insert([payload]);
  const { error } = await query;
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage(id ? "Team member updated." : "Team member added.");
  event.target.reset();
  document.getElementById("team-id").value = "";
  await loadTeamMembers();
}

async function loadCareers() {
  if (!supabaseClient) return;
  const container = document.getElementById("careers-list");
  if (!container) return;
  container.innerHTML = "";

  const { data, error } = await supabaseClient.from("career_openings").select("*").order("id", { ascending: false });
  if (error) return setAdminMessage(`Careers load error: ${error.message}`, true);

  (data || []).forEach((row) => {
    renderListItem(
      container,
      row,
      (item) => {
        document.getElementById("career-id").value = item.id || "";
        document.getElementById("j-title").value = item.title || "";
        document.getElementById("j-type").value = item.employment_type || "";
        document.getElementById("j-exp").value = item.experience_level || "";
        document.getElementById("j-location").value = item.location || "";
        document.getElementById("j-description").value = item.description || "";
        document.getElementById("j-requirements").value = item.requirements || "";
        document.getElementById("j-intern").checked = !!item.is_internship;
        document.getElementById("j-active").checked = item.is_active !== false;
      },
      async (id) => {
        const { error: delError } = await supabaseClient.from("career_openings").delete().eq("id", id);
        if (delError) return setAdminMessage(delError.message, true);
        setAdminMessage("Career opening deleted.");
        await loadCareers();
      }
    );
  });
}

async function saveCareer(event) {
  event.preventDefault();
  const id = document.getElementById("career-id").value;
  const payload = {
    title: document.getElementById("j-title").value,
    employment_type: document.getElementById("j-type").value,
    experience_level: document.getElementById("j-exp").value,
    location: document.getElementById("j-location").value,
    description: document.getElementById("j-description").value,
    requirements: document.getElementById("j-requirements").value,
    is_internship: document.getElementById("j-intern").checked,
    is_active: document.getElementById("j-active").checked,
  };

  const query = id ? supabaseClient.from("career_openings").update(payload).eq("id", id) : supabaseClient.from("career_openings").insert([payload]);
  const { error } = await query;
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage(id ? "Career opening updated." : "Career opening added.");
  event.target.reset();
  document.getElementById("career-id").value = "";
  await loadCareers();
}

async function loadSiteSettings() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) return setAdminMessage(`Settings load error: ${error.message}`, true);
  if (!data) return;

  document.getElementById("s-id").value = data.id || "";
  document.getElementById("s-phone").value = data.phone || "";
  document.getElementById("s-email").value = data.email || "";
  document.getElementById("s-whatsapp").value = data.whatsapp || "";
  document.getElementById("s-address").value = data.address || "";
  document.getElementById("s-map").value = data.map_link || "";
  document.getElementById("s-footer").value = data.footer_text || "";
}

async function saveSiteSettings(event) {
  event.preventDefault();
  const id = document.getElementById("s-id").value;
  const payload = {
    phone: document.getElementById("s-phone").value,
    email: document.getElementById("s-email").value,
    whatsapp: document.getElementById("s-whatsapp").value,
    address: document.getElementById("s-address").value,
    map_link: document.getElementById("s-map").value,
    footer_text: document.getElementById("s-footer").value,
  };

  const query = id ? supabaseClient.from("site_settings").update(payload).eq("id", id) : supabaseClient.from("site_settings").insert([payload]);
  const { error } = await query;
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage("Site settings saved.");
  await loadSiteSettings();
}

document.getElementById("login-form")?.addEventListener("submit", handleLogin);
document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
document.getElementById("compliance-form")?.addEventListener("submit", saveComplianceItem);
document.getElementById("team-form")?.addEventListener("submit", saveTeamMember);
document.getElementById("career-form")?.addEventListener("submit", saveCareer);
document.getElementById("settings-form")?.addEventListener("submit", saveSiteSettings);

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

ensureAdminSession();
