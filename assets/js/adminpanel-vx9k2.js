const SUPABASE_URL = "https://wenwseckngextivnulqy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbndzZWNrbmdleHRpdm51bHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDQwODIsImV4cCI6MjA5NTUyMDA4Mn0.vhH_AbPB0Hs9yehPUOWRR7XLn_ei--g4efy8u-X9aok";
const ALLOWED_ADMIN_EMAIL = "prudhvi@varadanexus.com";

const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authMessage = document.getElementById("auth-message");
const adminMessage = document.getElementById("admin-message");
const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");

const stateLabels = {
  "all-india": "All India", "andhra-pradesh": "Andhra Pradesh", telangana: "Telangana", "tamil-nadu": "Tamil Nadu",
  karnataka: "Karnataka", maharashtra: "Maharashtra", delhi: "Delhi", kerala: "Kerala", "other-states": "Other States",
};

const refs = {
  complianceForm: document.getElementById("compliance-form"), teamForm: document.getElementById("team-form"), careerForm: document.getElementById("career-form"), settingsForm: document.getElementById("settings-form"),
  complianceSubmit: document.getElementById("compliance-submit"), teamSubmit: document.getElementById("team-submit"), careerSubmit: document.getElementById("career-submit"),
  complianceClear: document.getElementById("compliance-clear"), teamClear: document.getElementById("team-clear"), careerClear: document.getElementById("career-clear"),
  tImageFile: document.getElementById("t-image-file"), tImage: document.getElementById("t-image"), tImagePreview: document.getElementById("t-image-preview"), tTags: document.getElementById("t-tags"), tTagsPreview: document.getElementById("t-tags-preview"),
};

function msg(el, m, err = false) { if (!el) return; el.textContent = m; el.style.color = err ? "#b91c1c" : "#334155"; }
const setAuthMessage = (m, e = false) => msg(authMessage, m, e);
const setAdminMessage = (m, e = false) => msg(adminMessage, m, e);

function setViewAuthenticated(on) { if (!loginPanel || !dashboard) return; loginPanel.classList.toggle("hidden", on); dashboard.classList.toggle("hidden", !on); }

function switchTab(tab) {
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach((b) => { b.classList.remove("btn-primary"); b.classList.add("btn-secondary"); });
  document.getElementById(`tab-${tab}`)?.classList.remove("hidden");
  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`); if (btn) { btn.classList.remove("btn-secondary"); btn.classList.add("btn-primary"); }
}

function activeBadge(v) { return `<span class="trust-chip" style="background:${v ? "#ecfdf5" : "#fee2e2"};color:${v ? "#166534" : "#991b1b"};">${v ? "Active" : "Inactive"}</span>`; }

function renderRecord(container, html, onEdit, onDelete) {
  const item = document.createElement("div");
  item.className = "card p-3 flex items-start justify-between gap-3";
  item.innerHTML = `<div class="text-sm subtitle">${html}</div><div class="flex gap-2"><button class="btn-secondary">Edit</button><button class="btn-secondary">Delete</button></div>`;
  const [editBtn, delBtn] = item.querySelectorAll("button");
  editBtn.onclick = onEdit; delBtn.onclick = onDelete;
  container.appendChild(item);
}

function resetComplianceForm() { refs.complianceForm?.reset(); document.getElementById("compliance-id").value = ""; refs.complianceSubmit.textContent = "Save Compliance Item"; }
function resetTeamForm() { refs.teamForm?.reset(); document.getElementById("team-id").value = ""; refs.teamSubmit.textContent = "Save Team Member"; if (refs.tImagePreview) refs.tImagePreview.style.display = "none"; refs.tTagsPreview.textContent = ""; }
function resetCareerForm() { refs.careerForm?.reset(); document.getElementById("career-id").value = ""; refs.careerSubmit.textContent = "Save Career Opening"; }

async function uploadTeamImageIfSelected() {
  const file = refs.tImageFile?.files?.[0];
  if (!file) return refs.tImage?.value?.trim() || "";
  const session = (await supabaseClient.auth.getSession()).data.session;
  if (!session) throw new Error("You must be logged in to upload images.");
  const filePath = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error } = await supabaseClient.storage.from("team-images").upload(filePath, file, { upsert: true });
  if (error) throw new Error("Image upload failed. Check Supabase Storage bucket and policies.");
  const { data } = supabaseClient.storage.from("team-images").getPublicUrl(filePath);
  return data?.publicUrl || "";
}

async function ensureAdminSession() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) return setAuthMessage(error.message, true);
  const session = data?.session;
  if (!session) return setViewAuthenticated(false);
  if (session.user?.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    await supabaseClient.auth.signOut();
    setAuthMessage("Access denied. Only allowed admin email can log in.", true);
    return setViewAuthenticated(false);
  }
  setViewAuthenticated(true);
  switchTab("compliance");
  await Promise.all([loadComplianceItems(), loadTeamMembers(), loadCareers(), loadSiteSettings()]);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("admin-email")?.value?.trim().toLowerCase();
  const password = document.getElementById("admin-password")?.value;
  if (email !== ALLOWED_ADMIN_EMAIL.toLowerCase()) return setAuthMessage("Access denied. Unauthorized admin email.", true);
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return setAuthMessage(error.message, true);
  setAuthMessage("Login successful.");
  await ensureAdminSession();
}

async function handleLogout() { await supabaseClient.auth.signOut(); setViewAuthenticated(false); setAuthMessage("Logged out."); }

async function loadComplianceItems() {
  const container = document.getElementById("compliance-list"); if (!container) return;
  container.innerHTML = "";
  const { data, error } = await supabaseClient.from("compliance_calendar").select("*").order("id", { ascending: false });
  if (error) return setAdminMessage(`Compliance load error: ${error.message}`, true);
  (data || []).forEach((r) => renderRecord(container, `<strong>${r.title || "-"}</strong><br/>${r.category || "-"} • ${stateLabels[r.state] || r.state || "-"} • ${r.status || "-"}<br/>${activeBadge(r.is_active !== false)}`, () => {
    document.getElementById("compliance-id").value = r.id || ""; document.getElementById("c-title").value = r.title || ""; document.getElementById("c-category").value = r.category || "";
    document.getElementById("c-state").value = r.state || ""; document.getElementById("c-due-date").value = r.due_date || ""; document.getElementById("c-frequency").value = r.frequency || "";
    document.getElementById("c-applicable").value = r.applicable_to || ""; document.getElementById("c-description").value = r.description || ""; document.getElementById("c-status").value = r.status || "Indicative";
    document.getElementById("c-source").value = r.source_url || ""; document.getElementById("c-national").checked = !!r.is_national; document.getElementById("c-active").checked = r.is_active !== false;
    refs.complianceSubmit.textContent = "Update Compliance Item";
  }, async () => {
    const { error: delError } = await supabaseClient.from("compliance_calendar").delete().eq("id", r.id);
    if (delError) return setAdminMessage(delError.message, true);
    setAdminMessage("Compliance item deleted."); await loadComplianceItems();
  }));
}

async function saveComplianceItem(e) {
  e.preventDefault();
  const id = document.getElementById("compliance-id").value;
  const payload = {
    title: document.getElementById("c-title").value, category: document.getElementById("c-category").value, state: document.getElementById("c-state").value,
    due_date: document.getElementById("c-due-date").value, frequency: document.getElementById("c-frequency").value, applicable_to: document.getElementById("c-applicable").value,
    description: document.getElementById("c-description").value, status: document.getElementById("c-status").value, source_url: document.getElementById("c-source").value,
    is_national: document.getElementById("c-national").checked, is_active: document.getElementById("c-active").checked,
  };
  const { error } = id ? await supabaseClient.from("compliance_calendar").update(payload).eq("id", id) : await supabaseClient.from("compliance_calendar").insert([payload]);
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage(id ? "Compliance item updated." : "Compliance item added."); resetComplianceForm(); await loadComplianceItems();
}

async function loadTeamMembers() {
  const container = document.getElementById("team-list"); if (!container) return;
  container.innerHTML = "";
  const { data, error } = await supabaseClient.from("team_members").select("*").order("display_order", { ascending: true });
  if (error) return setAdminMessage(`Team load error: ${error.message}`, true);
  (data || []).forEach((r) => renderRecord(container, `${r.image_url ? `<img src="${r.image_url}" alt="${r.name}" class="h-10 w-10 rounded-full object-cover inline-block mr-2"/>` : ""}<strong>${r.name || "-"}</strong><br/>${r.designation || "-"}<br/>${r.tags || ""}<br/>${activeBadge(r.is_active !== false)}`, () => {
    document.getElementById("team-id").value = r.id || ""; document.getElementById("t-name").value = r.name || ""; document.getElementById("t-designation").value = r.designation || "";
    document.getElementById("t-bio").value = r.bio || ""; document.getElementById("t-image").value = r.image_url || ""; document.getElementById("t-tags").value = Array.isArray(r.tags) ? r.tags.join(", ") : (r.tags || "");
    document.getElementById("t-order").value = r.display_order || ""; document.getElementById("t-active").checked = r.is_active !== false;
    refs.tTagsPreview.textContent = (r.tags || "").split(",").map((t) => t.trim()).filter(Boolean).join(" | ");
    if (r.image_url && refs.tImagePreview) { refs.tImagePreview.src = r.image_url; refs.tImagePreview.style.display = "block"; }
    refs.teamSubmit.textContent = "Update Team Member";
  }, async () => {
    const { error: delError } = await supabaseClient.from("team_members").delete().eq("id", r.id);
    if (delError) return setAdminMessage(delError.message, true);
    setAdminMessage("Team member deleted."); await loadTeamMembers();
  }));
}

async function saveTeamMember(e) {
  e.preventDefault();
  const id = document.getElementById("team-id").value;
  const tagsArray = document
    .getElementById("t-tags")
    .value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  let imageUrl = "";
  try { imageUrl = await uploadTeamImageIfSelected(); }
  catch (err) { return setAdminMessage(err.message, true); }
  const payload = {
    name: document.getElementById("t-name").value, designation: document.getElementById("t-designation").value, bio: document.getElementById("t-bio").value,
    image_url: imageUrl || document.getElementById("t-image").value, tags: tagsArray,
    display_order: Number(document.getElementById("t-order").value || 0), is_active: document.getElementById("t-active").checked,
  };
  const { error } = id ? await supabaseClient.from("team_members").update(payload).eq("id", id) : await supabaseClient.from("team_members").insert([payload]);
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage(id ? "Team member updated." : "Team member added."); resetTeamForm(); await loadTeamMembers();
}

async function loadCareers() {
  const container = document.getElementById("careers-list"); if (!container) return;
  container.innerHTML = "";
  const { data, error } = await supabaseClient.from("career_openings").select("*").order("id", { ascending: false });
  if (error) return setAdminMessage(`Careers load error: ${error.message}`, true);
  (data || []).forEach((r) => renderRecord(container, `<strong>${r.title || "-"}</strong><br/>${r.employment_type || "-"} • ${r.experience_level || "-"} • ${r.is_internship ? "Internship" : "Job"}<br/>${activeBadge(r.is_active !== false)}`, () => {
    document.getElementById("career-id").value = r.id || ""; document.getElementById("j-title").value = r.title || ""; document.getElementById("j-type").value = r.employment_type || "Full-time";
    document.getElementById("j-exp").value = r.experience_level || "Fresher"; document.getElementById("j-location").value = r.location || "";
    document.getElementById("j-description").value = r.description || ""; document.getElementById("j-requirements").value = r.requirements || "";
    document.getElementById("j-intern").checked = !!r.is_internship; document.getElementById("j-active").checked = r.is_active !== false;
    refs.careerSubmit.textContent = "Update Career Opening";
  }, async () => {
    const { error: delError } = await supabaseClient.from("career_openings").delete().eq("id", r.id);
    if (delError) return setAdminMessage(delError.message, true);
    setAdminMessage("Career opening deleted."); await loadCareers();
  }));
}

async function saveCareer(e) {
  e.preventDefault();
  const id = document.getElementById("career-id").value;
  const type = document.getElementById("j-type").value;
  const payload = {
    title: document.getElementById("j-title").value, employment_type: type, experience_level: document.getElementById("j-exp").value, location: document.getElementById("j-location").value,
    description: document.getElementById("j-description").value, requirements: document.getElementById("j-requirements").value,
    is_internship: document.getElementById("j-intern").checked, is_active: document.getElementById("j-active").checked,
  };
  const { error } = id ? await supabaseClient.from("career_openings").update(payload).eq("id", id) : await supabaseClient.from("career_openings").insert([payload]);
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage(id ? "Career opening updated." : "Career opening added."); resetCareerForm(); await loadCareers();
}

async function loadSiteSettings() {
  const { data, error } = await supabaseClient.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) return setAdminMessage(`Settings load error: ${error.message}`, true);
  if (!data) return;
  document.getElementById("s-id").value = data.id || ""; document.getElementById("s-phone").value = data.phone || ""; document.getElementById("s-email").value = data.email || "";
  document.getElementById("s-whatsapp").value = data.whatsapp || ""; document.getElementById("s-address").value = data.address || ""; document.getElementById("s-map").value = data.map_link || "";
  document.getElementById("s-footer").value = data.footer_text || "";
}

async function saveSiteSettings(e) {
  e.preventDefault();
  const id = document.getElementById("s-id").value;
  const payload = {
    phone: document.getElementById("s-phone").value, email: document.getElementById("s-email").value, whatsapp: document.getElementById("s-whatsapp").value,
    address: document.getElementById("s-address").value, map_link: document.getElementById("s-map").value, footer_text: document.getElementById("s-footer").value,
  };
  const { error } = id ? await supabaseClient.from("site_settings").update(payload).eq("id", id) : await supabaseClient.from("site_settings").insert([payload]);
  if (error) return setAdminMessage(error.message, true);
  setAdminMessage("Site settings saved."); await loadSiteSettings();
}

document.getElementById("login-form")?.addEventListener("submit", handleLogin);
document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
refs.complianceForm?.addEventListener("submit", saveComplianceItem);
refs.teamForm?.addEventListener("submit", saveTeamMember);
refs.careerForm?.addEventListener("submit", saveCareer);
refs.settingsForm?.addEventListener("submit", saveSiteSettings);

refs.complianceClear?.addEventListener("click", resetComplianceForm);
refs.teamClear?.addEventListener("click", resetTeamForm);
refs.careerClear?.addEventListener("click", resetCareerForm);

document.getElementById("c-state")?.addEventListener("change", (e) => { document.getElementById("c-national").checked = e.target.value === "all-india"; });
document.getElementById("j-type")?.addEventListener("change", (e) => { document.getElementById("j-intern").checked = ["Internship", "Articleship"].includes(e.target.value); });
refs.tTags?.addEventListener("input", () => { refs.tTagsPreview.textContent = (refs.tTags.value || "").split(",").map((t) => t.trim()).filter(Boolean).join(" | "); });
refs.tImageFile?.addEventListener("change", () => {
  const f = refs.tImageFile.files?.[0]; if (!f || !refs.tImagePreview) return;
  refs.tImagePreview.src = URL.createObjectURL(f); refs.tImagePreview.style.display = "block";
});

document.querySelectorAll(".tab-btn").forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

ensureAdminSession();
