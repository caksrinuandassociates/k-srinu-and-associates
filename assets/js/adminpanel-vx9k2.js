const SUPABASE_URL = "https://wenwseckngextivnulqy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_G_0-8rqFdUjIKvvvwuWbvA_jVANjCuJ";
// Add/remove admin emails here
const ALLOWED_ADMIN_EMAILS = [
  "prudhvi@varadanexus.com",
  "caksrinuandassociates@gmail.com"
];
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);
const refs = {
  loginForm: $("login-form"), logoutBtn: $("logout-btn"), authMsg: $("auth-message"), adminMsg: $("admin-message"),
  loginPanel: $("login-panel"), dashboard: $("dashboard"),
  complianceForm: $("compliance-form"), teamForm: $("team-form"), careerForm: $("career-form"), notificationForm: $("notification-form"), settingsForm: $("settings-form"), homepageStatsForm: $("homepage-stats-form"),
  complianceList: $("compliance-list"), teamList: $("team-list"), careersList: $("careers-list"), notificationsList: $("notifications-list"),
  complianceSearch: $("compliance-search"), teamSearch: $("team-search"), careersSearch: $("careers-search"), notificationsSearch: $("notifications-search"),
  complianceSubmit: $("compliance-submit"), teamSubmit: $("team-submit"), careerSubmit: $("career-submit"), notificationSubmit: $("notification-submit"),
  complianceClear: $("compliance-clear"), teamClear: $("team-clear"), careerClear: $("career-clear"), notificationClear: $("notification-clear"),
  complianceImportBaseline: $("compliance-import-baseline"),
  tImageFile: $("t-image-file"), tImage: $("t-image"), tImagePreview: $("t-image-preview"),
  tCropPreview: $("t-crop-preview"), tCropX: $("t-crop-x"), tCropY: $("t-crop-y"), tCropZoom: $("t-crop-zoom"),
  compliancePreview: $("compliance-live-preview"), teamPreview: $("team-live-preview"), careerPreview: $("career-live-preview"), notificationPreview: $("notification-live-preview"), settingsPreview: $("settings-live-preview"), homepageStatsPreview: $("homepage-stats-preview"),
  submissionSearch: $("submission-search"), submissionStatusFilter: $("submission-status-filter"),
  contactSubmissionsList: $("contact-submissions-list"), careerSubmissionsList: $("career-submissions-list"),
  contactSubmissionsLoading: $("contact-submissions-loading"), careerSubmissionsLoading: $("career-submissions-loading"),
  metricComplianceTotal: $("metric-compliance-total"), metricTeamActive: $("metric-team-active"), metricCareersActive: $("metric-careers-active"), metricNotificationsActive: $("metric-notifications-active"),
  metricContactNew: $("metric-contact-new"), metricCareerNew: $("metric-career-new"),
  qaAddCompliance: $("qa-add-compliance"), qaAddTeam: $("qa-add-team"), qaAddNotification: $("qa-add-notification"), qaViewSubmissions: $("qa-view-submissions"), qaUpdateSettings: $("qa-update-settings"),
  themeToggle: $("theme-toggle"),
  badgeOverviewContactNew: $("badge-overview-contact-new"), badgeOverviewCareerNew: $("badge-overview-career-new"), badgeOverviewCareersActive: $("badge-overview-careers-active"),
  badgeTabSubmissionsNew: $("badge-tab-submissions-new"), badgeTabCareersActive: $("badge-tab-careers-active"), badgeTabNotificationsActive: $("badge-tab-notifications-active"),
  badgeSubmissionsNew: $("badge-submissions-new"), badgeSubmissionsReviewed: $("badge-submissions-reviewed"), badgeCareersActive: $("badge-careers-active"), badgeNotificationsActive: $("badge-notifications-active"),
  exportComplianceCsv: $("export-compliance-csv"), exportCareersCsv: $("export-careers-csv"), exportContactCsv: $("export-contact-csv"), exportCareerSubmissionsCsv: $("export-career-submissions-csv"),
  backupExportJsonBtn: $("backup-export-json"), backupExportStatus: $("backup-export-status"),
  backupRestoreFile: $("backup-restore-file"), backupRestoreSummary: $("backup-restore-summary"), backupRestoreConfirm: $("backup-restore-confirm"), backupRestoreRun: $("backup-restore-run"), backupRestoreStatus: $("backup-restore-status"),
  toast: $("admin-toast"),
};

let teamImageObjectUrl = "";
let teamCropSourceFile = null;
let teamCropSourceUrl = "";
let previousTeamImageUrl = "";
let complianceData = [], teamData = [], careersData = [], notificationsData = [], contactSubmissionsData = [], careerSubmissionsData = [];
let parsedRestoreBackup = null;
const ADMIN_THEME_KEY = "admin_console_theme";
const DEFAULT_HOMEPAGE_STATS = [
  { value: "5+", label: "years of Excellence" },
  { value: "200+", label: "Happy Clients" },
  { value: "1000+", label: "Compliance Filings" },
  { value: "100%", label: "Client Satisfaction" },
];
const BACKUP_TABLES = ["site_settings", "compliance_calendar", "team_members", "career_openings", "notifications", "contact_submissions", "career_applications"];
const BACKUP_PROJECT = "k-srinu-and-associates";
const stateLabels = {"all-india":"All India","andhra-pradesh":"Andhra Pradesh",telangana:"Telangana","tamil-nadu":"Tamil Nadu",karnataka:"Karnataka",maharashtra:"Maharashtra",delhi:"Delhi",kerala:"Kerala","other-states":"Other States"};
const BASELINE_COMPLIANCE_ITEMS = [
  { title:"GST Return Filing", category:"GST", state:"all-india", due_date:"10th / 11th of Every Month", frequency:"Monthly", applicable_to:"Registered taxpayers (as applicable)", description:"Monthly GST return filing and reconciliation.", status:"Upcoming", source_url:"GST portal / notification reference placeholder.", is_national:true, is_active:true, display_order:1, unique_key:"gst-return-filing" },
  { title:"GST Annual Return", category:"GST", state:"all-india", due_date:"31 Dec (typically)", frequency:"Annual", applicable_to:"Eligible GST entities", description:"Annual GST return and turnover-based applicability checks.", status:"Important", source_url:"GST annual return circular placeholder.", is_national:true, is_active:true, display_order:2, unique_key:"gst-annual-return" },
  { title:"TDS Payment", category:"TDS", state:"all-india", due_date:"7th of Every Month", frequency:"Monthly", applicable_to:"TDS deductors", description:"Timely deposit of TDS deductions.", status:"Important", source_url:"Income Tax portal due date placeholder.", is_national:true, is_active:true, display_order:3, unique_key:"tds-payment" },
  { title:"TDS Return Filing", category:"TDS", state:"all-india", due_date:"Quarterly", frequency:"Quarterly", applicable_to:"Employers / deductors", description:"Quarterly filing of TDS statements and validation.", status:"Upcoming", source_url:"Form-wise return schedule placeholder.", is_national:true, is_active:true, display_order:4, unique_key:"tds-return-filing" },
  { title:"Income Tax Return Filing", category:"Income Tax", state:"all-india", due_date:"31 Jul / 31 Oct", frequency:"Annual", applicable_to:"Individuals, firms, companies", description:"Return filing by taxpayer class and audit applicability.", status:"Important", source_url:"CBDT due date extension placeholder.", is_national:true, is_active:true, display_order:5, unique_key:"income-tax-return-filing" },
  { title:"Advance Tax", category:"Income Tax", state:"all-india", due_date:"15 Jun / 15 Sep / 15 Dec / 15 Mar", frequency:"Quarterly", applicable_to:"Eligible advance-tax assessees", description:"Quarterly installments as per mandated percentages.", status:"Upcoming", source_url:"Advance tax compliance reference placeholder.", is_national:true, is_active:true, display_order:6, unique_key:"advance-tax" },
  { title:"Tax Audit Report", category:"Income Tax", state:"all-india", due_date:"30 Sep / 31 Oct (as notified)", frequency:"Annual", applicable_to:"Audit-eligible businesses/professionals", description:"Report upload before applicable return deadlines.", status:"Important", source_url:"Section 44AB / utility release placeholder.", is_national:true, is_active:true, display_order:7, unique_key:"tax-audit-report" },
  { title:"ROC Annual Filing", category:"ROC", state:"all-india", due_date:"As per MCA Schedule", frequency:"Annual", applicable_to:"Companies and LLPs", description:"Annual forms, statements and statutory records filing.", status:"Indicative", source_url:"MCA filing calendar placeholder.", is_national:true, is_active:true, display_order:8, unique_key:"roc-annual-filing" },
  { title:"Director KYC", category:"ROC", state:"all-india", due_date:"30 Sep (typical)", frequency:"Annual", applicable_to:"Directors with DIN", description:"Annual DIR-3 KYC filing and status validation.", status:"Important", source_url:"MCA KYC update placeholder.", is_national:true, is_active:true, display_order:9, unique_key:"director-kyc" },
  { title:"MSME Compliance Reminders", category:"Business Compliance", state:"all-india", due_date:"Monthly / Quarterly / Annual", frequency:"Mixed", applicable_to:"MSMEs, startups, growing entities", description:"Monitor key registrations, returns and declaration timelines.", status:"Indicative", source_url:"Industry checklist placeholder.", is_national:true, is_active:true, display_order:10, unique_key:"msme-compliance-reminders" },
  { title:"ESI Return", category:"Business Compliance", state:"all-india", due_date:"Half-yearly (commonly)", frequency:"Half-yearly", applicable_to:"ESI-registered employers", description:"Return filing and contribution reconciliation.", status:"Important", source_url:"ESIC compliance note placeholder.", is_national:true, is_active:true, display_order:11, unique_key:"esi-return" },
  { title:"PF Payment", category:"Business Compliance", state:"all-india", due_date:"15th of Every Month", frequency:"Monthly", applicable_to:"EPF-covered establishments", description:"Monthly PF contribution payment and challan compliance.", status:"Upcoming", source_url:"EPFO due date placeholder.", is_national:true, is_active:true, display_order:12, unique_key:"pf-payment" },
  { title:"Professional Tax Filing", category:"Professional Tax", state:"andhra-pradesh,telangana,tamil-nadu,karnataka,maharashtra,kerala,other-states", due_date:"State-wise Monthly/Periodical", frequency:"State-wise", applicable_to:"Employers / professionals under PT law", description:"State-wise PT payment and return compliance.", status:"Indicative", source_url:"State PT portal reference placeholder.", is_national:false, is_active:true, display_order:13, unique_key:"professional-tax-filing" },
  { title:"Shops & Establishments Renewal", category:"Business Compliance", state:"andhra-pradesh,telangana,tamil-nadu,karnataka,maharashtra,delhi,kerala,other-states", due_date:"Annual / As per license", frequency:"Annual", applicable_to:"Commercial establishments", description:"Renewal/registration obligations under local shops act.", status:"Upcoming", source_url:"Labour department notice placeholder.", is_national:false, is_active:true, display_order:14, unique_key:"shops-establishments-renewal" },
  { title:"Labour Welfare Fund", category:"Business Compliance", state:"karnataka,maharashtra,telangana,tamil-nadu,kerala,other-states", due_date:"Half-yearly / Annual (state specific)", frequency:"State specific", applicable_to:"Eligible employers and employees", description:"Welfare fund remittance and statutory deduction checks.", status:"Indicative", source_url:"State LWF circular placeholder.", is_national:false, is_active:true, display_order:15, unique_key:"labour-welfare-fund" },
];

const esc = (v) => String(v ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
const badge = (ok) => `<span class="trust-chip" style="background:${ok?"#ecfdf5":"#fee2e2"};color:${ok?"#166534":"#991b1b"}">${ok?"Active":"Inactive"}</span>`;
const rel = (iso) => {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (!isFinite(s) || s < 0) return "";
  if (s < 60) return `Updated ${s}s ago`;
  if (s < 3600) return `Updated ${Math.floor(s/60)}m ago`;
  if (s < 86400) return `Updated ${Math.floor(s/3600)}h ago`;
  return `Updated ${Math.floor(s/86400)}d ago`;
};

function toast(msg, ok = true) {
  if (!refs.toast) return;
  refs.toast.textContent = msg;
  refs.toast.className = `fixed bottom-4 right-4 z-[9999] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`;
  refs.toast.classList.remove("hidden");
  setTimeout(() => refs.toast.classList.add("hidden"), 3000);
}
const setMsg = (el, m, err=false)=>{ if(!el) return; el.textContent=m; el.style.color=err?"#b91c1c":"#334155"; toast(m, !err); };

function toggleOtherInput(selectId, otherInputId){
  const select = $(selectId);
  const other = $(otherInputId);
  if(!select || !other) return;
  const show = String(select.value || "") === "Other";
  other.classList.toggle("hidden", !show);
  if(!show) other.value = "";
}

function getDropdownValue(selectId, otherInputId){
  const select = $(selectId);
  const other = $(otherInputId);
  if(!select) return "";
  const value = String(select.value || "").trim();
  if(value === "Other") return String(other?.value || "").trim();
  return value;
}

function setDropdownOrOther(selectId, otherInputId, value){
  const select = $(selectId);
  const other = $(otherInputId);
  if(!select) return;
  const normalized = String(value || "").trim();
  if(!normalized){
    select.value = "";
    if(other){ other.value = ""; other.classList.add("hidden"); }
    return;
  }
  const options = Array.from(select.options).map((o)=>String(o.value || o.textContent || "").trim());
  if(options.includes(normalized)){
    select.value = normalized;
    if(other){ other.value = ""; other.classList.add("hidden"); }
  } else {
    const hasOther = options.includes("Other");
    if(hasOther) select.value = "Other";
    if(other){ other.value = normalized; other.classList.toggle("hidden", !hasOther); }
  }
}

function extractIframeSrc(input = ""){
  const text = String(input || "").trim();
  if(!text) return "";
  const iframeMatch = text.match(/<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  return iframeMatch?.[1] ? iframeMatch[1].trim() : text;
}

function isEmbeddableGoogleMapUrl(url = ""){
  const raw = String(url || "").trim();
  if(!raw) return false;
  try {
    const parsed = new URL(raw, window.location.origin);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const isGoogleHost = host.includes("google.com") || host.includes("maps.google.com");
    const hasEmbedPath = path.includes("/maps/embed");
    const hasEmbedOutput = parsed.searchParams.get("output") === "embed";
    return isGoogleHost && (hasEmbedPath || hasEmbedOutput);
  } catch {
    return false;
  }
}

function deriveIsInternshipFromType(typeValue){
  const t = String(typeValue || "").trim().toLowerCase();
  return ["internship", "articleship", "internship / articleship"].includes(t);
}

function busy(btn, on, text) { if (!btn) return; if (on) { btn.dataset.prev = btn.textContent; btn.textContent = text; btn.disabled = true; btn.style.opacity = ".7"; } else { btn.textContent = btn.dataset.prev || btn.textContent; btn.disabled = false; btn.style.opacity = ""; } }
const isValidDate = (v) => !!v && !isNaN(new Date(v).getTime());
const toDateStart = (v) => { const d = new Date(v); d.setHours(0,0,0,0); return d; };

function complianceDueBadgeText(dueDate){
  if (!isValidDate(dueDate)) return "No fixed date";
  const today = toDateStart(new Date());
  const due = toDateStart(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "Overdue";
  if (diffDays <= 7) return "Due Soon";
  return "Upcoming";
}

function statusBadge(status){
  const s = String(status || "").toLowerCase();
  if (s === "overdue") return `<span class="admin-badge danger">Overdue</span>`;
  if (s === "due soon") return `<span class="admin-badge warn">Due Soon</span>`;
  if (s === "upcoming") return `<span class="admin-badge">Upcoming</span>`;
  return `<span class="admin-badge secondary">No fixed date</span>`;
}

function setBadge(el, value, suffix = ""){
  if(!el) return;
  const n = Number(value || 0);
  if(n > 0){
    el.textContent = `${n}${suffix}`;
    el.classList.remove("hidden");
  } else {
    el.textContent = `0${suffix}`;
    el.classList.add("hidden");
  }
}

function setTheme(mode){
  const dark = mode === "dark";
  document.body.classList.toggle("admin-dark", dark);
  if (refs.themeToggle) refs.themeToggle.textContent = dark ? "Light" : "Dark";
  localStorage.setItem(ADMIN_THEME_KEY, dark ? "dark" : "light");
}

function initTheme(){
  const stored = localStorage.getItem(ADMIN_THEME_KEY);
  setTheme(stored === "dark" ? "dark" : "light");
}

function toCsvValue(v){
  const s = String(v ?? "");
  if(/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename, rows){
  if(!rows?.length){ setMsg(refs.adminMsg, "No data available to export.", true); return; }
  const csv = rows.map((r)=>r.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadJson(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isValidBackupPayload(payload){
  if(!payload || typeof payload !== "object") return false;
  if(!payload.tables || typeof payload.tables !== "object") return false;
  return BACKUP_TABLES.every((name)=>Array.isArray(payload.tables[name]));
}

function renderBackupSummary(payload){
  if(!refs.backupRestoreSummary) return;
  if(!isValidBackupPayload(payload)){
    refs.backupRestoreSummary.textContent = "Invalid backup format. Expected keys: version, project, exported_at, tables.";
    return;
  }
  const lines = BACKUP_TABLES.map((name)=>`${name}: ${payload.tables[name].length} rows`);
  refs.backupRestoreSummary.textContent = lines.join(" | ");
}

async function exportBackendBackup(){
  if(!refs.backupExportJsonBtn) return;
  busy(refs.backupExportJsonBtn, true, "Exporting...");
  if(refs.backupExportStatus) refs.backupExportStatus.textContent = "Collecting table data...";
  try {
    const tables = {};
    for(const table of BACKUP_TABLES){
      const { data, error } = await supabaseClient.from(table).select("*");
      if(error) throw new Error(`${table}: ${error.message}`);
      tables[table] = data || [];
    }
    const backup = {
      version: "1.0",
      project: BACKUP_PROJECT,
      exported_at: new Date().toISOString(),
      tables,
    };
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadJson(`backend-backup-${stamp}.json`, backup);
    if(refs.backupExportStatus) refs.backupExportStatus.textContent = "Backend backup exported successfully.";
    setMsg(refs.adminMsg, "Changes published successfully");
  } catch (err) {
    if(refs.backupExportStatus) refs.backupExportStatus.textContent = `Export failed: ${err.message || err}`;
    setMsg(refs.adminMsg, err.message || "Export failed", true);
  } finally {
    busy(refs.backupExportJsonBtn, false);
  }
}

async function onBackupRestoreFileSelected(){
  const file = refs.backupRestoreFile?.files?.[0];
  parsedRestoreBackup = null;
  if(refs.backupRestoreStatus) refs.backupRestoreStatus.textContent = "";
  if(!file){
    if(refs.backupRestoreSummary) refs.backupRestoreSummary.textContent = "No backup file selected.";
    return;
  }
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    if(!isValidBackupPayload(payload)) throw new Error("Invalid backup JSON structure");
    parsedRestoreBackup = payload;
    renderBackupSummary(payload);
  } catch (err) {
    if(refs.backupRestoreSummary) refs.backupRestoreSummary.textContent = `Invalid file: ${err.message || err}`;
  }
}

async function runBackendRestore(){
  const confirmText = String(refs.backupRestoreConfirm?.value || "").trim();
  if(confirmText !== "RESTORE"){
    if(refs.backupRestoreStatus) refs.backupRestoreStatus.textContent = "Type RESTORE exactly to continue.";
    return;
  }
  if(!parsedRestoreBackup || !isValidBackupPayload(parsedRestoreBackup)){
    if(refs.backupRestoreStatus) refs.backupRestoreStatus.textContent = "Please upload a valid backup JSON first.";
    return;
  }
  busy(refs.backupRestoreRun, true, "Restoring...");
  if(refs.backupRestoreStatus) refs.backupRestoreStatus.textContent = "Running safe upsert restore...";
  try {
    for(const table of BACKUP_TABLES){
      const rows = parsedRestoreBackup.tables?.[table] || [];
      if(!rows.length) continue;
      const rowsWithId = rows.filter((r)=>r && typeof r === "object" && r.id !== undefined && r.id !== null);
      if(!rowsWithId.length) continue;
      const { error } = await supabaseClient.from(table).upsert(rowsWithId, { onConflict: "id" });
      if(error) throw new Error(`${table}: ${error.message}`);
    }
    if(refs.backupRestoreStatus) refs.backupRestoreStatus.textContent = "Restore completed. Existing rows were preserved; matching IDs were upserted.";
    setMsg(refs.adminMsg, "Changes published successfully");
    await loadAll();
  } catch (err) {
    if(refs.backupRestoreStatus) refs.backupRestoreStatus.textContent = `Restore failed: ${err.message || err}`;
    setMsg(refs.adminMsg, err.message || "Restore failed", true);
  } finally {
    busy(refs.backupRestoreRun, false);
  }
}

function getTeamStoragePath(url){
  if(!url) return null;
  try {
    const u = new URL(url);
    const marker = "/storage/v1/object/public/team-images/";
    const idx = u.pathname.indexOf(marker);
    if(idx === -1) return null;
    const raw = u.pathname.slice(idx + marker.length);
    if(!raw) return null;
    return decodeURIComponent(raw);
  } catch { return null; }
}

function setAuth(on){ refs.loginPanel?.classList.toggle("hidden", on); refs.dashboard?.classList.toggle("hidden", !on); }

function switchTab(tab){ document.querySelectorAll(".tab-panel").forEach(p=>p.classList.add("hidden")); document.querySelectorAll(".tab-btn").forEach(b=>{b.classList.remove("btn-primary");b.classList.add("btn-secondary");}); $(`tab-${tab}`)?.classList.remove("hidden"); const b=document.querySelector(`.tab-btn[data-tab='${tab}']`); if(b){b.classList.add("btn-primary");b.classList.remove("btn-secondary");}}

function reorder(list, id, dir){ const idx=list.findIndex(x=>x.id===id); if(idx<0) return null; const swap=idx+dir; if(swap<0||swap>=list.length) return null; return [list[idx], list[swap]]; }
async function applyReorder(table, list, id, dir){ const pair=reorder(list,id,dir); if(!pair) return; const [a,b]=pair; const ao=a.display_order??0, bo=b.display_order??0; const {error:e1}=await supabaseClient.from(table).update({display_order:bo}).eq("id",a.id); if(e1) throw e1; const {error:e2}=await supabaseClient.from(table).update({display_order:ao}).eq("id",b.id); if(e2) throw e2; }

function updateCropPreview(){
  if (!refs.tCropPreview) return;
  refs.tCropPreview.src = teamCropSourceUrl || teamImageObjectUrl || refs.tImage?.value || "";
  const x = Number(refs.tCropX?.value ?? 50);
  const y = Number(refs.tCropY?.value ?? 50);
  const z = Number(refs.tCropZoom?.value ?? 1);
  refs.tCropPreview.style.objectPosition = `${x}% ${y}%`;
  refs.tCropPreview.style.transform = `scale(${z})`;
}

async function buildCroppedTeamImage(file){
  if (!file) throw new Error("Please select an image before cropping.");
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image optimization failed.");

  const srcW = imageBitmap.width;
  const srcH = imageBitmap.height;
  const base = Math.min(srcW, srcH);
  const zoom = Math.max(1, Number(refs.tCropZoom?.value || 1));
  const cropSize = Math.max(1, base / zoom);
  const xPct = Math.min(100, Math.max(0, Number(refs.tCropX?.value || 50))) / 100;
  const yPct = Math.min(100, Math.max(0, Number(refs.tCropY?.value || 50))) / 100;
  const sx = Math.max(0, Math.min(srcW - cropSize, (srcW - cropSize) * xPct));
  const sy = Math.max(0, Math.min(srcH - cropSize, (srcH - cropSize) * yPct));
  ctx.drawImage(imageBitmap, sx, sy, cropSize, cropSize, 0, 0, 600, 600);

  let q = 0.82;
  let blob = await new Promise((res) => canvas.toBlob(res, "image/webp", q));
  while (blob && blob.size > 250 * 1024 && q > 0.70) {
    q = Math.max(0.70, q - 0.04);
    blob = await new Promise((res) => canvas.toBlob(res, "image/webp", q));
  }
  if (!blob) throw new Error("Image optimization failed.");
  const name = `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  return new File([blob], name, { type: "image/webp" });
}

async function uploadTeamImageIfSelected(){
  const file = teamCropSourceFile || refs.tImageFile?.files?.[0];
  if(!file) return refs.tImage?.value?.trim() || "";
  let f;
  try {
    f = await buildCroppedTeamImage(file);
  } catch(e){
    const msg = e?.message || "Image optimization failed.";
    setMsg(refs.adminMsg, msg, true);
    throw e;
  }
  busy(refs.teamSubmit,true,"Uploading...");
  try {
    const path = f.name;
    const {error}=await supabaseClient.storage.from("team-images").upload(path,f,{upsert:true});
    if(error) throw new Error("Image upload failed. Check Supabase Storage bucket and policies.");
    const {data}=supabaseClient.storage.from("team-images").getPublicUrl(path);
    return data?.publicUrl || "";
  } finally { busy(refs.teamSubmit,false); }
}

function previewCompliance(){ if(!refs.compliancePreview) return; refs.compliancePreview.innerHTML = `<article class='calendar-card'><span class='calendar-date'>${esc($("c-due-date")?.value||"As notified")}</span><span class='trust-chip ml-2'>${esc(getDropdownValue("c-status","c-status-other")||"Indicative")}</span><h3 class='mt-3 font-bold text-navy'>${esc($("c-title")?.value||"Untitled")}</h3><p class='subtitle text-sm mt-2'><strong>Category:</strong> ${esc(getDropdownValue("c-category","c-category-other")||"-")}</p><p class='subtitle text-sm'><strong>State:</strong> ${esc(getDropdownValue("c-state","c-state-other")||"-")}</p><p class='subtitle text-sm'><strong>Frequency:</strong> ${esc(getDropdownValue("c-frequency","c-frequency-other")||"-")}</p><p class='subtitle text-sm'><strong>Applicable to:</strong> ${esc(getDropdownValue("c-applicable","c-applicable-other")||"-")}</p><p class='subtitle text-sm'><strong>Description:</strong> ${esc($("c-description")?.value||"-")}</p><div class='mt-2'>${badge($("c-active")?.checked ?? true)}</div></article>`; }
function previewTeam(){ if(!refs.teamPreview) return; const n=$("t-name")?.value||"Team Member"; const initials=esc(n.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()||"TM"); const src = teamImageObjectUrl || teamCropSourceUrl || refs.tImage?.value || ""; const tags=(($("t-tags")?.value)||"").split(",").map(t=>t.trim()).filter(Boolean).map(t=>`<span class='trust-chip'>${esc(t)}</span>`).join(" "); refs.teamPreview.innerHTML=`<article class='team-card'>${src?`<img src='${esc(src)}' class='h-14 w-14 rounded-full border border-slate-200 object-cover'/>`:`<div class='profile-initial'>${initials}</div>`}<h3 class='mt-4 font-bold text-navy text-xl'>${esc(n)}</h3><p class='text-sm font-semibold text-gold mt-1'>${esc($("t-designation")?.value||"Designation")}</p><p class='subtitle text-sm mt-2'>${esc($("t-bio")?.value||"-")}</p><p class='subtitle text-sm mt-2'><strong>Profile:</strong> ${esc($("t-profile-description")?.value||"-")}</p><div class='mt-3 flex flex-wrap gap-2'>${tags || "<span class='trust-chip'>Tag</span>"}</div><div class='mt-2'>${badge($("t-active")?.checked ?? true)}</div></article>`; }
function previewCareer(){ if(!refs.careerPreview) return; const intern=$("j-intern")?.checked; refs.careerPreview.innerHTML=`<article class='service-card'><h3 class='font-bold text-navy'>${esc($("j-title")?.value||"Career opening")}</h3><p class='subtitle text-sm mt-2'>${esc($("j-description")?.value||"-")}</p><p class='subtitle text-sm mt-2'><strong>Requirements:</strong> ${esc($("j-requirements")?.value||"-")}</p><p class='text-xs mt-3 text-navy font-semibold'>Experience: ${esc($("j-exp")?.value||"-")}</p><p class='text-xs text-gold font-semibold'>Type: ${esc(getDropdownValue("j-type","j-type-other")||"-")}</p><p class='text-xs text-navy font-semibold'>Location: ${esc(getDropdownValue("j-location","j-location-other")||"-")}</p><div class='mt-2 flex gap-2'><span class='trust-chip'>${intern?"Internship":"Job"}</span>${badge($("j-active")?.checked ?? true)}</div></article>`; }
function previewNotification(){ if(!refs.notificationPreview) return; const summary=$("n-summary")?.value||"Short ticker summary"; const content=esc($("n-content")?.value||"Full notification content will appear here.").replace(/\n/g,"<br/>"); const link=$("n-link-url")?.value||""; const pdf=$("n-pdf-url")?.value||$("n-pdf-file")?.files?.[0]?.name||""; refs.notificationPreview.innerHTML=`<article class='service-card'><div class='flex flex-wrap items-center gap-2'><span class='trust-chip'>${esc($("n-category")?.value||"General")}</span>${badge($("n-active")?.checked ?? true)}</div><h3 class='font-bold text-navy text-lg mt-3'>${esc($("n-title")?.value||"Notification title")}</h3><p class='subtitle text-sm mt-2 font-semibold'>${esc(summary)}</p><p class='subtitle text-sm mt-3'>${content}</p><div class='mt-3 flex flex-wrap gap-2'>${pdf?"<span class='trust-chip'>PDF attached</span>":""}${link?"<span class='trust-chip'>Related link</span>":""}</div></article>`; }
function normalizeContactValues(values,fallback=""){ const source=Array.isArray(values)?values:[]; const cleaned=source.map(value=>String(value||"").trim()).filter(Boolean); if(!cleaned.length&&String(fallback||"").trim()) cleaned.push(String(fallback).trim()); return [...new Set(cleaned)]; }
function contactEditorConfig(type){ return type==="phone"?{containerId:"s-phones-list",inputType:"tel",placeholder:"+91 8897667910",label:"Phone number"}:{containerId:"s-emails-list",inputType:"email",placeholder:"name@example.com",label:"Email address"}; }
function addContactEditorRow(type,value=""){ const config=contactEditorConfig(type); const container=$(config.containerId); if(!container||container.children.length>=10) return; const row=document.createElement("div"); row.className="flex items-center gap-2"; const input=document.createElement("input"); input.className="contact-input min-w-0 flex-1"; input.type=config.inputType; input.placeholder=config.placeholder; input.value=value; input.dataset.contactValue=type; input.setAttribute("aria-label",config.label); const remove=document.createElement("button"); remove.type="button"; remove.className="btn-secondary !px-3 !py-2"; remove.textContent="Remove"; remove.setAttribute("aria-label",`Remove ${config.label.toLowerCase()}`); remove.addEventListener("click",()=>{ row.remove(); if(!container.children.length) addContactEditorRow(type); previewSettings(); }); input.addEventListener("input",previewSettings); row.append(input,remove); container.appendChild(row); }
function renderContactEditor(type,values=[]){ const container=$(contactEditorConfig(type).containerId); if(!container) return; container.replaceChildren(); const source=normalizeContactValues(values); (source.length?source:[""]).forEach(value=>addContactEditorRow(type,value)); }
function getContactEditorValues(type){ const container=$(contactEditorConfig(type).containerId); return [...(container?.querySelectorAll(`[data-contact-value="${type}"]`)||[])].map(input=>input.value.trim()).filter(Boolean).filter((value,index,all)=>all.indexOf(value)===index); }
function previewSettings(){ if(!refs.settingsPreview) return; const embedRaw = $("s-map-embed")?.value || ""; const embedSrc = extractIframeSrc(embedRaw); const embedOk = isEmbeddableGoogleMapUrl(embedSrc); const phones=getContactEditorValues("phone"); const emails=getContactEditorValues("email"); const phonePreview=phones.length?phones.map(value=>`<li>${esc(value)}</li>`).join(""):"<li>-</li>"; const emailPreview=emails.length?emails.map(value=>`<li>${esc(value)}</li>`).join(""):"<li>-</li>"; refs.settingsPreview.innerHTML=`<div class='subtitle text-sm'><p><strong>Phone numbers:</strong></p><ul class='list-disc pl-5'>${phonePreview}</ul><p class='mt-2'><strong>Email addresses:</strong></p><ul class='list-disc pl-5'>${emailPreview}</ul><p class='mt-2'><strong>WhatsApp:</strong> ${esc($("s-whatsapp")?.value||"-")}</p><p><strong>Address:</strong> ${esc($("s-address")?.value||"-")}</p><p><strong>Map Link:</strong> ${esc($("s-map")?.value||"-")}</p><p><strong>Map Embed URL:</strong> ${esc(embedSrc||"-")}</p><p><strong>Embed Status:</strong> ${embedOk?"Valid embed URL":"Invalid embed URL (iframe unchanged on public page)"}</p><p><strong>Footer Text:</strong> ${esc($("s-footer")?.value||"-")}</p></div>`; }

function getHomepageStatsFormValues(){
  return [1, 2, 3, 4].map((position)=>({
    value: $(`hs-${position}-value`)?.value.trim() || "",
    label: $(`hs-${position}-label`)?.value.trim() || "",
  }));
}

function setHomepageStatsForm(stats){
  const source = Array.isArray(stats) && stats.length === 4 ? stats : DEFAULT_HOMEPAGE_STATS;
  source.forEach((stat, index)=>{
    const position = index + 1;
    if ($(`hs-${position}-value`)) $(`hs-${position}-value`).value = stat?.value || DEFAULT_HOMEPAGE_STATS[index].value;
    if ($(`hs-${position}-label`)) $(`hs-${position}-label`).value = stat?.label || DEFAULT_HOMEPAGE_STATS[index].label;
  });
  previewHomepageStats();
}

function previewHomepageStats(){
  if (!refs.homepageStatsPreview) return;
  refs.homepageStatsPreview.innerHTML = getHomepageStatsFormValues().map((stat)=>`<article class='stat-card'><p class='stat-value text-gold'>${esc(stat.value || "-")}</p><p class='subtitle text-xs mt-1'>${esc(stat.label || "-")}</p></article>`).join("");
}

function resetCompliance(){ refs.complianceForm?.reset(); $("compliance-id").value=""; refs.complianceSubmit.textContent="Save Compliance Item"; [ ["c-category","c-category-other"], ["c-state","c-state-other"], ["c-frequency","c-frequency-other"], ["c-applicable","c-applicable-other"], ["c-status","c-status-other"] ].forEach(([s,o])=>toggleOtherInput(s,o)); previewCompliance(); }
function resetTeam(){ refs.teamForm?.reset(); $("team-id").value=""; refs.teamSubmit.textContent="Save Team Member"; teamImageObjectUrl=""; teamCropSourceFile = null; teamCropSourceUrl = ""; if(refs.tImagePreview) refs.tImagePreview.style.display="none"; if(refs.tCropPreview) refs.tCropPreview.src=""; if(refs.tCropX) refs.tCropX.value=50; if(refs.tCropY) refs.tCropY.value=50; if(refs.tCropZoom) refs.tCropZoom.value=1; previewTeam(); }
function resetCareer(){ refs.careerForm?.reset(); $("career-id").value=""; refs.careerSubmit.textContent="Save Career Opening"; toggleOtherInput("j-type","j-type-other"); toggleOtherInput("j-location","j-location-other"); $("j-status").value = "active"; $("j-active").checked = true; previewCareer(); }
function resetNotification(){ refs.notificationForm?.reset(); $("notification-id").value=""; if(refs.notificationSubmit) refs.notificationSubmit.textContent="Publish Notification"; if($("n-category")) $("n-category").value="General"; if($("n-order")) $("n-order").value="0"; if($("n-active")) $("n-active").checked=true; if($("n-starts-at")) $("n-starts-at").value=toDatetimeLocal(new Date().toISOString()); if($("n-pdf-url")) $("n-pdf-url").value=""; const currentPdf=$("n-current-pdf"); if(currentPdf){currentPdf.href="#";currentPdf.classList.add("hidden");} previewNotification(); }

function toDatetimeLocal(value){ if(!value) return ""; const date=new Date(value); if(Number.isNaN(date.getTime())) return ""; const offset=date.getTimezoneOffset(); return new Date(date.getTime()-offset*60000).toISOString().slice(0,16); }

function rowMeta(r){ return `<div class='text-xs mt-2'>${r.created_at?`Created: ${new Date(r.created_at).toLocaleString()}`:""}${r.updated_at?`<br/>Updated: ${new Date(r.updated_at).toLocaleString()} (${rel(r.updated_at)})`:""}</div>`; }

function renderRows(type, rows){
  const cfg = {
    compliance: {container: refs.complianceList, search: refs.complianceSearch?.value?.toLowerCase()||"", matches:(r)=>`${r.title} ${r.category} ${r.description} ${r.state}`.toLowerCase(), sort:(a,b)=>(a.display_order??0)-(b.display_order??0)},
    team: {container: refs.teamList, search: refs.teamSearch?.value?.toLowerCase()||"", matches:(r)=>`${r.name} ${r.designation} ${Array.isArray(r.tags)?r.tags.join(" "):r.tags||""} ${r.bio}`.toLowerCase(), sort:(a,b)=>(a.display_order??0)-(b.display_order??0)},
    careers: {container: refs.careersList, search: refs.careersSearch?.value?.toLowerCase()||"", matches:(r)=>`${r.title} ${r.employment_type} ${r.description} ${r.requirements}`.toLowerCase(), sort:(a,b)=>(a.display_order??0)-(b.display_order??0)},
    notifications: {container: refs.notificationsList, search: refs.notificationsSearch?.value?.toLowerCase()||"", matches:(r)=>`${r.title} ${r.category} ${r.summary} ${r.content}`.toLowerCase(), sort:(a,b)=>(a.display_order??0)-(b.display_order??0) || new Date(b.starts_at||0)-new Date(a.starts_at||0)},
  }[type];
  if(!cfg?.container) return;
  cfg.container.innerHTML="";
  if (type === "compliance" && (!rows || rows.length === 0)) {
    cfg.container.innerHTML = `<p class="subtitle text-sm">No compliance records found.</p>`;
    return;
  }
  if (type === "notifications" && (!rows || rows.length === 0)) {
    cfg.container.innerHTML = `<p class="subtitle text-sm">No notifications have been created yet.</p>`;
    return;
  }
  rows.filter(r=>cfg.matches(r).includes(cfg.search)).sort(cfg.sort).forEach((r)=>{
    const el=document.createElement("div"); el.className=`card p-3 flex items-start justify-between gap-2 ${type==="compliance"?"cursor-pointer transition hover:bg-slate-50 hover:border-slate-300":""}`;
    const main = type==="team"
      ? `${r.image_url?`<img src='${esc(r.image_url)}' class='h-10 w-10 rounded-full object-cover inline-block mr-2'/>`:""}<strong>${esc(r.name||"-")}</strong><br/>${esc(r.designation||"-")}<br/>${esc(Array.isArray(r.tags)?r.tags.join(", "):(r.tags||""))}<br/>${esc(r.profile_description||"")}<br/>${badge(r.is_active!==false)}`
      : type==="compliance"
      ? `<strong>${esc(r.title||"-")}</strong><br/>Category: ${esc(r.category||"-")} • State: ${esc(stateLabels[r.state]||r.state||"-")}<br/>Due: ${esc(r.due_date||"-")} • Frequency: ${esc(r.frequency||"-")}<br/>Status: ${esc(r.status||"-")} • ${statusBadge(complianceDueBadgeText(r.due_date))} • ${badge(r.is_active!==false)}`
      : type==="notifications"
      ? `<strong>${esc(r.title||"-")}</strong><br/>${esc(r.category||"General")} • Starts: ${esc(r.starts_at?new Date(r.starts_at).toLocaleString():"Immediately")}<br/>Expires: ${esc(r.expires_at?new Date(r.expires_at).toLocaleString():"No expiry")} • ${badge(r.is_active!==false)}<br/><span class='text-xs'>${esc(r.summary||"")}</span>`
      : `<strong>${esc(r.title||"-")}</strong><br/>${esc(r.employment_type||"-")} • ${esc(r.experience_level||"-")} • ${r.is_internship?"Internship":"Job"}<br/>${badge(r.is_active!==false)}`;
    const toggleBtn = type === "compliance"
      ? `<button class='${r.is_active!==false ? "admin-badge" : "admin-badge danger"}' data-a='toggle'>${r.is_active!==false ? "Set Inactive" : "Set Active"}</button>`
      : "";
    el.innerHTML=`<div class='text-sm subtitle'>${main}${rowMeta(r)}</div><div class='flex flex-col gap-2'><button class='btn-secondary' data-a='up'>↑</button><button class='btn-secondary' data-a='down'>↓</button>${toggleBtn}<button class='btn-secondary' data-a='edit'>Edit</button><button class='btn-secondary' data-a='del'>Delete</button></div>`;
    const btn=(a)=>el.querySelector(`[data-a='${a}']`);
    btn("edit").onclick=(e)=>{ e.stopPropagation(); editRow(type,r); };
    btn("del").onclick=(e)=>{ e.stopPropagation(); deleteRow(type,r.id,btn("del")); };
    btn("up").onclick=(e)=>{ e.stopPropagation(); moveRow(type,r.id,-1,btn("up")); };
    btn("down").onclick=(e)=>{ e.stopPropagation(); moveRow(type,r.id,1,btn("down")); };
    if (type === "compliance") {
      btn("toggle")?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleComplianceActive(r.id, r.is_active === false, btn("toggle"));
      });
    }
    if (type === "compliance") {
      el.onclick = () => editRow("compliance", r, true);
    }
    cfg.container.appendChild(el);
  });
}

function editRow(type,r,scrollToForm=false){
  if(type==="compliance"){ $("compliance-id").value=r.id||""; $("c-title").value=r.title||""; setDropdownOrOther("c-category","c-category-other", r.category||""); setDropdownOrOther("c-state","c-state-other", r.state||""); $("c-due-date").value=(r.due_date && /^\d{4}-\d{2}-\d{2}$/.test(r.due_date)) ? r.due_date : ""; setDropdownOrOther("c-frequency","c-frequency-other", r.frequency||""); setDropdownOrOther("c-applicable","c-applicable-other", r.applicable_to||""); $("c-description").value=r.description||""; setDropdownOrOther("c-status","c-status-other", r.status||"Indicative"); $("c-source").value=r.source_url||""; $("c-national").checked=!!r.is_national; $("c-active").checked=r.is_active!==false; refs.complianceSubmit.textContent="Update Compliance Item"; previewCompliance(); if (scrollToForm) refs.complianceForm?.scrollIntoView({behavior:"smooth", block:"start"}); }
  if(type==="team"){ $("team-id").value=r.id||""; $("t-name").value=r.name||""; $("t-designation").value=r.designation||""; $("t-bio").value=r.bio||""; $("t-profile-description").value=r.profile_description||""; $("t-image").value=r.image_url||""; $("t-tags").value=Array.isArray(r.tags)?r.tags.join(", "):(r.tags||""); $("t-order").value=r.display_order||""; $("t-active").checked=r.is_active!==false; teamImageObjectUrl=r.image_url||""; previousTeamImageUrl=r.image_url||""; teamCropSourceUrl=r.image_url||""; updateCropPreview(); refs.teamSubmit.textContent="Update Team Member"; previewTeam(); }
  if(type==="careers"){ $("career-id").value=r.id||""; $("j-title").value=r.title||""; setDropdownOrOther("j-type","j-type-other", r.employment_type||"Full-time"); $("j-exp").value=r.experience_level||"Fresher"; setDropdownOrOther("j-location","j-location-other", r.location||""); $("j-description").value=r.description||""; $("j-requirements").value=r.requirements||""; const derivedIntern = deriveIsInternshipFromType(getDropdownValue("j-type","j-type-other")); $("j-intern").checked=derivedIntern; $("j-active").checked=r.is_active!==false; $("j-status").value = r.is_active===false ? "inactive" : "active"; refs.careerSubmit.textContent="Update Career Opening"; previewCareer(); }
  if(type==="notifications"){ $("notification-id").value=r.id||""; $("n-title").value=r.title||""; $("n-category").value=r.category||"General"; $("n-summary").value=r.summary||""; $("n-content").value=r.content||""; $("n-link-url").value=r.link_url||""; $("n-pdf-url").value=r.pdf_url||""; if($("n-pdf-file")) $("n-pdf-file").value=""; const currentPdf=$("n-current-pdf"); if(currentPdf){currentPdf.href=r.pdf_url||"#";currentPdf.classList.toggle("hidden",!r.pdf_url);} $("n-starts-at").value=toDatetimeLocal(r.starts_at); $("n-expires-at").value=toDatetimeLocal(r.expires_at); $("n-order").value=r.display_order??0; $("n-active").checked=r.is_active!==false; refs.notificationSubmit.textContent="Update Notification"; previewNotification(); if(scrollToForm) refs.notificationForm?.scrollIntoView({behavior:"smooth",block:"start"}); }
}

async function deleteRow(type,id,btn){
  const table = type==="team"?"team_members":type==="careers"?"career_openings":type==="notifications"?"notifications":"compliance_calendar";
  busy(btn,true,"Deleting...");
  try{ const pdfUrl=type==="notifications"?notificationsData.find((r)=>r.id===id)?.pdf_url:""; const {error}=await supabaseClient.from(table).delete().eq("id",id); if(error) throw error; if(pdfUrl) await removeNotificationPdf(pdfUrl); const moduleName = type==="team"?"team":type==="careers"?"careers":type==="notifications"?"notifications":"compliance"; await refreshModule(moduleName); setMsg(refs.adminMsg,"Changes published successfully"); }
  catch(e){ setMsg(refs.adminMsg,e.message,true); }
  finally{ busy(btn,false); }
}

async function moveRow(type,id,dir,btn){
  const table = type==="team"?"team_members":type==="careers"?"career_openings":type==="notifications"?"notifications":"compliance_calendar";
  const data = type==="team"?teamData:type==="careers"?careersData:type==="notifications"?notificationsData:complianceData;
  busy(btn,true,dir<0?"Moving Up...":"Moving Down...");
  try{ await applyReorder(table,[...data].sort((a,b)=>(a.display_order??0)-(b.display_order??0)),id,dir); const moduleName = type==="team"?"team":type==="careers"?"careers":type==="notifications"?"notifications":"compliance"; await refreshModule(moduleName); setMsg(refs.adminMsg,"Changes published successfully"); }
  catch(e){ setMsg(refs.adminMsg,e.message,true); }
  finally{ busy(btn,false); }
}

async function toggleComplianceActive(id, makeActive, btn){
  busy(btn, true, makeActive ? "Activating..." : "Deactivating...");
  try {
    const { error } = await supabaseClient
      .from("compliance_calendar")
      .update({ is_active: !!makeActive })
      .eq("id", id);
    if (error) throw error;

    await refreshModule("compliance");
    setMsg(refs.adminMsg, "Changes published successfully");
  } catch (err) {
    setMsg(refs.adminMsg, err.message || "Failed to update compliance status", true);
  } finally {
    busy(btn, false);
  }
}

async function loadCompliance(){
  if (refs.complianceList) refs.complianceList.innerHTML = `<p class="subtitle text-sm">Loading compliance records...</p>`;
  const {data,error}=await supabaseClient.from("compliance_calendar").select("*");
  if(error){
    if (refs.complianceList) refs.complianceList.innerHTML = `<p class="subtitle text-sm">Unable to load compliance records.</p>`;
    setMsg(refs.adminMsg, `Compliance load failed: ${error.message}`, true);
    throw error;
  }
  complianceData=data||[];
  renderRows("compliance",complianceData);
}
async function loadTeam(){ const {data,error}=await supabaseClient.from("team_members").select("id,name,designation,bio,profile_description,image_url,tags,display_order,is_active,created_at,updated_at"); if(error) throw error; teamData=data||[]; renderRows("team",teamData); }
async function loadCareers(){ const {data,error}=await supabaseClient.from("career_openings").select("*"); if(error) throw error; careersData=data||[]; renderRows("careers",careersData); }
async function loadNotifications(){ if(refs.notificationsList) refs.notificationsList.innerHTML=`<p class="subtitle text-sm">Loading notifications...</p>`; const {data,error}=await supabaseClient.from("notifications").select("*").order("display_order",{ascending:true}).order("starts_at",{ascending:false}); if(error) throw error; notificationsData=data||[]; renderRows("notifications",notificationsData); }
async function loadSettings(){
  const {data,error}=await supabaseClient.from("site_settings").select("*").order("updated_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
  if(error) throw error;
  if(data){
    $("s-id").value=data.id||"";
    renderContactEditor("phone",normalizeContactValues(data.contact_phones,data.phone));
    renderContactEditor("email",normalizeContactValues(data.contact_emails,data.email));
    $("s-whatsapp").value=data.whatsapp||"";
    $("s-address").value=data.address||"";
    $("s-map").value=data.map_link||"";
    $("s-map-embed").value=data.map_embed_link||"";
    $("s-footer").value=data.footer_text||"";
    setHomepageStatsForm(data.homepage_stats);
  } else {
    $("s-id").value="";
    renderContactEditor("phone",[]);
    renderContactEditor("email",[]);
    $("s-map-embed").value="";
    setHomepageStatsForm(DEFAULT_HOMEPAGE_STATS);
  }
  previewSettings();
}
async function loadSubmissions(){
  if (refs.contactSubmissionsLoading) refs.contactSubmissionsLoading.classList.remove("hidden");
  if (refs.careerSubmissionsLoading) refs.careerSubmissionsLoading.classList.remove("hidden");
  const [contactRes, careerRes] = await Promise.all([
    supabaseClient.from("contact_submissions").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("career_submissions").select("*").order("created_at", { ascending: false }),
  ]);
  if (contactRes.error) throw contactRes.error;
  if (careerRes.error) throw careerRes.error;
  contactSubmissionsData = contactRes.data || [];
  careerSubmissionsData = careerRes.data || [];
  renderSubmissions();
}
async function refreshModule(moduleName){
  if(moduleName === "compliance"){
    await loadCompliance();
    renderRows("compliance", complianceData);
    renderOverviewMetrics();
    return;
  }
  if(moduleName === "team"){
    await loadTeam();
    renderRows("team", teamData);
    renderOverviewMetrics();
    return;
  }
  if(moduleName === "careers"){
    await loadCareers();
    renderRows("careers", careersData);
    renderOverviewMetrics();
    return;
  }
  if(moduleName === "notifications"){
    await loadNotifications();
    renderRows("notifications", notificationsData);
    renderOverviewMetrics();
    return;
  }
  if(moduleName === "settings"){
    await loadSettings();
    return;
  }
}
async function loadAll(){ await Promise.all([loadCompliance(),loadTeam(),loadCareers(),loadNotifications(),loadSettings(),loadSubmissions()]); }

function renderOverviewMetrics(){
  const complianceTotal = complianceData.length || 0;
  const teamActive = (teamData || []).filter((r)=>r.is_active !== false).length;
  const careersActive = (careersData || []).filter((r)=>r.is_active !== false).length;
  const now = Date.now();
  const notificationsActive = (notificationsData || []).filter((r)=>r.is_active !== false && (!r.starts_at || new Date(r.starts_at).getTime() <= now) && (!r.expires_at || new Date(r.expires_at).getTime() > now)).length;
  const contactNew = (contactSubmissionsData || []).filter((r)=>String(r.status || "new").toLowerCase() === "new").length;
  const careerNew = (careerSubmissionsData || []).filter((r)=>String(r.status || "new").toLowerCase() === "new").length;
  const reviewedTotal = [...contactSubmissionsData, ...careerSubmissionsData].filter((r)=>String(r.status || "").toLowerCase() === "reviewed").length;
  const submissionsNew = contactNew + careerNew;

  if (refs.metricComplianceTotal) refs.metricComplianceTotal.textContent = String(complianceTotal);
  if (refs.metricTeamActive) refs.metricTeamActive.textContent = String(teamActive);
  if (refs.metricCareersActive) refs.metricCareersActive.textContent = String(careersActive);
  if (refs.metricNotificationsActive) refs.metricNotificationsActive.textContent = String(notificationsActive);
  if (refs.metricContactNew) refs.metricContactNew.textContent = String(contactNew);
  if (refs.metricCareerNew) refs.metricCareerNew.textContent = String(careerNew);

  setBadge(refs.badgeOverviewCareersActive, careersActive);
  setBadge(refs.badgeOverviewContactNew, contactNew);
  setBadge(refs.badgeOverviewCareerNew, careerNew);
  setBadge(refs.badgeTabCareersActive, careersActive);
  setBadge(refs.badgeCareersActive, careersActive);
  setBadge(refs.badgeTabNotificationsActive, notificationsActive);
  setBadge(refs.badgeNotificationsActive, notificationsActive);
  setBadge(refs.badgeTabSubmissionsNew, submissionsNew);
  setBadge(refs.badgeSubmissionsNew, submissionsNew);
  setBadge(refs.badgeSubmissionsReviewed, reviewedTotal, " reviewed");
}

function renderSubmissions(){
  const q = (refs.submissionSearch?.value || "").toLowerCase();
  const status = refs.submissionStatusFilter?.value || "all";

  const filterCommon = (r, messageField = "message") => {
    const msg = String(r?.[messageField] || "");
    const text = `${r?.name || ""} ${r?.email || ""} ${r?.phone || ""} ${msg}`.toLowerCase();
    const sOk = status === "all" || String(r?.status || "new").toLowerCase() === status;
    return text.includes(q) && sOk;
  };

  const card = (type, row) => {
    const when = row.created_at ? new Date(row.created_at).toLocaleString() : "-";
    const msg = type === "contact" ? (row.message || "") : (row.message || "");
    const preview = msg.length > 120 ? `${msg.slice(0, 120)}...` : msg;
    return `<details class='card p-3'><summary class='cursor-pointer list-none'><div class='flex items-start justify-between gap-3'><div class='subtitle text-sm'><strong>${esc(row.name||"-")}</strong><br/>${esc(row.email||"-")} • ${esc(row.phone||"-")}<br/><span class='text-xs'>${esc(when)} • Status: ${esc(row.status||"new")}</span><p class='mt-1 text-xs'>${esc(preview)}</p></div><div class='flex flex-wrap gap-2'><button class='btn-secondary' data-sub-act='new' data-sub-type='${type}' data-sub-id='${row.id}'>Mark New</button><button class='btn-secondary' data-sub-act='reviewed' data-sub-type='${type}' data-sub-id='${row.id}'>Reviewed</button><button class='btn-secondary' data-sub-act='contacted' data-sub-type='${type}' data-sub-id='${row.id}'>Contacted</button><button class='btn-secondary' data-sub-act='delete' data-sub-type='${type}' data-sub-id='${row.id}'>Delete</button></div></div></summary><div class='mt-3 subtitle text-sm'>${type === "career" ? `<p><strong>Position:</strong> ${esc(row.position||"-")}</p><p><strong>Experience:</strong> ${esc(row.experience||"-")}</p><p><strong>Resume Link:</strong> ${esc(row.resume_link||"-")}</p>` : `<p><strong>Service:</strong> ${esc(row.service||"-")}</p>`}<p class='mt-2'><strong>Message:</strong><br/>${esc(msg || "-")}</p></div></details>`;
  };

  const cRows = contactSubmissionsData.filter((r)=>filterCommon(r, "message"));
  const jRows = careerSubmissionsData.filter((r)=>filterCommon(r, "message"));

  if (refs.contactSubmissionsLoading) refs.contactSubmissionsLoading.classList.add("hidden");
  if (refs.careerSubmissionsLoading) refs.careerSubmissionsLoading.classList.add("hidden");
  if (refs.contactSubmissionsList) refs.contactSubmissionsList.innerHTML = cRows.length ? cRows.map((r)=>card("contact", r)).join("") : `<p class='subtitle text-sm'>No contact submissions found.</p>`;
  if (refs.careerSubmissionsList) refs.careerSubmissionsList.innerHTML = jRows.length ? jRows.map((r)=>card("career", r)).join("") : `<p class='subtitle text-sm'>No career submissions found.</p>`;

  [refs.contactSubmissionsList, refs.careerSubmissionsList].forEach((container)=>{
    container?.querySelectorAll("[data-sub-act]").forEach((btn)=>{
      btn.addEventListener("click", async (e)=>{
        e.preventDefault();
        const act = btn.getAttribute("data-sub-act");
        const type = btn.getAttribute("data-sub-type");
        const id = btn.getAttribute("data-sub-id");
        const table = type === "contact" ? "contact_submissions" : "career_submissions";
        busy(btn, true, act === "delete" ? "Deleting..." : "Updating...");
        try {
          if (act === "delete") {
            const { error } = await supabaseClient.from(table).delete().eq("id", id);
            if (error) throw error;
          } else {
            const { error } = await supabaseClient.from(table).update({ status: act }).eq("id", id);
            if (error) throw error;
          }
          await loadSubmissions();
          setMsg(refs.adminMsg, "Submission updated successfully");
        } catch (err) {
          setMsg(refs.adminMsg, err.message || "Failed to update submission", true);
        } finally {
          busy(btn, false);
        }
      });
    });
  });
  renderOverviewMetrics();
}

const normTitle = (v="") => String(v).trim().toLowerCase().replace(/\s+/g," ");
async function importBaselineComplianceItems(){
  const btn = refs.complianceImportBaseline;
  busy(btn, true, "Importing...");
  try {
    const { data: existing, error: exErr } = await supabaseClient.from("compliance_calendar").select("id,title,unique_key");
    if (exErr) throw exErr;

    const titleSet = new Set((existing||[]).map((r)=>normTitle(r.title)));
    const keySet = new Set((existing||[]).map((r)=>String(r.unique_key||"").trim().toLowerCase()).filter(Boolean));

    const toInsert = [];
    BASELINE_COMPLIANCE_ITEMS.forEach((item)=>{
      const nTitle = normTitle(item.title);
      const nKey = String(item.unique_key||"").trim().toLowerCase();
      if (titleSet.has(nTitle) || (nKey && keySet.has(nKey))) return;
      titleSet.add(nTitle);
      if (nKey) keySet.add(nKey);
      toInsert.push(item);
    });

    if (!toInsert.length) {
      setMsg(refs.adminMsg, "No new baseline items to import");
      await loadCompliance();
      return;
    }

    let insertErr = null;
    let insertedWithUniqueKey = true;
    const { error: firstInsertErr } = await supabaseClient.from("compliance_calendar").insert(toInsert);
    insertErr = firstInsertErr;

    if (insertErr && /unique_key/i.test(insertErr.message || "")) {
      insertedWithUniqueKey = false;
      const withoutUnique = toInsert.map(({ unique_key, ...rest }) => rest);
      const { error: retryErr } = await supabaseClient.from("compliance_calendar").insert(withoutUnique);
      insertErr = retryErr;
    }

    if (insertErr) throw insertErr;
    setMsg(refs.adminMsg, "Baseline items imported successfully");
    await loadCompliance();
  } catch (err) {
    setMsg(refs.adminMsg, err.message || "Failed to import baseline items", true);
  } finally {
    busy(btn, false);
  }
}

async function saveCompliance(e){ e.preventDefault(); if(refs.complianceSubmit.disabled) return; const id=$("compliance-id").value; busy(refs.complianceSubmit,true,id?"Updating...":"Saving..."); try{ const payload={title:$("c-title").value,category:getDropdownValue("c-category","c-category-other"),state:getDropdownValue("c-state","c-state-other"),due_date:$("c-due-date").value,frequency:getDropdownValue("c-frequency","c-frequency-other"),applicable_to:getDropdownValue("c-applicable","c-applicable-other"),description:$("c-description").value,status:getDropdownValue("c-status","c-status-other"),source_url:$("c-source").value,is_national:$("c-national").checked,is_active:$("c-active").checked}; const {error}=id?await supabaseClient.from("compliance_calendar").update(payload).eq("id",id):await supabaseClient.from("compliance_calendar").insert([payload]); if(error) throw error; setMsg(refs.adminMsg,"Changes published successfully"); resetCompliance(); await refreshModule("compliance"); }catch(err){ setMsg(refs.adminMsg,err.message,true);} finally{ busy(refs.complianceSubmit,false);} }

async function saveTeam(e){ e.preventDefault(); if(refs.teamSubmit.disabled) return; const id=$("team-id").value; busy(refs.teamSubmit,true,id?"Updating...":"Saving..."); try{ const tagsArray=(($("t-tags").value)||"").split(",").map(t=>t.trim()).filter(Boolean); const uploaded=await uploadTeamImageIfSelected(); const newImageUrl = uploaded || $("t-image").value; const payload={name:$("t-name").value,designation:$("t-designation").value,bio:$("t-bio").value,profile_description:$("t-profile-description").value,image_url:newImageUrl,tags:tagsArray,display_order:Number($("t-order").value||0),is_active:$("t-active").checked}; const {error}=id?await supabaseClient.from("team_members").update(payload).eq("id",id):await supabaseClient.from("team_members").insert([payload]); if(error) throw error; if(id){ const oldPath = getTeamStoragePath(previousTeamImageUrl); const newPath = getTeamStoragePath(newImageUrl); if(oldPath && newPath && oldPath !== newPath){ const { error: removeErr } = await supabaseClient.storage.from("team-images").remove([oldPath]); if(removeErr) setMsg(refs.adminMsg, "Team updated. Old image cleanup warning: " + removeErr.message, true); } } setMsg(refs.adminMsg,"Changes published successfully"); previousTeamImageUrl = ""; resetTeam(); await refreshModule("team"); }catch(err){ setMsg(refs.adminMsg,err.message,true);} finally{ busy(refs.teamSubmit,false);} }

async function saveCareer(e){ e.preventDefault(); if(refs.careerSubmit.disabled) return; const id=$("career-id").value; busy(refs.careerSubmit,true,id?"Updating...":"Saving..."); try{ const activeByStatus = $("j-status")?.value === "inactive" ? false : true; const jobType = getDropdownValue("j-type","j-type-other"); const derivedIsInternship = deriveIsInternshipFromType(jobType); $("j-intern").checked = derivedIsInternship; const payload={title:$("j-title").value,employment_type:jobType,experience_level:$("j-exp").value,location:getDropdownValue("j-location","j-location-other"),description:$("j-description").value,requirements:$("j-requirements").value,is_internship:derivedIsInternship,is_active:activeByStatus && $("j-active").checked}; const {error}=id?await supabaseClient.from("career_openings").update(payload).eq("id",id):await supabaseClient.from("career_openings").insert([payload]); if(error) throw error; setMsg(refs.adminMsg,"Changes published successfully"); resetCareer(); await refreshModule("careers"); }catch(err){ setMsg(refs.adminMsg,err.message,true);} finally{ busy(refs.careerSubmit,false);} }

function getNotificationStoragePath(url=""){
  const marker="/storage/v1/object/public/notification-files/";
  const index=String(url).indexOf(marker);
  return index>=0?decodeURIComponent(String(url).slice(index+marker.length)):"";
}

async function removeNotificationPdf(url=""){
  const path=getNotificationStoragePath(url);
  if(!path) return;
  const {error}=await supabaseClient.storage.from("notification-files").remove([path]);
  if(error) console.warn("Notification PDF cleanup failed:",error.message);
}

async function uploadNotificationPdfIfSelected(){
  const file=$("n-pdf-file")?.files?.[0];
  if(!file) return "";
  if(file.type!=="application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Only PDF files can be attached.");
  if(file.size>10*1024*1024) throw new Error("The PDF must be 10 MB or smaller.");
  const folder=$("notification-id")?.value||crypto.randomUUID();
  const safeName=file.name.replace(/[^a-z0-9._-]+/gi,"-").replace(/^-+|-+$/g,"")||"notification.pdf";
  const path=`${folder}/${Date.now()}-${safeName}`;
  const {error}=await supabaseClient.storage.from("notification-files").upload(path,file,{cacheControl:"3600",upsert:false,contentType:"application/pdf"});
  if(error) throw error;
  const {data}=supabaseClient.storage.from("notification-files").getPublicUrl(path);
  return data?.publicUrl||"";
}

async function saveNotification(e){
  e.preventDefault();
  if(refs.notificationSubmit?.disabled) return;
  const id=$("notification-id").value;
  const previousPdf=$("n-pdf-url")?.value||"";
  let uploadedPdf="";
  busy(refs.notificationSubmit,true,id?"Updating...":"Publishing...");
  try{
    const startsAt=$("n-starts-at").value ? new Date($("n-starts-at").value).toISOString() : new Date().toISOString();
    const expiresAt=$("n-expires-at").value ? new Date($("n-expires-at").value).toISOString() : null;
    if(expiresAt && new Date(expiresAt) <= new Date(startsAt)) throw new Error("Expiry must be later than the display start time.");
    uploadedPdf=await uploadNotificationPdfIfSelected();
    const payload={title:$("n-title").value.trim(),category:$("n-category").value.trim()||"General",summary:$("n-summary").value.trim(),content:$("n-content").value.trim(),link_url:$("n-link-url").value.trim()||null,pdf_url:uploadedPdf||previousPdf||null,starts_at:startsAt,expires_at:expiresAt,display_order:Number($("n-order").value||0),is_active:$("n-active").checked,updated_at:new Date().toISOString()};
    const {error}=id?await supabaseClient.from("notifications").update(payload).eq("id",id):await supabaseClient.from("notifications").insert([payload]);
    if(error) throw error;
    if(uploadedPdf && previousPdf && uploadedPdf!==previousPdf) await removeNotificationPdf(previousPdf);
    setMsg(refs.adminMsg,id?"Notification updated successfully":"Notification published successfully");
    resetNotification();
    await refreshModule("notifications");
  }catch(err){ if(uploadedPdf) await removeNotificationPdf(uploadedPdf); setMsg(refs.adminMsg,err.message||"Failed to save notification",true); }
  finally{ busy(refs.notificationSubmit,false); }
}

async function saveSettings(e){
  e.preventDefault();
  const btn=refs.settingsForm?.querySelector("button[type='submit']");
  busy(btn,true,"Saving...");
  try{
    const id=$("s-id").value;
    const phones=getContactEditorValues("phone");
    const emails=getContactEditorValues("email");
    if(!phones.length) throw new Error("Add at least one phone number.");
    if(!emails.length) throw new Error("Add at least one email address.");
    if(phones.length>10||emails.length>10) throw new Error("A maximum of 10 phone numbers and 10 email addresses is allowed.");
    const mapEmbedInput=$("s-map-embed")?.value||"";
    const mapEmbedSrc=extractIframeSrc(mapEmbedInput);
    const mapEmbedIsValid=isEmbeddableGoogleMapUrl(mapEmbedSrc);
    const payload={phone:phones[0],email:emails[0],contact_phones:phones,contact_emails:emails,whatsapp:$("s-whatsapp").value,address:$("s-address").value,map_link:$("s-map").value,footer_text:$("s-footer").value};
    if(mapEmbedSrc&&mapEmbedIsValid) payload.map_embed_link=mapEmbedSrc;
    let savedRow=null;
    if(id){
      const {data,error}=await supabaseClient.from("site_settings").update(payload).eq("id",id).select().single();
      if(error&&error.code!=="PGRST116") throw error;
      savedRow=data||null;
    }
    if(!savedRow){
      const {data,error}=await supabaseClient.from("site_settings").insert([payload]).select().single();
      if(error) throw error;
      savedRow=data||null;
    }
    if(!savedRow) throw new Error("Site settings save failed: no row returned.");
    setMsg(refs.adminMsg,"Contact details and site settings published successfully");
    await refreshModule("settings");
  }catch(err){ setMsg(refs.adminMsg,err.message,true); }
  finally{ busy(btn,false); }
}

async function saveHomepageStats(e){
  e.preventDefault();
  const btn=refs.homepageStatsForm?.querySelector("button[type='submit']");
  busy(btn,true,"Saving...");
  try{
    const id=$("s-id")?.value;
    if(!id) throw new Error("Save the Site Settings record before editing homepage stats.");
    const homepageStats=getHomepageStatsFormValues();
    if(homepageStats.some((stat)=>!stat.value || !stat.label)) throw new Error("All four stat values and labels are required.");
    const {data,error}=await supabaseClient.from("site_settings").update({homepage_stats:homepageStats}).eq("id",id).select("id,homepage_stats").single();
    if(error) throw error;
    setHomepageStatsForm(data?.homepage_stats || homepageStats);
    setMsg(refs.adminMsg,"Homepage stats published successfully");
  }catch(err){
    setMsg(refs.adminMsg,err.message||"Failed to save homepage stats",true);
  }finally{
    busy(btn,false);
  }
}

async function ensureSession(){ const {data,error}=await supabaseClient.auth.getSession(); if(error) return setMsg(refs.authMsg,error.message,true); const s=data?.session; if(!s) return setAuth(false); const userEmail=(s.user?.email||"").toLowerCase(); const allowed=ALLOWED_ADMIN_EMAILS.map((e)=>String(e).toLowerCase()); if(!allowed.includes(userEmail)){ console.warn("Unauthorized admin attempt:", userEmail || "unknown"); await supabaseClient.auth.signOut(); setMsg(refs.authMsg,"Access denied. Unauthorized admin email.",true); return setAuth(false);} console.log("Admin login successful:", userEmail); setAuth(true); switchTab("overview"); await loadAll(); renderOverviewMetrics(); }
async function login(e){ e.preventDefault(); const email=$("admin-email").value.trim().toLowerCase(); const allowed=ALLOWED_ADMIN_EMAILS.map((e)=>String(e).toLowerCase()); if(!allowed.includes(email)){ console.warn("Unauthorized admin attempt:", email || "unknown"); return setMsg(refs.authMsg,"Access denied. Unauthorized admin email.",true);} const {error}=await supabaseClient.auth.signInWithPassword({email,password:$("admin-password").value}); if(error) return setMsg(refs.authMsg,error.message,true); setMsg(refs.authMsg,"Login successful."); await ensureSession(); }
async function logout(){ await supabaseClient.auth.signOut(); setAuth(false); setMsg(refs.authMsg,"Logged out."); }

refs.loginForm?.addEventListener("submit",login);
refs.logoutBtn?.addEventListener("click",logout);
refs.complianceForm?.addEventListener("submit",saveCompliance);
refs.teamForm?.addEventListener("submit",saveTeam);
refs.careerForm?.addEventListener("submit",saveCareer);
refs.notificationForm?.addEventListener("submit",saveNotification);
refs.settingsForm?.addEventListener("submit",saveSettings);
refs.homepageStatsForm?.addEventListener("submit",saveHomepageStats);
refs.complianceClear?.addEventListener("click",resetCompliance);
refs.complianceImportBaseline?.addEventListener("click",importBaselineComplianceItems);
refs.teamClear?.addEventListener("click",resetTeam);
refs.careerClear?.addEventListener("click",resetCareer);
refs.notificationClear?.addEventListener("click",resetNotification);

refs.complianceSearch?.addEventListener("input",()=>renderRows("compliance",complianceData));
refs.teamSearch?.addEventListener("input",()=>renderRows("team",teamData));
refs.careersSearch?.addEventListener("input",()=>renderRows("careers",careersData));
refs.notificationsSearch?.addEventListener("input",()=>renderRows("notifications",notificationsData));
refs.submissionSearch?.addEventListener("input",renderSubmissions);
refs.submissionStatusFilter?.addEventListener("change",renderSubmissions);
refs.qaAddCompliance?.addEventListener("click", ()=>{ switchTab("compliance"); refs.complianceForm?.scrollIntoView({behavior:"smooth", block:"start"}); $("c-title")?.focus(); });
refs.qaAddTeam?.addEventListener("click", ()=>{ switchTab("team"); refs.teamForm?.scrollIntoView({behavior:"smooth", block:"start"}); $("t-name")?.focus(); });
refs.qaAddNotification?.addEventListener("click", ()=>{ switchTab("notifications"); refs.notificationForm?.scrollIntoView({behavior:"smooth", block:"start"}); $("n-title")?.focus(); });
refs.qaViewSubmissions?.addEventListener("click", ()=>{ switchTab("submissions"); refs.submissionSearch?.focus(); });
refs.qaUpdateSettings?.addEventListener("click", ()=>{ switchTab("settings"); refs.settingsForm?.scrollIntoView({behavior:"smooth", block:"start"}); $("s-phones-list")?.querySelector("input")?.focus(); });
refs.themeToggle?.addEventListener("click", ()=>{ const dark = document.body.classList.contains("admin-dark"); setTheme(dark ? "light" : "dark"); });
refs.exportComplianceCsv?.addEventListener("click", ()=>{
  const rows = [["Title","Category","State","Due Date","Frequency","Applicable To","Status","Is Active","Created At"]];
  complianceData.forEach((r)=>rows.push([r.title,r.category,stateLabels[r.state]||r.state,r.due_date,r.frequency,r.applicable_to,r.status,r.is_active!==false?"Yes":"No",r.created_at]));
  downloadCsv("compliance-calendar.csv", rows);
});
refs.exportCareersCsv?.addEventListener("click", ()=>{
  const rows = [["Title","Type","Experience","Location","Internship","Active","Created At"]];
  careersData.forEach((r)=>rows.push([r.title,r.employment_type,r.experience_level,r.location,r.is_internship?"Yes":"No",r.is_active!==false?"Yes":"No",r.created_at]));
  downloadCsv("career-openings.csv", rows);
});
refs.exportContactCsv?.addEventListener("click", ()=>{
  const rows = [["Name","Email","Phone","Service","Message","Status","Created At"]];
  contactSubmissionsData.forEach((r)=>rows.push([r.name,r.email,r.phone,r.service,r.message,r.status,r.created_at]));
  downloadCsv("contact-submissions.csv", rows);
});
refs.exportCareerSubmissionsCsv?.addEventListener("click", ()=>{
  const rows = [["Name","Email","Phone","Position","Experience","Resume Link","Message","Status","Created At"]];
  careerSubmissionsData.forEach((r)=>rows.push([r.name,r.email,r.phone,r.position,r.experience,r.resume_link,r.message,r.status,r.created_at]));
  downloadCsv("career-applications.csv", rows);
});
refs.backupExportJsonBtn?.addEventListener("click", exportBackendBackup);
refs.backupRestoreFile?.addEventListener("change", onBackupRestoreFileSelected);
refs.backupRestoreRun?.addEventListener("click", runBackendRestore);

$("c-state")?.addEventListener("change",(e)=>{$("c-national").checked=e.target.value==="National"; toggleOtherInput("c-state","c-state-other"); previewCompliance();});
$("c-category")?.addEventListener("change",()=>{ toggleOtherInput("c-category","c-category-other"); previewCompliance(); });
$("c-frequency")?.addEventListener("change",()=>{ toggleOtherInput("c-frequency","c-frequency-other"); previewCompliance(); });
$("c-applicable")?.addEventListener("change",()=>{ toggleOtherInput("c-applicable","c-applicable-other"); previewCompliance(); });
$("c-status")?.addEventListener("change",()=>{ toggleOtherInput("c-status","c-status-other"); previewCompliance(); });
$("j-type")?.addEventListener("change",(e)=>{toggleOtherInput("j-type","j-type-other"); $("j-intern").checked=deriveIsInternshipFromType(getDropdownValue("j-type","j-type-other")); previewCareer();});
$("j-location")?.addEventListener("change",()=>{ toggleOtherInput("j-location","j-location-other"); previewCareer(); });
$("j-status")?.addEventListener("change",(e)=>{ $("j-active").checked = e.target.value !== "inactive"; previewCareer(); });

["c-title","c-category","c-category-other","c-state","c-state-other","c-due-date","c-frequency","c-frequency-other","c-applicable","c-applicable-other","c-description","c-status","c-status-other","c-active","c-source"].forEach(id=>$(id)?.addEventListener("input",previewCompliance));
["t-name","t-designation","t-bio","t-profile-description","t-image","t-tags","t-active"].forEach(id=>$(id)?.addEventListener("input",previewTeam));
["j-title","j-exp","j-location","j-location-other","j-type","j-type-other","j-description","j-requirements","j-intern","j-active","j-status"].forEach(id=>$(id)?.addEventListener("input",previewCareer));
["n-title","n-category","n-summary","n-content","n-link-url","n-starts-at","n-expires-at","n-order","n-active"].forEach(id=>$(id)?.addEventListener("input",previewNotification));
$("n-pdf-file")?.addEventListener("change",previewNotification);
["s-whatsapp","s-address","s-map","s-map-embed","s-footer"].forEach(id=>$(id)?.addEventListener("input",previewSettings));
$("s-add-phone")?.addEventListener("click",()=>{ addContactEditorRow("phone"); $("s-phones-list")?.lastElementChild?.querySelector("input")?.focus(); previewSettings(); });
$("s-add-email")?.addEventListener("click",()=>{ addContactEditorRow("email"); $("s-emails-list")?.lastElementChild?.querySelector("input")?.focus(); previewSettings(); });
["hs-1-value","hs-1-label","hs-2-value","hs-2-label","hs-3-value","hs-3-label","hs-4-value","hs-4-label"].forEach(id=>$(id)?.addEventListener("input",previewHomepageStats));

refs.tImageFile?.addEventListener("change", async ()=>{
  const f=refs.tImageFile.files?.[0]; if(!f) return;
  teamCropSourceFile = f;
  teamCropSourceUrl = URL.createObjectURL(f);
  teamImageObjectUrl = teamCropSourceUrl;
  updateCropPreview();
  if(refs.tImagePreview){ refs.tImagePreview.src=teamImageObjectUrl; refs.tImagePreview.style.display="block"; }
  previewTeam();
});

[refs.tCropX, refs.tCropY, refs.tCropZoom].forEach((el)=>el?.addEventListener("input", ()=>{ updateCropPreview(); previewTeam(); }));

document.querySelectorAll(".tab-btn").forEach((b)=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));

toggleOtherInput("c-category","c-category-other");
toggleOtherInput("c-state","c-state-other");
toggleOtherInput("c-frequency","c-frequency-other");
toggleOtherInput("c-applicable","c-applicable-other");
toggleOtherInput("c-status","c-status-other");
toggleOtherInput("j-type","j-type-other");
toggleOtherInput("j-location","j-location-other");
previewCompliance(); previewTeam(); previewCareer(); resetNotification(); previewSettings(); setHomepageStatsForm(DEFAULT_HOMEPAGE_STATS);
initTheme();
ensureSession();
