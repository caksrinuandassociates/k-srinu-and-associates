const SUPABASE_URL = "https://wenwseckngextivnulqy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbndzZWNrbmdleHRpdm51bHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NDQwODIsImV4cCI6MjA5NTUyMDA4Mn0.vhH_AbPB0Hs9yehPUOWRR7XLn_ei--g4efy8u-X9aok";
const ALLOWED_ADMIN_EMAIL = "prudhvi@varadanexus.com";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);
const refs = {
  loginForm: $("login-form"), logoutBtn: $("logout-btn"), authMsg: $("auth-message"), adminMsg: $("admin-message"),
  loginPanel: $("login-panel"), dashboard: $("dashboard"),
  complianceForm: $("compliance-form"), teamForm: $("team-form"), careerForm: $("career-form"), settingsForm: $("settings-form"),
  complianceList: $("compliance-list"), teamList: $("team-list"), careersList: $("careers-list"),
  complianceSearch: $("compliance-search"), teamSearch: $("team-search"), careersSearch: $("careers-search"),
  complianceSubmit: $("compliance-submit"), teamSubmit: $("team-submit"), careerSubmit: $("career-submit"),
  complianceClear: $("compliance-clear"), teamClear: $("team-clear"), careerClear: $("career-clear"),
  tImageFile: $("t-image-file"), tImage: $("t-image"), tImagePreview: $("t-image-preview"),
  compliancePreview: $("compliance-live-preview"), teamPreview: $("team-live-preview"), careerPreview: $("career-live-preview"), settingsPreview: $("settings-live-preview"),
  toast: $("admin-toast"),
};

let teamImageObjectUrl = "";
let complianceData = [], teamData = [], careersData = [];
const stateLabels = {"all-india":"All India","andhra-pradesh":"Andhra Pradesh",telangana:"Telangana","tamil-nadu":"Tamil Nadu",karnataka:"Karnataka",maharashtra:"Maharashtra",delhi:"Delhi",kerala:"Kerala","other-states":"Other States"};

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

function busy(btn, on, text) { if (!btn) return; if (on) { btn.dataset.prev = btn.textContent; btn.textContent = text; btn.disabled = true; btn.style.opacity = ".7"; } else { btn.textContent = btn.dataset.prev || btn.textContent; btn.disabled = false; btn.style.opacity = ""; } }

function setAuth(on){ refs.loginPanel?.classList.toggle("hidden", on); refs.dashboard?.classList.toggle("hidden", !on); }

function switchTab(tab){ document.querySelectorAll(".tab-panel").forEach(p=>p.classList.add("hidden")); document.querySelectorAll(".tab-btn").forEach(b=>{b.classList.remove("btn-primary");b.classList.add("btn-secondary");}); $(`tab-${tab}`)?.classList.remove("hidden"); const b=document.querySelector(`.tab-btn[data-tab='${tab}']`); if(b){b.classList.add("btn-primary");b.classList.remove("btn-secondary");}}

function reorder(list, id, dir){ const idx=list.findIndex(x=>x.id===id); if(idx<0) return null; const swap=idx+dir; if(swap<0||swap>=list.length) return null; return [list[idx], list[swap]]; }
async function applyReorder(table, list, id, dir){ const pair=reorder(list,id,dir); if(!pair) return; const [a,b]=pair; const ao=a.display_order??0, bo=b.display_order??0; const {error:e1}=await supabaseClient.from(table).update({display_order:bo}).eq("id",a.id); if(e1) throw e1; const {error:e2}=await supabaseClient.from(table).update({display_order:ao}).eq("id",b.id); if(e2) throw e2; }

async function optimizeImage(file){
  const img = await new Promise((res, rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=URL.createObjectURL(file); });
  const maxW=1200,maxH=1200; let {width:w,height:h}=img; const r=Math.min(maxW/w,maxH/h,1); w=Math.round(w*r); h=Math.round(h*r);
  const c=document.createElement("canvas"); c.width=w; c.height=h; const ctx=c.getContext("2d"); ctx.drawImage(img,0,0,w,h);
  const blob = await new Promise((res)=>c.toBlob(res,"image/webp",0.75));
  if(!blob) throw new Error("Optimization failed");
  return new File([blob], `${Date.now()}-optimized.webp`, {type:"image/webp"});
}

async function uploadTeamImageIfSelected(){
  const file = refs.tImageFile?.files?.[0]; if(!file) return refs.tImage?.value?.trim() || "";
  let f=file;
  try { f = await optimizeImage(file); } catch(e){ setMsg(refs.adminMsg, "Image optimization failed. Uploading original file.", true); }
  busy(refs.teamSubmit,true,"Uploading...");
  try {
    const path = `${Date.now()}-${f.name.replace(/\s+/g,"-")}`;
    const {error}=await supabaseClient.storage.from("team-images").upload(path,f,{upsert:true});
    if(error) throw new Error("Image upload failed. Check Supabase Storage bucket and policies.");
    const {data}=supabaseClient.storage.from("team-images").getPublicUrl(path);
    return data?.publicUrl || "";
  } finally { busy(refs.teamSubmit,false); }
}

function previewCompliance(){ if(!refs.compliancePreview) return; refs.compliancePreview.innerHTML = `<article class='calendar-card'><span class='calendar-date'>${esc($("c-due-date")?.value||"As notified")}</span><span class='trust-chip ml-2'>${esc($("c-status")?.value||"Indicative")}</span><h3 class='mt-3 font-bold text-navy'>${esc($("c-title")?.value||"Untitled")}</h3><p class='subtitle text-sm mt-2'><strong>Category:</strong> ${esc($("c-category")?.value||"-")}</p><p class='subtitle text-sm'><strong>State:</strong> ${esc(stateLabels[$("c-state")?.value] || $("c-state")?.value || "-")}</p><p class='subtitle text-sm'><strong>Frequency:</strong> ${esc($("c-frequency")?.value||"-")}</p><p class='subtitle text-sm'><strong>Applicable to:</strong> ${esc($("c-applicable")?.value||"-")}</p><p class='subtitle text-sm'><strong>Description:</strong> ${esc($("c-description")?.value||"-")}</p><div class='mt-2'>${badge($("c-active")?.checked ?? true)}</div></article>`; }
function previewTeam(){ if(!refs.teamPreview) return; const n=$("t-name")?.value||"Team Member"; const initials=esc(n.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()||"TM"); const src = teamImageObjectUrl || refs.tImage?.value || ""; const tags=(($("t-tags")?.value)||"").split(",").map(t=>t.trim()).filter(Boolean).map(t=>`<span class='trust-chip'>${esc(t)}</span>`).join(" "); refs.teamPreview.innerHTML=`<article class='team-card'>${src?`<img src='${esc(src)}' class='h-14 w-14 rounded-full border border-slate-200 object-cover'/>`:`<div class='profile-initial'>${initials}</div>`}<h3 class='mt-4 font-bold text-navy text-xl'>${esc(n)}</h3><p class='text-sm font-semibold text-gold mt-1'>${esc($("t-designation")?.value||"Designation")}</p><p class='subtitle text-sm mt-2'>${esc($("t-bio")?.value||"-")}</p><div class='mt-3 flex flex-wrap gap-2'>${tags || "<span class='trust-chip'>Tag</span>"}</div><div class='mt-2'>${badge($("t-active")?.checked ?? true)}</div></article>`; }
function previewCareer(){ if(!refs.careerPreview) return; const intern=$("j-intern")?.checked; refs.careerPreview.innerHTML=`<article class='service-card'><h3 class='font-bold text-navy'>${esc($("j-title")?.value||"Career opening")}</h3><p class='subtitle text-sm mt-2'>${esc($("j-description")?.value||"-")}</p><p class='subtitle text-sm mt-2'><strong>Requirements:</strong> ${esc($("j-requirements")?.value||"-")}</p><p class='text-xs mt-3 text-navy font-semibold'>Experience: ${esc($("j-exp")?.value||"-")}</p><p class='text-xs text-gold font-semibold'>Type: ${esc($("j-type")?.value||"-")}</p><p class='text-xs text-navy font-semibold'>Location: ${esc($("j-location")?.value||"-")}</p><div class='mt-2 flex gap-2'><span class='trust-chip'>${intern?"Internship":"Job"}</span>${badge($("j-active")?.checked ?? true)}</div></article>`; }
function previewSettings(){ if(!refs.settingsPreview) return; refs.settingsPreview.innerHTML=`<div class='subtitle text-sm'><p><strong>Phone:</strong> ${esc($("s-phone")?.value||"-")}</p><p><strong>Email:</strong> ${esc($("s-email")?.value||"-")}</p><p><strong>WhatsApp:</strong> ${esc($("s-whatsapp")?.value||"-")}</p><p><strong>Address:</strong> ${esc($("s-address")?.value||"-")}</p><p><strong>Map Link:</strong> ${esc($("s-map")?.value||"-")}</p><p><strong>Footer Text:</strong> ${esc($("s-footer")?.value||"-")}</p></div>`; }

function resetCompliance(){ refs.complianceForm?.reset(); $("compliance-id").value=""; refs.complianceSubmit.textContent="Save Compliance Item"; previewCompliance(); }
function resetTeam(){ refs.teamForm?.reset(); $("team-id").value=""; refs.teamSubmit.textContent="Save Team Member"; teamImageObjectUrl=""; if(refs.tImagePreview) refs.tImagePreview.style.display="none"; previewTeam(); }
function resetCareer(){ refs.careerForm?.reset(); $("career-id").value=""; refs.careerSubmit.textContent="Save Career Opening"; previewCareer(); }

function rowMeta(r){ return `<div class='text-xs mt-2'>${r.created_at?`Created: ${new Date(r.created_at).toLocaleString()}`:""}${r.updated_at?`<br/>Updated: ${new Date(r.updated_at).toLocaleString()} (${rel(r.updated_at)})`:""}</div>`; }

function renderRows(type, rows){
  const cfg = {
    compliance: {container: refs.complianceList, search: refs.complianceSearch?.value?.toLowerCase()||"", matches:(r)=>`${r.title} ${r.category} ${r.description} ${r.state}`.toLowerCase(), sort:(a,b)=>(a.display_order??0)-(b.display_order??0)},
    team: {container: refs.teamList, search: refs.teamSearch?.value?.toLowerCase()||"", matches:(r)=>`${r.name} ${r.designation} ${Array.isArray(r.tags)?r.tags.join(" "):r.tags||""} ${r.bio}`.toLowerCase(), sort:(a,b)=>(a.display_order??0)-(b.display_order??0)},
    careers: {container: refs.careersList, search: refs.careersSearch?.value?.toLowerCase()||"", matches:(r)=>`${r.title} ${r.employment_type} ${r.description} ${r.requirements}`.toLowerCase(), sort:(a,b)=>(a.display_order??0)-(b.display_order??0)},
  }[type];
  if(!cfg?.container) return;
  cfg.container.innerHTML="";
  if (type === "compliance" && (!rows || rows.length === 0)) {
    cfg.container.innerHTML = `<p class="subtitle text-sm">No compliance records found.</p>`;
    return;
  }
  rows.filter(r=>cfg.matches(r).includes(cfg.search)).sort(cfg.sort).forEach((r)=>{
    const el=document.createElement("div"); el.className=`card p-3 flex items-start justify-between gap-2 ${type==="compliance"?"cursor-pointer transition hover:bg-slate-50 hover:border-slate-300":""}`;
    const main = type==="team"
      ? `${r.image_url?`<img src='${esc(r.image_url)}' class='h-10 w-10 rounded-full object-cover inline-block mr-2'/>`:""}<strong>${esc(r.name||"-")}</strong><br/>${esc(r.designation||"-")}<br/>${esc(Array.isArray(r.tags)?r.tags.join(", "):(r.tags||""))}<br/>${badge(r.is_active!==false)}`
      : type==="compliance"
      ? `<strong>${esc(r.title||"-")}</strong><br/>Category: ${esc(r.category||"-")} • State: ${esc(stateLabels[r.state]||r.state||"-")}<br/>Due: ${esc(r.due_date||"-")} • Frequency: ${esc(r.frequency||"-")}<br/>Status: ${esc(r.status||"-")} • ${badge(r.is_active!==false)}`
      : `<strong>${esc(r.title||"-")}</strong><br/>${esc(r.employment_type||"-")} • ${esc(r.experience_level||"-")} • ${r.is_internship?"Internship":"Job"}<br/>${badge(r.is_active!==false)}`;
    el.innerHTML=`<div class='text-sm subtitle'>${main}${rowMeta(r)}</div><div class='flex flex-col gap-2'><button class='btn-secondary' data-a='up'>↑</button><button class='btn-secondary' data-a='down'>↓</button><button class='btn-secondary' data-a='edit'>Edit</button><button class='btn-secondary' data-a='del'>Delete</button></div>`;
    const btn=(a)=>el.querySelector(`[data-a='${a}']`);
    btn("edit").onclick=(e)=>{ e.stopPropagation(); editRow(type,r); };
    btn("del").onclick=(e)=>{ e.stopPropagation(); deleteRow(type,r.id,btn("del")); };
    btn("up").onclick=(e)=>{ e.stopPropagation(); moveRow(type,r.id,-1,btn("up")); };
    btn("down").onclick=(e)=>{ e.stopPropagation(); moveRow(type,r.id,1,btn("down")); };
    if (type === "compliance") {
      el.onclick = () => editRow("compliance", r, true);
    }
    cfg.container.appendChild(el);
  });
}

function editRow(type,r,scrollToForm=false){
  if(type==="compliance"){ $("compliance-id").value=r.id||""; $("c-title").value=r.title||""; $("c-category").value=r.category||""; $("c-state").value=r.state||""; $("c-due-date").value=r.due_date||""; $("c-frequency").value=r.frequency||""; $("c-applicable").value=r.applicable_to||""; $("c-description").value=r.description||""; $("c-status").value=r.status||"Indicative"; $("c-source").value=r.source_url||""; $("c-national").checked=!!r.is_national; $("c-active").checked=r.is_active!==false; refs.complianceSubmit.textContent="Update Compliance Item"; previewCompliance(); if (scrollToForm) refs.complianceForm?.scrollIntoView({behavior:"smooth", block:"start"}); }
  if(type==="team"){ $("team-id").value=r.id||""; $("t-name").value=r.name||""; $("t-designation").value=r.designation||""; $("t-bio").value=r.bio||""; $("t-image").value=r.image_url||""; $("t-tags").value=Array.isArray(r.tags)?r.tags.join(", "):(r.tags||""); $("t-order").value=r.display_order||""; $("t-active").checked=r.is_active!==false; teamImageObjectUrl=r.image_url||""; refs.teamSubmit.textContent="Update Team Member"; previewTeam(); }
  if(type==="careers"){ $("career-id").value=r.id||""; $("j-title").value=r.title||""; $("j-type").value=r.employment_type||"Full-time"; $("j-exp").value=r.experience_level||"Fresher"; $("j-location").value=r.location||""; $("j-description").value=r.description||""; $("j-requirements").value=r.requirements||""; $("j-intern").checked=!!r.is_internship; $("j-active").checked=r.is_active!==false; refs.careerSubmit.textContent="Update Career Opening"; previewCareer(); }
}

async function deleteRow(type,id,btn){
  const table = type==="team"?"team_members":type==="careers"?"career_openings":"compliance_calendar";
  busy(btn,true,"Deleting...");
  try{ const {error}=await supabaseClient.from(table).delete().eq("id",id); if(error) throw error; await loadAll(); setMsg(refs.adminMsg,"Deleted successfully."); }
  catch(e){ setMsg(refs.adminMsg,e.message,true); }
  finally{ busy(btn,false); }
}

async function moveRow(type,id,dir,btn){
  const table = type==="team"?"team_members":type==="careers"?"career_openings":"compliance_calendar";
  const data = type==="team"?teamData:type==="careers"?careersData:complianceData;
  busy(btn,true,dir<0?"Moving Up...":"Moving Down...");
  try{ await applyReorder(table,[...data].sort((a,b)=>(a.display_order??0)-(b.display_order??0)),id,dir); await loadAll(); }
  catch(e){ setMsg(refs.adminMsg,e.message,true); }
  finally{ busy(btn,false); }
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
async function loadTeam(){ const {data,error}=await supabaseClient.from("team_members").select("*"); if(error) throw error; teamData=data||[]; renderRows("team",teamData); }
async function loadCareers(){ const {data,error}=await supabaseClient.from("career_openings").select("*"); if(error) throw error; careersData=data||[]; renderRows("careers",careersData); }
async function loadSettings(){ const {data,error}=await supabaseClient.from("site_settings").select("*").limit(1).maybeSingle(); if(error) throw error; if(data){ $("s-id").value=data.id||""; $("s-phone").value=data.phone||""; $("s-email").value=data.email||""; $("s-whatsapp").value=data.whatsapp||""; $("s-address").value=data.address||""; $("s-map").value=data.map_link||""; $("s-footer").value=data.footer_text||""; } previewSettings(); }
async function loadAll(){ await Promise.all([loadCompliance(),loadTeam(),loadCareers(),loadSettings()]); }

async function saveCompliance(e){ e.preventDefault(); if(refs.complianceSubmit.disabled) return; const id=$("compliance-id").value; busy(refs.complianceSubmit,true,id?"Updating...":"Saving..."); try{ const payload={title:$("c-title").value,category:$("c-category").value,state:$("c-state").value,due_date:$("c-due-date").value,frequency:$("c-frequency").value,applicable_to:$("c-applicable").value,description:$("c-description").value,status:$("c-status").value,source_url:$("c-source").value,is_national:$("c-national").checked,is_active:$("c-active").checked}; const {error}=id?await supabaseClient.from("compliance_calendar").update(payload).eq("id",id):await supabaseClient.from("compliance_calendar").insert([payload]); if(error) throw error; setMsg(refs.adminMsg,id?"Compliance updated.":"Compliance added."); resetCompliance(); await loadCompliance(); }catch(err){ setMsg(refs.adminMsg,err.message,true);} finally{ busy(refs.complianceSubmit,false);} }

async function saveTeam(e){ e.preventDefault(); if(refs.teamSubmit.disabled) return; const id=$("team-id").value; busy(refs.teamSubmit,true,id?"Updating...":"Saving..."); try{ const tagsArray=(($("t-tags").value)||"").split(",").map(t=>t.trim()).filter(Boolean); const uploaded=await uploadTeamImageIfSelected(); const payload={name:$("t-name").value,designation:$("t-designation").value,bio:$("t-bio").value,image_url:uploaded || $("t-image").value,tags:tagsArray,display_order:Number($("t-order").value||0),is_active:$("t-active").checked}; const {error}=id?await supabaseClient.from("team_members").update(payload).eq("id",id):await supabaseClient.from("team_members").insert([payload]); if(error) throw error; setMsg(refs.adminMsg,id?"Team member updated.":"Team member added."); resetTeam(); await loadTeam(); }catch(err){ setMsg(refs.adminMsg,err.message,true);} finally{ busy(refs.teamSubmit,false);} }

async function saveCareer(e){ e.preventDefault(); if(refs.careerSubmit.disabled) return; const id=$("career-id").value; busy(refs.careerSubmit,true,id?"Updating...":"Saving..."); try{ const payload={title:$("j-title").value,employment_type:$("j-type").value,experience_level:$("j-exp").value,location:$("j-location").value,description:$("j-description").value,requirements:$("j-requirements").value,is_internship:$("j-intern").checked,is_active:$("j-active").checked}; const {error}=id?await supabaseClient.from("career_openings").update(payload).eq("id",id):await supabaseClient.from("career_openings").insert([payload]); if(error) throw error; setMsg(refs.adminMsg,id?"Career updated.":"Career added."); resetCareer(); await loadCareers(); }catch(err){ setMsg(refs.adminMsg,err.message,true);} finally{ busy(refs.careerSubmit,false);} }

async function saveSettings(e){ e.preventDefault(); const btn=refs.settingsForm?.querySelector("button[type='submit']"); busy(btn,true,"Saving..."); try{ const id=$("s-id").value; const payload={phone:$("s-phone").value,email:$("s-email").value,whatsapp:$("s-whatsapp").value,address:$("s-address").value,map_link:$("s-map").value,footer_text:$("s-footer").value}; const {error}=id?await supabaseClient.from("site_settings").update(payload).eq("id",id):await supabaseClient.from("site_settings").insert([payload]); if(error) throw error; setMsg(refs.adminMsg,"Site settings saved."); await loadSettings(); }catch(err){ setMsg(refs.adminMsg,err.message,true);} finally{ busy(btn,false);} }

async function ensureSession(){ const {data,error}=await supabaseClient.auth.getSession(); if(error) return setMsg(refs.authMsg,error.message,true); const s=data?.session; if(!s) return setAuth(false); if((s.user?.email||"").toLowerCase()!==ALLOWED_ADMIN_EMAIL.toLowerCase()){ await supabaseClient.auth.signOut(); setMsg(refs.authMsg,"Access denied. Unauthorized admin email.",true); return setAuth(false);} setAuth(true); switchTab("compliance"); await loadAll(); }
async function login(e){ e.preventDefault(); const email=$("admin-email").value.trim().toLowerCase(); if(email!==ALLOWED_ADMIN_EMAIL.toLowerCase()) return setMsg(refs.authMsg,"Access denied. Unauthorized admin email.",true); const {error}=await supabaseClient.auth.signInWithPassword({email,password:$("admin-password").value}); if(error) return setMsg(refs.authMsg,error.message,true); setMsg(refs.authMsg,"Login successful."); await ensureSession(); }
async function logout(){ await supabaseClient.auth.signOut(); setAuth(false); setMsg(refs.authMsg,"Logged out."); }

refs.loginForm?.addEventListener("submit",login);
refs.logoutBtn?.addEventListener("click",logout);
refs.complianceForm?.addEventListener("submit",saveCompliance);
refs.teamForm?.addEventListener("submit",saveTeam);
refs.careerForm?.addEventListener("submit",saveCareer);
refs.settingsForm?.addEventListener("submit",saveSettings);
refs.complianceClear?.addEventListener("click",resetCompliance);
refs.teamClear?.addEventListener("click",resetTeam);
refs.careerClear?.addEventListener("click",resetCareer);

refs.complianceSearch?.addEventListener("input",()=>renderRows("compliance",complianceData));
refs.teamSearch?.addEventListener("input",()=>renderRows("team",teamData));
refs.careersSearch?.addEventListener("input",()=>renderRows("careers",careersData));

$("c-state")?.addEventListener("change",(e)=>{$("c-national").checked=e.target.value==="all-india"; previewCompliance();});
$("j-type")?.addEventListener("change",(e)=>{$("j-intern").checked=["Internship","Articleship"].includes(e.target.value); previewCareer();});

["c-title","c-category","c-due-date","c-frequency","c-applicable","c-description","c-status","c-active","c-source"].forEach(id=>$(id)?.addEventListener("input",previewCompliance));
["t-name","t-designation","t-bio","t-image","t-tags","t-active"].forEach(id=>$(id)?.addEventListener("input",previewTeam));
["j-title","j-exp","j-location","j-description","j-requirements","j-intern","j-active"].forEach(id=>$(id)?.addEventListener("input",previewCareer));
["s-phone","s-email","s-whatsapp","s-address","s-map","s-footer"].forEach(id=>$(id)?.addEventListener("input",previewSettings));

refs.tImageFile?.addEventListener("change", async ()=>{
  const f=refs.tImageFile.files?.[0]; if(!f) return;
  try{ const opt=await optimizeImage(f); teamImageObjectUrl = URL.createObjectURL(opt); }
  catch{ teamImageObjectUrl = URL.createObjectURL(f); }
  if(refs.tImagePreview){ refs.tImagePreview.src=teamImageObjectUrl; refs.tImagePreview.style.display="block"; }
  previewTeam();
});

document.querySelectorAll(".tab-btn").forEach((b)=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));

previewCompliance(); previewTeam(); previewCareer(); previewSettings();
ensureSession();
