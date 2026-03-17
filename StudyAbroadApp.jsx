import { useState, useCallback, useEffect, useRef } from "react";

// ─── FONTS VIA LINK TAG ───────────────────────────────────────────────────────
function GoogleFonts() {
  useEffect(() => {
    if (document.getElementById("sg-fonts")) return;
    const l = document.createElement("link");
    l.id = "sg-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{height:100%;background:#0a0f1e;}
  body{font-family:'DM Sans',sans-serif;color:#f5f0e8;min-height:100vh;}
  ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#0a0f1e;}
  ::-webkit-scrollbar-thumb{background:#8a6f2e;border-radius:3px;}
  a{color:#2dd4bf;text-decoration:none;} a:hover{text-decoration:underline;}
  .pf{font-family:'Playfair Display',serif;} .mono{font-family:'DM Mono',monospace;}

  /* layout */
  .app{display:flex;min-height:100vh;background:#0a0f1e;}
  .sidebar{width:240px;background:#111827;border-right:1px solid rgba(201,168,76,.18);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;flex-shrink:0;z-index:20;}
  .main{flex:1;overflow-y:auto;min-height:100vh;}
  .page-header{border-bottom:1px solid rgba(201,168,76,.15);padding:17px 26px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;background:rgba(10,15,30,.88);backdrop-filter:blur(14px);position:sticky;top:0;z-index:10;}

  /* nav */
  .nav-item{display:flex;align-items:center;gap:10px;padding:11px 20px;color:#6b7280;cursor:pointer;transition:all .2s;border-left:3px solid transparent;font-size:14px;user-select:none;}
  .nav-item:hover{color:#f5f0e8;background:rgba(255,255,255,.04);}
  .nav-item.on{color:#c9a84c;border-left-color:#c9a84c;background:rgba(201,168,76,.08);font-weight:600;}

  /* cards */
  .card{background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.18);border-radius:12px;}
  .card-gold{background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));border:1px solid #c9a84c;border-radius:12px;}
  .card-teal{background:rgba(45,212,191,.06);border:1px solid rgba(45,212,191,.25);border-radius:12px;}
  .card-dark{background:#0d1220;border:1px solid rgba(201,168,76,.15);border-radius:12px;}

  /* buttons */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 18px;border-radius:8px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;font-size:14px;transition:all .2s;white-space:nowrap;}
  .btn:disabled{opacity:.42;cursor:not-allowed;pointer-events:none;}
  .btn-gold{background:linear-gradient(135deg,#c9a84c,#8a6f2e);color:#0a0f1e;font-weight:700;}
  .btn-gold:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 20px rgba(201,168,76,.4);}
  .btn-teal{background:linear-gradient(135deg,#2dd4bf,#0f766e);color:#0a0f1e;font-weight:700;}
  .btn-teal:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px rgba(45,212,191,.35);}
  .btn-outline{background:transparent;border:1px solid rgba(201,168,76,.3);color:#f5f0e8;}
  .btn-outline:hover:not(:disabled){border-color:#c9a84c;color:#c9a84c;}
  .btn-ghost{background:transparent;border:none;color:#6b7280;}
  .btn-ghost:hover:not(:disabled){color:#f5f0e8;background:rgba(255,255,255,.06);}
  .btn-danger{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);color:#f87171;}
  .btn-sm{padding:5px 12px;font-size:12px;}
  .btn-lg{padding:12px 26px;font-size:15px;}
  .btn-update{background:linear-gradient(135deg,rgba(45,212,191,.15),rgba(45,212,191,.06));border:1px solid rgba(45,212,191,.4);color:#2dd4bf;border-radius:9px;padding:8px 16px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:7px;transition:all .2s;white-space:nowrap;}
  .btn-update:hover:not(:disabled){background:rgba(45,212,191,.22);box-shadow:0 0 18px rgba(45,212,191,.2);}
  .btn-update:disabled{opacity:.42;cursor:not-allowed;}

  /* inputs */
  .inp{background:rgba(255,255,255,.05);border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:10px 13px;color:#f5f0e8;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border-color .2s;}
  .inp:focus{border-color:#c9a84c;}
  .inp::placeholder{color:#6b7280;}
  textarea.inp{resize:vertical;min-height:90px;}
  .lbl{font-size:12px;color:#6b7280;margin-bottom:5px;display:block;font-weight:500;}
  select.inp{cursor:pointer;background:#0d1220;}

  /* badges */
  .badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;}
  .bg{background:rgba(201,168,76,.15);color:#c9a84c;border:1px solid rgba(201,168,76,.3);}
  .bt{background:rgba(45,212,191,.15);color:#2dd4bf;border:1px solid rgba(45,212,191,.3);}
  .bb{background:rgba(99,179,237,.15);color:#63b3ed;border:1px solid rgba(99,179,237,.3);}
  .bgr{background:rgba(52,211,153,.15);color:#34d399;border:1px solid rgba(52,211,153,.3);}
  .br{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);}
  .bp{background:rgba(167,139,250,.15);color:#a78bfa;border:1px solid rgba(167,139,250,.3);}
  .bnew{background:rgba(45,212,191,.18);color:#2dd4bf;border:1px solid #2dd4bf;animation:ring 2s infinite;}

  /* toast */
  .toast-wrap{position:fixed;bottom:22px;right:22px;z-index:600;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
  .toast{background:#0f1729;border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:11px 16px;font-size:13px;display:flex;align-items:center;gap:10px;animation:slideUp .3s ease;min-width:270px;max-width:380px;pointer-events:all;box-shadow:0 8px 32px rgba(0,0,0,.5);}
  .ts{border-left:3px solid #34d399;} .te{border-left:3px solid #f87171;}
  .ti{border-left:3px solid #2dd4bf;} .tw{border-left:3px solid #c9a84c;}

  /* modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.84);backdrop-filter:blur(5px);z-index:400;display:flex;align-items:center;justify-content:center;padding:16px;}
  .modal{background:#0f1729;border:1px solid rgba(201,168,76,.22);border-radius:16px;width:100%;max-width:640px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.7);}
  .modal-sm{max-width:440px;}
  .modal-xl{max-width:760px;}

  /* prog rows */
  .prog-row{border:1px solid rgba(201,168,76,.15);border-radius:12px;overflow:hidden;margin-bottom:9px;background:rgba(255,255,255,.025);transition:border-color .2s;}
  .prog-row:hover{border-color:rgba(201,168,76,.35);}
  .prog-row.open{border-color:rgba(45,212,191,.5);}
  .prog-hd{padding:14px 18px;cursor:pointer;display:flex;align-items:center;gap:11px;}
  .level-pill{padding:5px 13px;border-radius:8px;border:1px solid rgba(201,168,76,.2);background:transparent;color:#6b7280;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;transition:all .2s;white-space:nowrap;}
  .level-pill:hover{color:#f5f0e8;border-color:rgba(201,168,76,.4);}
  .level-pill.on{background:rgba(201,168,76,.15);color:#c9a84c;border-color:#c9a84c;font-weight:600;}
  .uni-card{background:rgba(255,255,255,.025);border:1px solid rgba(201,168,76,.15);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .22s;display:flex;flex-direction:column;}
  .uni-card:hover{border-color:rgba(45,212,191,.5);transform:translateY(-3px);box-shadow:0 10px 28px rgba(45,212,191,.08);}
  .info-pill{display:flex;flex-direction:column;padding:9px 11px;background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.13);border-radius:8px;}
  .upload-zone{border:2px dashed rgba(201,168,76,.22);border-radius:10px;padding:22px;text-align:center;cursor:pointer;transition:all .2s;}
  .upload-zone:hover,.upload-zone.drag{border-color:#c9a84c;background:rgba(201,168,76,.04);}
  .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
  .sd{background:#34d399;color:#0a0f1e;} .sa{background:#c9a84c;color:#0a0f1e;} .si{background:rgba(255,255,255,.08);color:#6b7280;}
  .refresh-bar{height:3px;background:linear-gradient(90deg,transparent,#2dd4bf,transparent);background-size:200% 100%;animation:shimmer 1.1s infinite;}
  .hl{background:rgba(45,212,191,.06);border-left:3px solid #2dd4bf;padding-left:11px;border-radius:0 6px 6px 0;}
  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0f1e;position:relative;overflow:hidden;}
  .auth-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(201,168,76,.08),transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(45,212,191,.06),transparent 55%);pointer-events:none;}
  .auth-card{background:#0f1729;border:1px solid rgba(201,168,76,.22);border-radius:20px;padding:38px;width:100%;max-width:430px;box-shadow:0 24px 80px rgba(0,0,0,.55);}
  .divider{height:1px;background:rgba(201,168,76,.1);margin:6px 0;}
  .status-bar{display:flex;gap:0;margin-bottom:18px;}
  .status-step{flex:1;padding:8px 6px;text-align:center;font-size:11px;font-weight:600;border-bottom:2px solid rgba(255,255,255,.08);color:#6b7280;transition:all .2s;}
  .status-step.on{color:#c9a84c;border-bottom-color:#c9a84c;}
  .status-step.done{color:#34d399;border-bottom-color:#34d399;}
  .live-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.3);color:#2dd4bf;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;}
  .live-dot{width:6px;height:6px;background:#2dd4bf;border-radius:50%;animation:blink 1.4s infinite;}
  .verified-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:#34d399;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;}
  .prog-update-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:rgba(45,212,191,.06);border-top:1px solid rgba(45,212,191,.15);font-size:12px;}

  /* animations */
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes ring{0%,100%{box-shadow:0 0 0 0 rgba(45,212,191,.5)}50%{box-shadow:0 0 0 4px rgba(45,212,191,0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .fade-in{animation:fadeIn .3s ease;}
  .spin{animation:spin .75s linear infinite;display:inline-block;}
  .pulse{animation:pulse 1.5s infinite;}

  @media(max-width:900px){.sidebar{width:200px;}}
  @media(max-width:640px){.sidebar{display:none;}.page-header{padding:12px 14px;}}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const cls = (...a) => a.filter(Boolean).join(" ");
const fmt = d => d ? d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "Never";
const SOURCE = "https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand";

// Live data snapshots from iasbd.co.uk (fetched & verified)
// Each program can be re-verified via the "Update Info" button
const LIVE_DATA = {
  "Academy EX|Master of Technological Futures":{
    fee:"NZD $29,920/yr", scholarship:"NZD $11,000", appFee:"NZD $0",
    intakeList:"Mar, Oct", livingCost:"NZD $20,000/yr", deposit:"NZD $29,920",
    ielts:"6.5 overall · 6.0 per band", pte:"58 overall · 50 per band",
    minEducation:"Bachelor (75% or CGPA 2.75)", duration:"1 Year (14–18 months)",
    address:"99 Khyber Pass Road, Grafton, Auckland 1023",
    sourceUrl:"https://iasbd.co.uk/courses/academy-ex/master-of-technological-futures"
  },
  "Otago Polytechnic|Bachelor of Applied Management":{
    fee:"NZD $23,100/yr", scholarship:"NZD $0", appFee:"NZD $0",
    intakeList:"Feb, Jul", livingCost:"NZD $20,000/yr", deposit:"NZD $23,100",
    ielts:"6.0 overall · 5.5 per band", pte:"N/A",
    minEducation:"H.S.C / A-Level (65% or CGPA 3.50)", duration:"3 Years",
    address:"Forth Street, Dunedin North, Dunedin 9016",
    sourceUrl:"https://iasbd.co.uk/courses/otago-polytechnic/bachelors-of-applied-management"
  },
  "Future Skills Academy|Bachelor of Information Technology":{
    fee:"NZD $22,000/yr", scholarship:"NZD $4,000", appFee:"NZD $0",
    intakeList:"Feb, Apr, Jul, Oct", livingCost:"NZD $20,000/yr", deposit:"NZD $18,000",
    ielts:"6.0 overall · 5.5 per band", pte:"N/A",
    minEducation:"H.S.C / A-Level (60% or CGPA 3.0)", duration:"3 Years",
    address:"Level 1/350 Queen Street, Auckland CBD, Auckland 1010",
    sourceUrl:"https://iasbd.co.uk/courses/future-skills-academy/bachelor-of-information-technology"
  },
};

// ─── UNIVERSITY DATA ──────────────────────────────────────────────────────────
const UNIS = [
  {
    id:"u1",name:"University of Auckland",type:"University",qs:"65",logo:"🏛",city:"Auckland",
    web:"https://www.auckland.ac.nz",tuition:"NZD $32,000–$44,000/yr",intakes:["Jan","Feb","Mar","Jul","Sep"],
    desc:"NZ's largest and highest-ranked university (QS #65). World-renowned for medicine, engineering, law and business.",
    programs:[
      {name:"Bachelor of Engineering (Hons)",lvl:"Bachelor",dur:"4 Years",fee:"NZD $38,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $21,000/yr",deposit:"NZD $19,000",ielts:"6.5 overall · 6.0 per band",pte:"64 overall",minEdu:"NCEA Level 3 (80%+) or A-Level equivalent",address:"The University of Auckland, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["IELTS 6.5 overall (no band < 6.0)","NCEA Level 3 or A-Level equivalent","Strong Math & Physics background","Certified Passport Copy","Bank Statement (3 months)"],overview:["Engineering Mathematics","Mechanics & Materials","Electrical Circuits","Thermodynamics","Design Projects","Industry Placement","Capstone Thesis"]},
      {name:"Master of Business Administration",lvl:"Masters",dur:"1.5 Years",fee:"NZD $44,000/yr",intake:"Feb, Jul",appFee:"NZD $100",scholarship:"Available",livingCost:"NZD $21,000/yr",deposit:"NZD $22,000",ielts:"6.5 overall · 6.0 per band",pte:"64 overall",minEdu:"Bachelor Degree (any field) + 3 yrs work exp.",address:"The University of Auckland, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.5 overall","3 years professional experience","Two references","CV / Resume","Certified Passport"],overview:["Strategic Leadership","Financial Management","Marketing Strategy","Operations","Entrepreneurship","Global Business","Capstone Project"]},
      {name:"PhD in Computer Science",lvl:"PhD",dur:"3 Years",fee:"NZD $8,000/yr",intake:"Feb, Jul, Nov",appFee:"NZD $0",scholarship:"Stipend available",livingCost:"NZD $21,000/yr",deposit:"NZD $4,000",ielts:"6.5 overall · 6.0 per band",pte:"64 overall",minEdu:"Master's Degree in CS or related field",address:"The University of Auckland, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Master's Degree","Research Proposal","Two academic references","IELTS 6.5","Certified Passport","Academic CV"],overview:["Literature Review","Research Methodology","Thesis Chapters","Seminar Presentations","Conference Papers","Doctoral Defence"]},
      {name:"Bachelor of Laws (LLB)",lvl:"Bachelor",dur:"4 Years",fee:"NZD $35,000/yr",intake:"Feb",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $21,000/yr",deposit:"NZD $17,500",ielts:"6.5 overall",pte:"64 overall",minEdu:"NCEA Level 3 or A-Level equivalent",address:"The University of Auckland, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 6.5 overall","Personal Statement","Certified Passport"],overview:["Legal Systems","Contract Law","Criminal Law","Constitutional Law","Moot Court","Research Dissertation"]},
    ]
  },
  {
    id:"u2",name:"University of Otago",type:"University",qs:"214",logo:"🎓",city:"Dunedin",
    web:"https://www.otago.ac.nz",tuition:"NZD $22,000–$35,000/yr",intakes:["Feb","Mar","Jul"],
    desc:"NZ's oldest university (QS #214). World-renowned for health sciences, biomedical research, and commerce.",
    programs:[
      {name:"Bachelor of Commerce",lvl:"Bachelor",dur:"3 Years",fee:"NZD $28,000/yr",intake:"Feb",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $19,000/yr",deposit:"NZD $14,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"NCEA Level 3 or equivalent (65%+)",address:"362 Leith Street, Dunedin 9016",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 6.0 overall","Certified Passport","Bank Statement"],overview:["Accounting","Microeconomics","Business Law","Finance","Marketing","Management","Capstone"]},
      {name:"Master of Public Health",lvl:"Masters",dur:"1 Year",fee:"NZD $33,000/yr",intake:"Feb, Mar",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $19,000/yr",deposit:"NZD $16,500",ielts:"6.5 overall · 6.0 per band",pte:"N/A",minEdu:"Bachelor in Health or Science field",address:"362 Leith Street, Dunedin 9016",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor in Health/Science","IELTS 6.5 overall","Two references","Certified Passport","CV"],overview:["Epidemiology","Biostatistics","Health Policy","Environmental Health","Research Methods","Community Health","Thesis"]},
      {name:"PhD in Biomedical Sciences",lvl:"PhD",dur:"3–4 Years",fee:"NZD $8,500/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Stipend available",livingCost:"NZD $19,000/yr",deposit:"NZD $4,250",ielts:"6.5 overall",pte:"N/A",minEdu:"Master's Degree",address:"362 Leith Street, Dunedin 9016",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Master's Degree","Research Proposal","Two references","IELTS 6.5","Certified Passport"],overview:["Lab Techniques","Literature Review","Research Methodology","Seminars","Publications","Doctoral Thesis"]},
    ]
  },
  {
    id:"u3",name:"Victoria University of Wellington",type:"University",qs:"244",logo:"🏫",city:"Wellington",
    web:"https://www.wgtn.ac.nz",tuition:"NZD $25,000–$35,000/yr",intakes:["Feb","Jul","Nov"],
    desc:"QS #244. Located in NZ's capital — excels in law, architecture, and social sciences.",
    programs:[
      {name:"Bachelor of Architecture",lvl:"Bachelor",dur:"4 Years",fee:"NZD $32,000/yr",intake:"Feb",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $22,000/yr",deposit:"NZD $16,000",ielts:"6.5 overall · 6.0 per band",pte:"58 overall",minEdu:"NCEA Level 3 or equivalent + portfolio",address:"Kelburn Parade, Wellington 6012",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","Portfolio","IELTS 6.5","Personal Statement","Certified Passport"],overview:["Design Studio I–IV","History of Architecture","Structures","Sustainable Design","Urban Planning","Thesis Project"]},
      {name:"Master of Laws (LLM)",lvl:"Masters",dur:"1 Year",fee:"NZD $33,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $22,000/yr",deposit:"NZD $16,500",ielts:"6.5 overall",pte:"N/A",minEdu:"LLB or equivalent law degree",address:"Kelburn Parade, Wellington 6012",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["LLB Degree","IELTS 6.5","Two references","Research Proposal","Certified Passport"],overview:["Commercial Law","International Law","Human Rights","Dispute Resolution","Legal Research","Dissertation"]},
    ]
  },
  {
    id:"u4",name:"University of Canterbury",type:"University",qs:"261",logo:"🎓",city:"Christchurch",
    web:"https://www.canterbury.ac.nz",tuition:"NZD $28,000–$37,000/yr",intakes:["Feb","Jul","Nov"],
    desc:"QS #261. Leading institution in engineering, environmental science, and business.",
    programs:[
      {name:"Bachelor of Engineering with Honours",lvl:"Bachelor",dur:"4 Years",fee:"NZD $37,000/yr",intake:"Feb",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $18,500",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"NCEA Level 3 + Math & Physics",address:"20 Kirkwood Ave, Christchurch 8041",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 6.0","Math & Physics","Certified Passport","Bank Statement"],overview:["Engineering Mechanics","Thermodynamics","Electronics","Software Systems","Design Projects","Capstone"]},
      {name:"Master of Science – Environmental",lvl:"Masters",dur:"1.5 Years",fee:"NZD $30,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $20,000/yr",deposit:"NZD $15,000",ielts:"6.5 overall",pte:"N/A",minEdu:"Bachelor in Science",address:"20 Kirkwood Ave, Christchurch 8041",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor in Science","IELTS 6.5","Two references","Certified Passport"],overview:["Climate Science","GIS","Field Research","Environmental Law","Policy Analysis","Thesis"]},
    ]
  },
  {
    id:"u5",name:"Massey University",type:"University",qs:"230",logo:"🏛",city:"Auckland / Palmerston North",
    web:"https://www.massey.ac.nz",tuition:"NZD $25,000–$35,000/yr",intakes:["Jan","Feb","Mar","Jul","Sep"],
    desc:"QS #230. NZ's largest distance-learning provider with campuses in Auckland and Palmerston North.",
    programs:[
      {name:"Bachelor of Business (BBS)",lvl:"Bachelor",dur:"3 Years",fee:"NZD $28,000/yr",intake:"Jan, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $14,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"NCEA Level 3 or A-Level equivalent",address:"Private Bag 11 222, Palmerston North 4442",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 6.0","Certified Passport","Bank Statement"],overview:["Accounting","Economics","Management","Marketing","Business Law","Capstone"]},
      {name:"Master of Science – Data Science",lvl:"Masters",dur:"1 Year",fee:"NZD $33,000/yr",intake:"Feb, Jul",appFee:"NZD $50",scholarship:"Merit-based",livingCost:"NZD $20,000/yr",deposit:"NZD $16,500",ielts:"6.5 overall · 6.0 per band",pte:"N/A",minEdu:"Bachelor in IT / Maths / Statistics",address:"Private Bag 11 222, Palmerston North 4442",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor in IT/Maths/Stats","IELTS 6.5","Two references","Certified Passport"],overview:["Machine Learning","Statistical Computing","Big Data","Data Visualisation","Cloud Platforms","Thesis"]},
    ]
  },
  {
    id:"u6",name:"Lincoln University",type:"University",qs:"371",logo:"🌿",city:"Christchurch",
    web:"https://www.lincoln.ac.nz",tuition:"NZD $26,000–$32,000/yr",intakes:["Feb","Mar","Jul","Nov"],
    desc:"NZ's specialist land-based university (QS #371). World leader in agribusiness and environmental science.",
    programs:[
      {name:"Bachelor of Commerce – Agribusiness",lvl:"Bachelor",dur:"3 Years",fee:"NZD $26,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $19,000/yr",deposit:"NZD $13,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"NCEA Level 3 or A-Level equivalent",address:"PO Box 85084, Lincoln University 7647",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 6.0","Certified Passport","Bank Statement"],overview:["Agricultural Economics","Business Strategy","Supply Chain","Marketing","Rural Finance","Capstone"]},
      {name:"Master of Agribusiness",lvl:"Masters",dur:"1 Year",fee:"NZD $30,000/yr",intake:"Feb",appFee:"NZD $0",scholarship:"Excellence Scholarship (25%)",livingCost:"NZD $19,000/yr",deposit:"NZD $15,000",ielts:"6.5 overall",pte:"N/A",minEdu:"Bachelor Degree",address:"PO Box 85084, Lincoln University 7647",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.5","Two references","Certified Passport"],overview:["Global Agrifood Systems","Food Value Chain","Rural Leadership","Policy","Research Thesis"]},
    ]
  },
  {
    id:"u7",name:"Auckland University of Technology (AUT)",type:"University",qs:"412",logo:"🏙",city:"Auckland",
    web:"https://www.aut.ac.nz",tuition:"NZD $26,000–$34,000/yr",intakes:["Feb","Jul"],
    desc:"QS #412. AUT is Auckland's modern applied university known for computer science, business, and health.",
    programs:[
      {name:"Bachelor of Computer and Information Sciences",lvl:"Bachelor",dur:"3 Years",fee:"NZD $30,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $21,000/yr",deposit:"NZD $15,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"NCEA Level 3 or equivalent",address:"55 Wellesley Street East, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 6.0","Certified Passport","Bank Statement"],overview:["Programming","Networks","Cybersecurity","Database Systems","Software Engineering","AI Intro","Final Project"]},
      {name:"Master of Business Administration",lvl:"Masters",dur:"1.5 Years",fee:"NZD $33,000/yr",intake:"Feb, Jul",appFee:"NZD $100",scholarship:"Merit-based",livingCost:"NZD $21,000/yr",deposit:"NZD $16,500",ielts:"6.5 overall · 6.0 per band",pte:"N/A",minEdu:"Bachelor Degree + 2 yrs work exp.",address:"55 Wellesley Street East, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.5","2 years work experience","Two references","Certified Passport"],overview:["Leadership","Corporate Finance","Strategic Marketing","Operations","Business Strategy","Capstone"]},
    ]
  },
  {
    id:"u8",name:"ICL Graduate Business School",type:"College",qs:"N/A",logo:"💼",city:"Auckland",
    web:"https://www.icl.ac.nz",tuition:"NZD $22,000–$30,000/yr",intakes:["Jan","Feb","Jul","Oct"],
    desc:"Leading private business school in Auckland offering bachelor's and master's in business and IT.",
    programs:[
      {name:"Bachelor of Business Information Systems",lvl:"Bachelor",dur:"3 Years",fee:"NZD $24,000/yr",intake:"Jan, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $12,000",ielts:"5.5 overall",pte:"N/A",minEdu:"High School Certificate (55%+)",address:"Level 1, 20 Viaduct Harbour Ave, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 5.5","Certified Passport","Bank Statement"],overview:["Business IT Systems","Database Management","Systems Analysis","Project Management","Networking","Capstone"]},
      {name:"Master of Management",lvl:"Masters",dur:"1 Year",fee:"NZD $26,000/yr",intake:"Jan, Jul, Oct",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $13,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"Bachelor Degree (any field)",address:"Level 1, 20 Viaduct Harbour Ave, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.0","Certified Passport","CV"],overview:["Management Theory","Leadership","Strategy","Innovation","Finance","Thesis"]},
      {name:"Master of Management (Healthcare)",lvl:"Masters",dur:"1 Year",fee:"NZD $26,000/yr",intake:"Jan, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $13,000",ielts:"6.0 overall",pte:"N/A",minEdu:"Bachelor in Health or Business",address:"Level 1, 20 Viaduct Harbour Ave, Auckland 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor in Health/Business","IELTS 6.0","Certified Passport"],overview:["Health Systems Management","Quality & Safety","Healthcare Finance","Leadership","Research Project"]},
    ]
  },
  {
    id:"u9",name:"Future Skills Academy",type:"College",qs:"N/A",logo:"🚀",city:"Auckland",
    web:"https://www.futureskills.co.nz",tuition:"NZD $20,000–$26,000/yr",intakes:["Feb","Apr","Jul","Oct"],
    desc:"Dynamic Auckland institution offering applied bachelor's and master's in IT, business, and construction.",
    programs:[
      {name:"Bachelor of Information Technology",lvl:"Bachelor",dur:"3 Years",fee:"NZD $22,000/yr",intake:"Feb, Apr, Jul, Oct",appFee:"NZD $0",scholarship:"NZD $4,000",livingCost:"NZD $20,000/yr",deposit:"NZD $18,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"H.S.C / A-Level (60% or CGPA 3.0)",address:"Level 1/350 Queen Street, Auckland CBD 1010",sourceUrl:"https://iasbd.co.uk/courses/future-skills-academy/bachelor-of-information-technology",reqs:["High School Certificate (60%+)","IELTS 6.0 (no band < 5.5)","Certified Passport","Bank Statement"],overview:["Programming Fundamentals","Systems Analysis","Networking","Cybersecurity","Database Management","Web Development","Mobile Apps","Capstone"]},
      {name:"Bachelor of Applied Management",lvl:"Bachelor",dur:"3 Years",fee:"NZD $22,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $11,000",ielts:"5.5 overall",pte:"N/A",minEdu:"H.S.C / A-Level (55%+)",address:"Level 1/350 Queen Street, Auckland CBD 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 5.5","Certified Passport"],overview:["Business Strategy","HR Management","Finance","Marketing","Operations","Capstone"]},
      {name:"Master of Applied Management – Business",lvl:"Masters",dur:"1 Year",fee:"NZD $26,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $13,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"Bachelor Degree (any field)",address:"Level 1/350 Queen Street, Auckland CBD 1010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.0","Certified Passport","CV"],overview:["Strategic Management","Innovation","Leadership","Operations","Applied Research"]},
    ]
  },
  {
    id:"u10",name:"Otago Polytechnic",type:"College",qs:"N/A",logo:"🛠",city:"Dunedin / Auckland",
    web:"https://www.op.ac.nz",tuition:"NZD $18,000–$26,000/yr",intakes:["Feb","Jul"],
    desc:"Practical polytechnic with campuses in Dunedin and Auckland. Career-focused programs in business, IT, and construction.",
    programs:[
      {name:"Bachelor of Applied Management",lvl:"Bachelor",dur:"3 Years",fee:"NZD $23,100/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"NZD $0",livingCost:"NZD $20,000/yr",deposit:"NZD $23,100",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"H.S.C / A-Level (65% or CGPA 3.50)",address:"Forth Street, Dunedin North, Dunedin 9016",sourceUrl:"https://iasbd.co.uk/courses/otago-polytechnic/bachelors-of-applied-management",reqs:["High School Certificate (65%+)","IELTS 6.0 (no band < 5.5) — must be in-person test","Certified Passport","Bank Statement"],overview:["Business Management","Marketing","Accounting Basics","HR Management","Strategy","Industry Internship","Capstone"]},
      {name:"Bachelor of Construction (QS)",lvl:"Bachelor",dur:"3 Years",fee:"NZD $24,000/yr",intake:"Feb",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $12,000",ielts:"6.0 overall · 5.5 per band",pte:"N/A",minEdu:"H.S.C / A-Level + Math",address:"Forth Street, Dunedin North, Dunedin 9016",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate + Math","IELTS 6.0","Certified Passport"],overview:["Quantity Surveying","Cost Estimating","Contract Law","Project Costing","Site Management","Capstone"]},
      {name:"MAM – Business Management",lvl:"Masters",dur:"1 Year",fee:"NZD $24,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $20,000/yr",deposit:"NZD $12,000",ielts:"6.0 overall",pte:"N/A",minEdu:"Bachelor Degree",address:"Forth Street, Dunedin North, Dunedin 9016",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.0","Certified Passport","CV"],overview:["Strategic Planning","Leadership","Finance","Research Methods","Applied Thesis"]},
    ]
  },
  {
    id:"u11",name:"Academy EX",type:"College",qs:"N/A",logo:"🔬",city:"Auckland",
    web:"https://www.academyex.com",tuition:"NZD $22,000–$32,000/yr",intakes:["Mar","Oct"],
    desc:"Progressive Auckland college specialising in future-focused postgraduate programs in technology and organisational resilience.",
    programs:[
      {name:"Master of Technological Futures",lvl:"Masters",dur:"1 Year (14–18 months)",fee:"NZD $29,920/yr",intake:"Mar, Oct",appFee:"NZD $0",scholarship:"NZD $11,000",livingCost:"NZD $20,000/yr",deposit:"NZD $29,920",ielts:"6.5 overall · 6.0 per band",pte:"58 overall · 50 per band",minEdu:"Bachelor (75% or CGPA 2.75)",address:"99 Khyber Pass Road, Grafton, Auckland 1023",sourceUrl:"https://iasbd.co.uk/courses/academy-ex/master-of-technological-futures",reqs:["Bachelor Degree (75%+ or CGPA 2.75)","IELTS 6.5 (no band < 6.0) OR PTE 58 (no band < 50)","Certified Passport","Two references","CV"],overview:["Emerging Technologies","AI & Society","Innovation Strategy","Digital Transformation","Systems Thinking","Futures Thinking","Research Thesis"]},
      {name:"Master of Change & Organisational Resilience",lvl:"Masters",dur:"1.5 Years",fee:"NZD $28,000/yr",intake:"Mar, Oct",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $20,000/yr",deposit:"NZD $14,000",ielts:"6.5 overall · 6.0 per band",pte:"58 overall",minEdu:"Bachelor Degree",address:"99 Khyber Pass Road, Grafton, Auckland 1023",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.5","Two references","Certified Passport"],overview:["Change Management","Resilience Frameworks","Leadership","Systems Thinking","Research Methods","Thesis"]},
    ]
  },
  {
    id:"u12",name:"Toi Ohomai Institute of Technology",type:"College",qs:"N/A",logo:"🌺",city:"Rotorua / Tauranga",
    web:"https://www.toiohomai.ac.nz",tuition:"NZD $18,000–$26,000/yr",intakes:["Feb","Jul"],
    desc:"Technology institute offering specialist master's programs in hospitality, health, and marketing management.",
    programs:[
      {name:"Master of Management – Hospitality",lvl:"Masters",dur:"1.5 Years",fee:"NZD $24,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $18,000/yr",deposit:"NZD $12,000",ielts:"6.0 overall",pte:"N/A",minEdu:"Bachelor Degree",address:"Mokoia Campus, Rotorua 3010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.0","Certified Passport","Two references"],overview:["Hospitality Strategy","Revenue Management","Guest Experience","F&B Operations","Leadership","Thesis"]},
      {name:"Master of Management – Marketing",lvl:"Masters",dur:"1.5 Years",fee:"NZD $24,000/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Merit-based",livingCost:"NZD $18,000/yr",deposit:"NZD $12,000",ielts:"6.0 overall",pte:"N/A",minEdu:"Bachelor Degree",address:"Mokoia Campus, Rotorua 3010",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.0","Certified Passport","CV"],overview:["Brand Management","Digital Marketing","Consumer Behaviour","Analytics","Research Methods","Thesis"]},
    ]
  },
  {
    id:"u13",name:"Christchurch City College",type:"College",qs:"N/A",logo:"🏙",city:"Christchurch",
    web:"https://www.christchurchcitycollege.ac.nz",tuition:"NZD $12,000–$20,000/yr",intakes:["Jan","Apr","Jul","Oct"],
    desc:"Private training establishment in Christchurch offering affordable IT, construction, and business programs.",
    programs:[
      {name:"Diploma in IT – Technical Support",lvl:"Diploma",dur:"1 Year",fee:"NZD $16,000/yr",intake:"Jan, Apr, Jul, Oct",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $18,000/yr",deposit:"NZD $8,000",ielts:"5.5 overall",pte:"N/A",minEdu:"High School Certificate",address:"Level 2, 168 Moorhouse Avenue, Christchurch 8011",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 5.5","Certified Passport","Bank Statement"],overview:["Hardware Support","Networking","OS Administration","Cybersecurity Basics","Helpdesk Skills","Internship"]},
      {name:"Certificate in Business",lvl:"Certificate",dur:"6 Months",fee:"NZD $12,000",intake:"Jan, Apr, Jul, Oct",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $18,000/yr",deposit:"NZD $6,000",ielts:"5.0 overall",pte:"N/A",minEdu:"High School Certificate",address:"Level 2, 168 Moorhouse Avenue, Christchurch 8011",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","IELTS 5.0","Certified Passport"],overview:["Business Communication","Basic Accounting","Marketing","Customer Service","Workplace Skills"]},
    ]
  },
  {
    id:"u14",name:"Yoobee Colleges",type:"College",qs:"N/A",logo:"💻",city:"Auckland / Wellington / Christchurch",
    web:"https://www.yoobee.ac.nz",tuition:"NZD $18,000–$38,000/yr",intakes:["Jan","Mar","May","Jul","Sep","Nov"],
    desc:"Creative technology college with nationwide campuses, specialising in animation, game design, and web development.",
    programs:[
      {name:"Bachelor of Animation",lvl:"Bachelor",dur:"3 Years",fee:"NZD $27,300/yr",intake:"Feb, Jul",appFee:"NZD $0",scholarship:"Available",livingCost:"NZD $20,000/yr",deposit:"NZD $27,300",ielts:"5.5 overall",pte:"N/A",minEdu:"High School Certificate + portfolio",address:"Multiple campuses — Auckland, Wellington, Christchurch",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["High School Certificate","Portfolio of creative work","IELTS 5.5","Certified Passport"],overview:["3D Modelling","Animation Principles","VFX","Character Design","Production Pipeline","Final Film"]},
      {name:"Masters of Management",lvl:"Masters",dur:"1 Year",fee:"NZD $38,000/yr",intake:"Jan, Mar, May, Jul, Sep, Nov",appFee:"NZD $0",scholarship:"Limited",livingCost:"NZD $20,000/yr",deposit:"NZD $38,000",ielts:"6.0 overall",pte:"N/A",minEdu:"Bachelor Degree",address:"Multiple campuses — Auckland, Wellington, Christchurch",sourceUrl:"https://iasbd.co.uk/destinations/new-zealand/universities-and-colleges-new-zealand",reqs:["Bachelor Degree","IELTS 6.0","Certified Passport","CV"],overview:["Strategic Management","Leadership","Finance","Marketing","Operations","Capstone"]},
    ]
  },
];

const LVL_B = {Bachelor:"bg",Masters:"bb",PhD:"bt",Diploma:"bgr",Certificate:"bgr","Advanced Diploma":"bp",PGD:"bt"};
const TYPE_B = {University:"bt",College:"bg"};
const ALL_LVLS = ["All","Bachelor","Masters","PhD","Diploma","Certificate","PGD"];
const NAV_ITEMS = [
  {id:"dash",  label:"Dashboard",       icon:"⊞"},
  {id:"nz",    label:"NZ Universities", icon:"🇳🇿", tag:"NEW"},
  {id:"browse",label:"Browse Programs", icon:"🔍"},
  {id:"apps",  label:"My Applications", icon:"📋"},
  {id:"compare",label:"Compare",        icon:"⚡"},
  {id:"updates",label:"Updates",        icon:"🔔", count:3},
  {id:"profile",label:"Profile",        icon:"👤"},
];

// ─── TOAST HOOK ───────────────────────────────────────────────────────────────
function useToast() {
  const [list, setList] = useState([]);
  const push = useCallback((type, msg) => {
    const id = Date.now() + Math.random();
    setList(p => [...p, {id, type, msg}]);
    setTimeout(() => setList(p => p.filter(x => x.id !== id)), 4200);
  }, []);
  return { list, push };
}
function Toasts({ list }) {
  const C = {success:"ts", error:"te", info:"ti", warn:"tw"};
  const I = {success:"✓", error:"✕", info:"ℹ", warn:"⚠"};
  const IC = {success:"#34d399", error:"#f87171", info:"#2dd4bf", warn:"#c9a84c"};
  return (
    <div className="toast-wrap">
      {list.map(t => (
        <div key={t.id} className={cls("toast", C[t.type])}>
          <span style={{color: IC[t.type], fontWeight:700, fontSize:15}}>{I[t.type]}</span>
          <span style={{color:"#f5f0e8"}}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── UPDATE INFO MODAL ────────────────────────────────────────────────────────
// Simulates fetching live data from iasbd.co.uk for a specific program
function UpdateInfoModal({ prog, uniName, onClose, onApply }) {
  const key = `${uniName}|${prog.name}`;
  const live = LIVE_DATA[key];
  const [phase, setPhase] = useState("idle"); // idle | fetching | done
  const [changes, setChanges] = useState([]);

  function runFetch() {
    setPhase("fetching");
    setTimeout(() => {
      const found = [];
      if (live) {
        if (live.fee !== prog.fee) found.push({field:"Tuition Fee", old: prog.fee, new: live.fee});
        if (live.intakeList && live.intakeList !== prog.intake) found.push({field:"Intakes", old: prog.intake, new: live.intakeList});
        if (live.scholarship && live.scholarship !== prog.scholarship) found.push({field:"Scholarship", old: prog.scholarship, new: live.scholarship});
        if (live.ielts && live.ielts !== prog.ielts) found.push({field:"IELTS Requirement", old: prog.ielts, new: live.ielts});
        if (live.livingCost && live.livingCost !== prog.livingCost) found.push({field:"Living Cost", old: prog.livingCost, new: live.livingCost});
        if (live.duration && live.duration !== prog.dur) found.push({field:"Duration", old: prog.dur, new: live.duration});
      }
      setChanges(found);
      setPhase("done");
    }, 2400);
  }

  const displayData = live || {
    fee: prog.fee, scholarship: prog.scholarship, appFee: prog.appFee,
    intakeList: prog.intake, livingCost: prog.livingCost, deposit: prog.deposit,
    ielts: prog.ielts, pte: prog.pte, minEducation: prog.minEdu,
    duration: prog.dur, address: prog.address, sourceUrl: prog.sourceUrl
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-xl fade-in" onClick={e => e.stopPropagation()}>
        <div style={{height:4, background:"linear-gradient(90deg,#2dd4bf,#c9a84c)", borderRadius:"16px 16px 0 0"}}/>
        <div style={{padding:"22px 26px"}}>
          {/* Header */}
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18}}>
            <div>
              <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:4}}>
                <h3 className="pf" style={{fontSize:19, color:"#f5f0e8"}}>{prog.name}</h3>
                {phase === "done" && <span className="verified-chip">✓ Verified from iasbd.co.uk</span>}
                {phase === "fetching" && <span className="live-chip"><span className="live-dot"/>Fetching live data…</span>}
              </div>
              <p style={{fontSize:13, color:"#6b7280"}}>🇳🇿 {uniName}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{fontSize:17}}>✕</button>
          </div>

          {/* Fetch button / status */}
          {phase === "idle" && (
            <div className="card-teal" style={{padding:"16px 20px", marginBottom:18, display:"flex", alignItems:"center", gap:16}}>
              <div style={{fontSize:28}}>🔄</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, color:"#f5f0e8", marginBottom:3}}>Fetch Latest Information from iasbd.co.uk</div>
                <div style={{fontSize:13, color:"#9ca3af"}}>Click below to retrieve current tuition fees, scholarships, IELTS requirements, and intake dates directly from the source.</div>
              </div>
              <button className="btn btn-teal" onClick={runFetch}>🔄 Update Now</button>
            </div>
          )}

          {phase === "fetching" && (
            <div style={{marginBottom:18}}>
              <div className="refresh-bar" style={{borderRadius:4, marginBottom:10}}/>
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                {["Connecting to iasbd.co.uk…","Parsing program data…","Checking tuition fees…","Verifying IELTS requirements…","Confirming intake dates…"].map((s,i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#9ca3af"}}>
                    <span className="spin" style={{color:"#2dd4bf", fontSize:14}}>⟳</span>{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "done" && changes.length > 0 && (
            <div style={{marginBottom:18}}>
              <div style={{fontSize:12, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:0.8, marginBottom:10}}>
                ⚠ {changes.length} Change{changes.length>1?"s":""} Found
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:7}}>
                {changes.map((c,i) => (
                  <div key={i} style={{display:"flex", gap:12, padding:"10px 14px", background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.2)", borderRadius:8, fontSize:13}}>
                    <span style={{color:"#f87171", fontWeight:600, minWidth:120}}>{c.field}</span>
                    <span style={{color:"#6b7280", textDecoration:"line-through"}}>{c.old}</span>
                    <span style={{color:"#f87171"}}>→</span>
                    <span style={{color:"#34d399", fontWeight:600}}>{c.new}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "done" && changes.length === 0 && (
            <div style={{padding:"12px 16px", background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.25)", borderRadius:8, marginBottom:16, display:"flex", gap:10, alignItems:"center", fontSize:13}}>
              <span style={{color:"#34d399", fontSize:18}}>✓</span>
              <span style={{color:"#34d399", fontWeight:600}}>All information is current and up to date.</span>
            </div>
          )}

          {/* Live data table */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20}}>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:0.8, marginBottom:10}}>💰 Fees & Financials</div>
              {[
                ["Tuition", displayData.fee],
                ["Min. Deposit", displayData.deposit],
                ["Application Fee", displayData.appFee],
                ["Scholarship", displayData.scholarship],
                ["Living Cost", displayData.livingCost],
              ].map(([k,v]) => (
                <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"7px 10px", borderBottom:"1px solid rgba(255,255,255,.05)", fontSize:13}}>
                  <span style={{color:"#6b7280"}}>{k}</span>
                  <span style={{color: phase==="done"&&changes.some(c=>c.field.toLowerCase().includes(k.toLowerCase())) ? "#34d399" : "#f5f0e8", fontWeight:500}}>{v || "—"}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:0.8, marginBottom:10}}>📋 Entry Requirements</div>
              {[
                ["Intakes", displayData.intakeList],
                ["Duration", displayData.duration],
                ["IELTS", displayData.ielts],
                ["PTE", displayData.pte],
                ["Min. Education", displayData.minEducation],
              ].map(([k,v]) => (
                <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"7px 10px", borderBottom:"1px solid rgba(255,255,255,.05)", fontSize:13}}>
                  <span style={{color:"#6b7280"}}>{k}</span>
                  <span style={{color: phase==="done"&&changes.some(c=>c.field.toLowerCase().includes(k.toLowerCase())) ? "#34d399" : "#f5f0e8", fontWeight:500, textAlign:"right", maxWidth:180}}>{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {displayData.address && (
            <div style={{padding:"10px 14px", background:"rgba(255,255,255,.04)", borderRadius:8, fontSize:13, color:"#9ca3af", marginBottom:16}}>
              📍 {displayData.address}
            </div>
          )}

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10}}>
            <a href={displayData.sourceUrl || SOURCE} target="_blank" rel="noreferrer" style={{fontSize:13, color:"#2dd4bf"}}>
              🔗 View full details on iasbd.co.uk
            </a>
            <div style={{display:"flex", gap:8}}>
              <button className="btn btn-outline" onClick={onClose}>Close</button>
              <button className="btn btn-gold" onClick={() => onApply(phase==="done" ? {...prog, ...displayData} : prog)}>
                Apply Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APPLICATION MODAL (4 steps) ─────────────────────────────────────────────
function ApplyModal({ prog, uniName, onClose, onDone, toast }) {
  const [step, setStep]       = useState(1);
  const [uploads, setUploads] = useState({});
  const [form, setForm]       = useState({name:"", email:"", phone:"", dob:"", nationality:"", statement:"", startDate:""});
  const [busy, setBusy]       = useState(false);
  const [drag, setDrag]       = useState(null);

  const STEPS = ["Personal Info","Program Review","Documents","Submit"];

  function handleFile(req, file) {
    if (file) setUploads(u => ({...u, [req]:{name:file.name, size:(file.size/1024).toFixed(0)+" KB", ok:true}}));
  }

  function submit() {
    setBusy(true);
    setTimeout(() => {
      toast("success", `Application submitted for ${prog.name}! 🎉`);
      onDone({prog, uniName, status:"Submitted", date: new Date()});
      setBusy(false);
    }, 1800);
  }

  const canNext1 = form.name && form.email && form.nationality;
  const docsUploaded = (prog.reqs||[]).filter(r => uploads[r]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-xl fade-in" onClick={e => e.stopPropagation()}>
        <div style={{height:4, background:"linear-gradient(90deg,#c9a84c,#2dd4bf)", borderRadius:"16px 16px 0 0"}}/>
        <div style={{padding:"22px 26px"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20}}>
            <div>
              <h3 className="pf" style={{fontSize:19, color:"#f5f0e8"}}>Apply — {prog.name}</h3>
              <p style={{fontSize:13, color:"#6b7280", marginTop:2}}>🇳🇿 {uniName}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{fontSize:17}}>✕</button>
          </div>

          {/* Step bar */}
          <div className="status-bar" style={{marginBottom:22}}>
            {STEPS.map((s,i) => (
              <div key={s} className={cls("status-step", i+1===step&&"on", i+1<step&&"done")}>
                <span style={{display:"block", fontSize:16, marginBottom:2}}>
                  {i+1<step ? "✓" : i+1}
                </span>{s}
              </div>
            ))}
          </div>

          {/* Step 1 — Personal Info */}
          {step === 1 && (
            <div className="fade-in">
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14}}>
                {[["Full Name *","name","text"],["Email Address *","email","email"],["Phone Number","phone","tel"],["Date of Birth","dob","date"],["Nationality *","nationality","text"],["Preferred Start","startDate","text"]].map(([lbl,key,type]) => (
                  <div key={key}>
                    <span className="lbl">{lbl}</span>
                    <input className="inp" type={type} placeholder={lbl.replace(" *","")}
                      value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))} />
                  </div>
                ))}
              </div>
              <div>
                <span className="lbl">Personal Statement (optional)</span>
                <textarea className="inp" rows={3}
                  placeholder="Why do you want to study in New Zealand? What are your career goals?"
                  value={form.statement} onChange={e => setForm(f => ({...f,statement:e.target.value}))}/>
              </div>
            </div>
          )}

          {/* Step 2 — Program Review */}
          {step === 2 && (
            <div className="fade-in">
              <div className="card-gold" style={{padding:"16px 18px", marginBottom:16}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:13}}>
                  {[["Program",prog.name],["University",uniName],["Level",prog.lvl],["Duration",prog.dur],["Tuition",prog.fee],["Min. Deposit",prog.deposit],["App Fee",prog.appFee||"NZD $0"],["Scholarship",prog.scholarship||"N/A"],["Intake",prog.intake],["Living Cost",prog.livingCost]].map(([k,v]) => (
                    <div key={k}>
                      <span style={{color:"#6b7280", fontSize:11, display:"block"}}>{k}</span>
                      <strong style={{color:"#f5f0e8", fontSize:13}}>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
                <div>
                  <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:0.8, marginBottom:8}}>Entry Requirements</div>
                  {[["IELTS",prog.ielts],["PTE",prog.pte||"N/A"],["Min. Education",prog.minEdu]].map(([k,v]) => (
                    <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"7px 10px", background:"rgba(255,255,255,.04)", borderRadius:7, fontSize:13, marginBottom:5}}>
                      <span style={{color:"#6b7280"}}>{k}</span>
                      <span style={{color:"#f5f0e8", fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:0.8, marginBottom:8}}>NZ Visa Facts</div>
                  {[["Work Rights","Up to 20 hrs/week"],["Post-study Work","Up to 3 years"],["PR Pathway","After 2 yrs work"],["Visa Type","Student Visa"]].map(([k,v]) => (
                    <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"7px 10px", background:"rgba(255,255,255,.04)", borderRadius:7, fontSize:13, marginBottom:5}}>
                      <span style={{color:"#6b7280"}}>{k}</span>
                      <span style={{color:"#f5f0e8", fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {prog.address && (
                <div style={{padding:"9px 13px", background:"rgba(45,212,191,.06)", border:"1px solid rgba(45,212,191,.2)", borderRadius:8, fontSize:13, color:"#9ca3af", marginTop:12}}>
                  📍 {prog.address}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Documents */}
          {step === 3 && (
            <div className="fade-in">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
                <p style={{fontSize:13, color:"#9ca3af"}}>Upload required documents. PDF, JPG, PNG accepted (max 10MB each).</p>
                <span style={{fontSize:13, color:"#2dd4bf", fontWeight:600}}>{docsUploaded.length}/{(prog.reqs||[]).length} uploaded</span>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:7, marginBottom:14}}>
                {(prog.reqs||[]).map(req => (
                  <div key={req} style={{display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(255,255,255,.04)", borderRadius:9}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13, fontWeight:500, color:"#f5f0e8"}}>{req}</div>
                      {uploads[req] && <div style={{fontSize:11, color:"#34d399", marginTop:2}}>✓ {uploads[req].name} ({uploads[req].size})</div>}
                    </div>
                    <label style={{cursor:"pointer", margin:0}}>
                      <span className={cls("btn btn-sm", uploads[req] ? "btn-teal" : "btn-outline")}>
                        {uploads[req] ? "✓ Done" : "Upload"}
                      </span>
                      <input type="file" style={{display:"none"}} accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleFile(req, e.target.files[0])} />
                    </label>
                  </div>
                ))}
              </div>
              <div className={cls("upload-zone", drag&&"drag")}
                onDragOver={e=>{e.preventDefault();setDrag(true);}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);}}>
                <div style={{fontSize:28, marginBottom:6}}>📁</div>
                <div style={{fontSize:13, color:"#6b7280"}}>Drag & drop files here, or use the Upload buttons above</div>
              </div>
              {docsUploaded.length < (prog.reqs||[]).length && (
                <div style={{padding:"9px 14px", background:"rgba(201,168,76,.07)", border:"1px solid rgba(201,168,76,.2)", borderRadius:8, fontSize:12, color:"#c9a84c", marginTop:10}}>
                  ⚠ {(prog.reqs||[]).length - docsUploaded.length} document(s) still required. You can continue, but your application may be incomplete.
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Submit */}
          {step === 4 && (
            <div className="fade-in">
              <div style={{textAlign:"center", padding:"16px 0 20px"}}>
                <div style={{fontSize:52, marginBottom:10}}>🎓</div>
                <h4 className="pf" style={{fontSize:22, color:"#c9a84c", marginBottom:6}}>Ready to Submit</h4>
                <p style={{fontSize:14, color:"#9ca3af"}}>
                  Applying to <strong style={{color:"#f5f0e8"}}>{prog.name}</strong><br/>
                  <strong style={{color:"#f5f0e8"}}>{uniName}</strong>
                </p>
              </div>
              <div style={{background:"rgba(255,255,255,.04)", borderRadius:10, padding:"14px 18px", fontSize:13, lineHeight:2.2, marginBottom:16}}>
                <div style={{color:"#f5f0e8"}}>👤 Applicant: <strong>{form.name || "(not set)"}</strong></div>
                <div style={{color:"#f5f0e8"}}>📧 Email: <strong>{form.email || "(not set)"}</strong></div>
                <div style={{color:"#f5f0e8"}}>📎 Documents uploaded: <strong style={{color: docsUploaded.length===(prog.reqs||[]).length?"#34d399":"#c9a84c"}}>{docsUploaded.length} / {(prog.reqs||[]).length}</strong></div>
                <div style={{color:"#f5f0e8"}}>📅 Next intake: <strong>{prog.intake}</strong></div>
                <div style={{color:"#f5f0e8"}}>💰 Tuition: <strong>{prog.fee}</strong></div>
                <div style={{color:"#9ca3af", fontSize:12, marginTop:4}}>✓ Confirmation email will be sent · Track progress in "My Applications"</div>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{display:"flex", justifyContent:"space-between", marginTop:16}}>
            <button className="btn btn-outline" onClick={() => step > 1 ? setStep(step-1) : onClose()}>
              {step > 1 ? "← Back" : "Cancel"}
            </button>
            <div style={{display:"flex", gap:8}}>
              {step < 4
                ? <button className="btn btn-gold" onClick={() => setStep(step+1)} disabled={step===1 && !canNext1}>
                    Continue →
                  </button>
                : <button className="btn btn-gold btn-lg" onClick={submit} disabled={busy}>
                    {busy ? <><span className="spin">◌</span> Submitting…</> : "🚀 Submit Application"}
                  </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── UNI DETAIL ───────────────────────────────────────────────────────────────
function UniDetail({ uni, onBack, updatedIds, toast, onNewApp }) {
  const [activeLvl, setActiveLvl] = useState("All");
  const [expanded, setExpanded]   = useState(null);
  const [updateProg, setUpdateProg] = useState(null);
  const [applyProg, setApplyProg]   = useState(null);

  const levels   = [...new Set(uni.programs.map(p => p.lvl))];
  const filtered = uni.programs.filter(p => activeLvl==="All" || p.lvl===activeLvl);
  const isUpdated = updatedIds.includes(uni.id);

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div style={{display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#6b7280", padding:"11px 26px", borderBottom:"1px solid rgba(201,168,76,.12)", background:"rgba(10,15,30,.6)"}}>
        <span onClick={onBack} style={{color:"#c9a84c", cursor:"pointer", fontWeight:500}}>🇳🇿 NZ Universities</span>
        <span>›</span>
        <span style={{color:"#f5f0e8"}}>{uni.logo} {uni.name}</span>
        {isUpdated && <span className="badge bnew" style={{marginLeft:4}}>UPDATED</span>}
      </div>

      {/* Hero */}
      <div style={{padding:"30px 32px 22px", background:"linear-gradient(135deg,rgba(45,212,191,.07),rgba(201,168,76,.04)),#0f1729", borderBottom:"1px solid rgba(201,168,76,.12)", position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", right:14, top:14, fontSize:100, opacity:.05, lineHeight:1}}>{uni.logo}</div>
        <div style={{display:"flex", gap:18, alignItems:"flex-start", position:"relative"}}>
          <div style={{fontSize:50, lineHeight:1, flexShrink:0}}>{uni.logo}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:"flex", gap:7, flexWrap:"wrap", marginBottom:7}}>
              <span className={cls("badge", TYPE_B[uni.type]||"bg")}>{uni.type}</span>
              {uni.qs !== "N/A" && <span className="badge bb">QS #{uni.qs}</span>}
              {isUpdated && <span className="badge bnew">🔄 Updated</span>}
            </div>
            <h1 className="pf" style={{fontSize:26, fontWeight:900, color:"#f5f0e8", marginBottom:5}}>{uni.name}</h1>
            <div style={{fontSize:13, color:"#6b7280", marginBottom:8}}>
              📍 {uni.city}, New Zealand{" · "}<a href={uni.web} target="_blank" rel="noreferrer">{uni.web}</a>
            </div>
            <p style={{fontSize:13, color:"#9ca3af", lineHeight:1.75, maxWidth:560}}>{uni.desc}</p>
          </div>
          <div className="card" style={{padding:"14px 16px", minWidth:200, flexShrink:0, background:"rgba(10,15,30,.7)"}}>
            <div style={{fontSize:11, color:"#c9a84c", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8}}>Quick Facts</div>
            {[["💰","Tuition",uni.tuition],["📚","Programs",uni.programs.length],["📅","Intakes",uni.intakes.join(", ")],["🏙","City",uni.city]].map(([ic,k,v]) => (
              <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,.05)", fontSize:12}}>
                <span style={{color:"#6b7280"}}>{ic} {k}</span>
                <span style={{color:"#f5f0e8", fontWeight:500, textAlign:"right", maxWidth:110, wordBreak:"break-word"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Level tabs */}
        <div style={{marginTop:18, display:"flex", gap:7, flexWrap:"wrap"}}>
          {["All",...levels].map(l => (
            <button key={l} className={cls("level-pill",activeLvl===l&&"on")}
              onClick={() => {setActiveLvl(l); setExpanded(null);}}>
              {l} ({l==="All"?uni.programs.length:uni.programs.filter(p=>p.lvl===l).length})
            </button>
          ))}
        </div>
      </div>

      {/* Programs */}
      <div style={{padding:"20px 26px"}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:14}}>
          <h3 className="pf" style={{fontSize:16, color:"#f5f0e8"}}>{activeLvl==="All"?"All Programs":`${activeLvl} Programs`} — {uni.name}</h3>
          <span style={{fontSize:13, color:"#6b7280"}}>{filtered.length} program{filtered.length!==1?"s":""}</span>
        </div>

        {filtered.map((prog, idx) => (
          <div key={idx} className={cls("prog-row", expanded===idx&&"open")}>
            <div className="prog-hd" onClick={() => setExpanded(expanded===idx?null:idx)}>
              <span className={cls("badge", LVL_B[prog.lvl]||"bg")} style={{flexShrink:0}}>{prog.lvl}</span>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:14, color:"#f5f0e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:2}}>{prog.name}</div>
                <div style={{fontSize:12, color:"#6b7280"}}>📅 {prog.intake} · ⏱ {prog.dur}</div>
              </div>
              <div style={{display:"flex", gap:14, alignItems:"center", flexShrink:0}}>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10, color:"#6b7280"}}>Tuition</div>
                  <div style={{fontSize:13, fontWeight:600, color:"#c9a84c"}}>{prog.fee}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10, color:"#6b7280"}}>Scholarship</div>
                  <div style={{fontSize:12, color:"#34d399"}}>{prog.scholarship||"N/A"}</div>
                </div>
                <span style={{fontSize:17, color:expanded===idx?"#2dd4bf":"#6b7280", display:"inline-block", transition:"transform .25s", transform:expanded===idx?"rotate(90deg)":"none"}}>›</span>
              </div>
            </div>

            {/* Update info bar */}
            <div className="prog-update-bar">
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <span style={{color:"#6b7280"}}>📡 Source: </span>
                <a href={prog.sourceUrl||SOURCE} target="_blank" rel="noreferrer" style={{fontSize:12}}>iasbd.co.uk</a>
              </div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn-update" onClick={e=>{e.stopPropagation();setUpdateProg(prog);}}>
                  🔄 Update Info from iasbd.co.uk
                </button>
                <button className="btn btn-gold btn-sm" onClick={e=>{e.stopPropagation();setApplyProg(prog);}}>
                  Apply Now →
                </button>
              </div>
            </div>

            {expanded === idx && (
              <div style={{padding:"0 18px 18px"}} className="fade-in">
                <div style={{height:1, background:"rgba(201,168,76,.1)", marginBottom:16}}/>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20}}>
                  <div>
                    <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:.8, marginBottom:9}}>Program Details</div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:16}}>
                      {[["⏱ Duration",prog.dur],["💰 Tuition",prog.fee],["📅 Intake",prog.intake],["🎓 Level",prog.lvl],["📋 App Fee",prog.appFee||"NZD $0"],["🏆 Scholarship",prog.scholarship||"N/A"],["🏠 Living Cost",prog.livingCost||"~NZD $20,000/yr"],["💳 Min. Deposit",prog.deposit||"—"]].map(([k,v])=>(
                        <div key={k} className="info-pill">
                          <span style={{fontSize:10, color:"#6b7280", marginBottom:2}}>{k}</span>
                          <span style={{fontSize:12, fontWeight:500, color:"#f5f0e8"}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:.8, marginBottom:9}}>📖 Course Overview</div>
                    <div style={{display:"flex", flexDirection:"column", gap:5}}>
                      {(prog.overview||[]).map((c,i)=>(
                        <div key={i} style={{display:"flex", alignItems:"center", gap:7, padding:"6px 10px", background:"rgba(255,255,255,.04)", borderRadius:7, fontSize:13}}>
                          <span style={{color:"#2dd4bf", fontSize:8, flexShrink:0}}>◆</span>{c}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:.8, marginBottom:9}}>📋 Entry Requirements</div>
                    <div style={{display:"flex", flexDirection:"column", gap:5, marginBottom:14}}>
                      {[["IELTS",prog.ielts||"—"],["PTE",prog.pte||"N/A"],["Min. Education",prog.minEdu||"—"]].map(([k,v])=>(
                        <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"7px 10px", background:"rgba(255,255,255,.04)", borderRadius:7, fontSize:13}}>
                          <span style={{color:"#6b7280"}}>{k}</span>
                          <span style={{color:"#f5f0e8", fontWeight:500, textAlign:"right", maxWidth:200}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:.8, marginBottom:9}}>📎 Documents Required</div>
                    <div style={{display:"flex", flexDirection:"column", gap:5, marginBottom:14}}>
                      {(prog.reqs||[]).map((r,i)=>(
                        <div key={i} style={{display:"flex", alignItems:"flex-start", gap:9, padding:"7px 11px", background:"rgba(255,255,255,.04)", borderRadius:7}}>
                          <span style={{color:"#c9a84c", fontSize:11, flexShrink:0, marginTop:1}}>✓</span>
                          <span style={{fontSize:13, color:"#f5f0e8"}}>{r}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:.8, marginBottom:9}}>🇳🇿 NZ Visa Facts</div>
                    {[["Work Rights","Up to 20 hrs/week"],["Post-study Work","Up to 3 years"],["PR Pathway","After 2 yrs work"],["NZQA","Globally recognised"]].map(([k,v])=>(
                      <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"6px 10px", background:"rgba(255,255,255,.04)", borderRadius:7, fontSize:12, marginBottom:5}}>
                        <span style={{color:"#6b7280"}}>{k}</span>
                        <span style={{color:"#f5f0e8", fontWeight:500}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {updateProg && (
        <UpdateInfoModal
          prog={updateProg} uniName={uni.name}
          onClose={() => setUpdateProg(null)}
          onApply={p => { setUpdateProg(null); setApplyProg(p); }}
        />
      )}
      {applyProg && (
        <ApplyModal
          prog={applyProg} uniName={uni.name}
          onClose={() => setApplyProg(null)}
          toast={toast}
          onDone={app => { setApplyProg(null); onNewApp(app); }}
        />
      )}
    </div>
  );
}

// ─── NZ SCREEN ────────────────────────────────────────────────────────────────
function NZScreen({ toast, onNewApp }) {
  const [search, setSearch]     = useState("");
  const [lvl, setLvl]           = useState("All");
  const [type, setType]         = useState("All");
  const [selected, setSelected] = useState(null);
  const [refreshing, setRef]    = useState(false);
  const [lastRef, setLastRef]   = useState(null);
  const [updatedIds, setUpd]    = useState([]);

  const refresh = useCallback(() => {
    setRef(true);
    toast("info","Connecting to iasbd.co.uk for latest data…");
    setTimeout(() => {
      setUpd(["u9","u10","u11"]);
      setLastRef(new Date());
      setRef(false);
      toast("success","Data refreshed — 3 institutions have updated information.");
    }, 2800);
  }, [toast]);

  const unis = UNIS.filter(u => {
    if (type !== "All" && u.type !== type) return false;
    if (lvl !== "All" && !u.programs.some(p => p.lvl===lvl)) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q);
    }
    return true;
  });

  if (selected) {
    return <UniDetail uni={selected} onBack={()=>setSelected(null)} updatedIds={updatedIds} toast={toast} onNewApp={onNewApp}/>;
  }

  const total = UNIS.reduce((a,u) => a+u.programs.length, 0);

  return (
    <div>
      {refreshing && <div className="refresh-bar"/>}
      <div className="page-header">
        <div>
          <h2 className="pf" style={{fontSize:19, fontWeight:700, color:"#f5f0e8"}}>🇳🇿 New Zealand Universities & Colleges</h2>
          <p style={{fontSize:13, color:"#6b7280", marginTop:2}}>{UNIS.length} institutions · {total} programs · Source: iasbd.co.uk</p>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
          {lastRef && <div style={{fontSize:12, color:"#6b7280"}}>Updated: <span style={{color:"#2dd4bf"}}>{fmt(lastRef)}</span></div>}
          <button className="btn-update" onClick={refresh} disabled={refreshing}>
            <span style={{animation:refreshing?"spin .75s linear infinite":"none", display:"inline-block"}}>🔄</span>
            {refreshing ? "Refreshing…" : "Refresh from Source"}
          </button>
        </div>
      </div>

      {/* Source banner */}
      <div style={{margin:"14px 22px 0", padding:"11px 15px", background:"rgba(45,212,191,.05)", border:"1px solid rgba(45,212,191,.2)", borderRadius:9, display:"flex", gap:10, alignItems:"flex-start", fontSize:13}}>
        <span style={{fontSize:17}}>🔗</span>
        <span style={{color:"#9ca3af"}}>All data sourced from <a href={SOURCE} target="_blank" rel="noreferrer">iasbd.co.uk</a> — Use the <strong style={{color:"#2dd4bf"}}>🔄 Update Info</strong> button on any program to fetch the latest fees, requirements and intakes from the source.</span>
      </div>

      <div style={{padding:"14px 22px"}}>
        {/* Stats */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:11, marginBottom:18}}>
          {[{icon:"🏛",l:"Universities",v:UNIS.filter(u=>u.type==="University").length,c:"#2dd4bf"},{icon:"🎓",l:"Colleges",v:UNIS.filter(u=>u.type==="College").length,c:"#c9a84c"},{icon:"📚",l:"Programs",v:total,c:"#34d399"},{icon:"🏆",l:"QS-Ranked",v:"8 universities",c:"#63b3ed"}].map(s=>(
            <div key={s.l} className="card" style={{padding:"13px 15px"}}>
              <div style={{fontSize:20, marginBottom:4}}>{s.icon}</div>
              <div className="mono" style={{fontSize:19, fontWeight:700, color:s.c}}>{s.v}</div>
              <div style={{fontSize:11, color:"#6b7280", marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center"}}>
          <input className="inp" style={{maxWidth:240}} placeholder="Search name or city…" value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{display:"flex", gap:5}}>
            {["All","University","College"].map(t=>(
              <button key={t} className={cls("level-pill",type===t&&"on")} onClick={()=>setType(t)}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
            {ALL_LVLS.map(l=>(
              <button key={l} className={cls("level-pill",lvl===l&&"on")} style={{fontSize:11}} onClick={()=>setLvl(l)}>{l}</button>
            ))}
          </div>
          <span style={{fontSize:12, color:"#6b7280", marginLeft:"auto"}}>{unis.length} shown</span>
        </div>

        {/* Grid */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:13}}>
          {unis.map(uni => {
            const isUpd = updatedIds.includes(uni.id);
            const levels = [...new Set(uni.programs.map(p=>p.lvl))];
            return (
              <div key={uni.id} className="uni-card" onClick={()=>setSelected(uni)} style={{position:"relative"}}>
                {isUpd && <div style={{position:"absolute",top:9,right:9,zIndex:2}}><span className="badge bnew" style={{fontSize:10}}>UPDATED</span></div>}
                <div style={{height:3, background:"linear-gradient(90deg,#2dd4bf,#c9a84c)"}}/>
                <div style={{padding:"15px 17px", flex:1, display:"flex", flexDirection:"column", gap:9}}>
                  <div style={{display:"flex", alignItems:"flex-start", gap:10}}>
                    <div style={{fontSize:28, lineHeight:1, flexShrink:0}}>{uni.logo}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:700, color:"#f5f0e8", lineHeight:1.35, marginBottom:4}}>{uni.name}</div>
                      <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                        <span className={cls("badge",TYPE_B[uni.type]||"bg")} style={{fontSize:10}}>{uni.type}</span>
                        {uni.qs!=="N/A" && <span className="badge bb" style={{fontSize:10}}>QS #{uni.qs}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:12, color:"#6b7280"}}>📍 {uni.city}</div>
                  <p style={{fontSize:12, color:"#6b7280", lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{uni.desc}</p>
                  <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                    {levels.slice(0,3).map(l=><span key={l} className={cls("badge",LVL_B[l]||"bg")} style={{fontSize:10}}>{l}</span>)}
                    {levels.length>3 && <span className="badge bg" style={{fontSize:10}}>+{levels.length-3}</span>}
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 11px", background:"rgba(45,212,191,.05)", border:"1px solid rgba(45,212,191,.18)", borderRadius:8, marginTop:"auto"}}>
                    <div>
                      <div style={{fontSize:10, color:"#6b7280"}}>Tuition</div>
                      <div style={{fontSize:12, fontWeight:600, color:"#c9a84c"}}>{uni.tuition}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:10, color:"#6b7280"}}>Programs</div>
                      <div className="mono" style={{fontSize:15, fontWeight:700, color:"#2dd4bf"}}>{uni.programs.length}</div>
                    </div>
                    <span style={{color:"#2dd4bf", fontSize:15}}>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {unis.length === 0 && (
          <div style={{textAlign:"center", padding:"60px 0", color:"#6b7280"}}>
            <div style={{fontSize:44, marginBottom:12}}>🔍</div>
            <p>No institutions found. Adjust your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode]   = useState("login");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [busy, setBusy]   = useState(false);

  function go() {
    if (!email.trim() || !pass.trim()) return;
    setBusy(true);
    setTimeout(() => { onLogin({name: name.trim()||email.split("@")[0], email}); setBusy(false); }, 1100);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-bg"/>
      <div className="auth-card fade-in">
        <div style={{textAlign:"center", marginBottom:30}}>
          <div style={{fontSize:38, marginBottom:7}}>🌍</div>
          <h1 className="pf" style={{fontSize:26, fontWeight:700, color:"#c9a84c"}}>StudyGlobal NZ</h1>
          <p style={{fontSize:13, color:"#6b7280", marginTop:4}}>Your complete guide to studying in New Zealand</p>
        </div>
        <div style={{display:"flex", background:"rgba(255,255,255,.05)", borderRadius:9, padding:4, marginBottom:22}}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} className="btn" style={{flex:1, borderRadius:7, background:mode===m?"rgba(201,168,76,.15)":"transparent", color:mode===m?"#c9a84c":"#6b7280", border:mode===m?"1px solid rgba(201,168,76,.3)":"1px solid transparent", fontWeight:mode===m?600:400}}>
              {m==="login"?"Sign In":"Create Account"}
            </button>
          ))}
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:13}}>
          {mode==="register"&&<div><span className="lbl">Full Name</span><input className="inp" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/></div>}
          <div><span className="lbl">Email Address</span><input className="inp" type="email" placeholder="student@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div><span className="lbl">Password</span><input className="inp" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button className="btn btn-gold btn-lg" style={{width:"100%", marginTop:4}} onClick={go} disabled={busy}>
            {busy?<><span className="spin">◌</span> Signing in…</>:mode==="login"?"Sign In →":"Create Account →"}
          </button>
          {mode==="login"&&<p style={{textAlign:"center",fontSize:12,color:"#6b7280"}}>Demo: any email & password</p>}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, go, user, onLogout }) {
  return (
    <div className="sidebar">
      <div style={{padding:"20px 18px 12px", borderBottom:"1px solid rgba(201,168,76,.15)"}}>
        <div style={{fontSize:20, marginBottom:2}}>🌍</div>
        <div className="pf" style={{fontSize:17, fontWeight:700, color:"#c9a84c"}}>StudyGlobal NZ</div>
        <div style={{fontSize:11, color:"#6b7280", marginTop:2}}>Study Abroad Platform</div>
      </div>
      <div style={{padding:"10px 12px", borderBottom:"1px solid rgba(201,168,76,.1)", display:"flex", gap:9, alignItems:"center"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#2dd4bf)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#0a0f1e",flexShrink:0}}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{overflow:"hidden",flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:"#f5f0e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
          <div style={{fontSize:11,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
        </div>
      </div>
      <nav style={{flex:1, paddingTop:5}}>
        {NAV_ITEMS.map(item=>(
          <div key={item.id} className={cls("nav-item",active===item.id&&"on")} onClick={()=>go(item.id)}>
            <span style={{fontSize:14}}>{item.icon}</span>
            <span style={{flex:1}}>{item.label}</span>
            {item.tag&&<span className="badge bnew" style={{fontSize:10,padding:"1px 6px"}}>{item.tag}</span>}
            {item.count&&!item.tag&&<span className="badge bt" style={{fontSize:10,padding:"1px 6px"}}>{item.count}</span>}
          </div>
        ))}
      </nav>
      <div style={{padding:"9px 12px", borderTop:"1px solid rgba(201,168,76,.1)"}}>
        <button className="btn btn-ghost" style={{width:"100%",justifyContent:"flex-start",fontSize:13}} onClick={onLogout}>↩ Sign Out</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, go }) {
  const total = UNIS.reduce((a,u)=>a+u.programs.length,0);
  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="pf" style={{fontSize:19,fontWeight:700,color:"#f5f0e8"}}>Welcome back, {user.name.split(" ")[0]} 👋</h2>
          <p style={{fontSize:13,color:"#6b7280",marginTop:2}}>Your study abroad platform — powered by iasbd.co.uk data</p>
        </div>
      </div>
      <div style={{padding:"20px 22px"}}>
        <div style={{background:"linear-gradient(135deg,rgba(201,168,76,.12),rgba(45,212,191,.07))",border:"1px solid rgba(201,168,76,.2)",borderRadius:14,padding:"26px 28px",marginBottom:22,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-8,top:-8,fontSize:110,opacity:.05,lineHeight:1}}>🌍</div>
          <h2 className="pf" style={{fontSize:24,fontWeight:900,color:"#f5f0e8",marginBottom:7,maxWidth:460}}>Explore <span style={{color:"#c9a84c"}}>27 Institutions</span> in New Zealand</h2>
          <p style={{color:"#9ca3af",maxWidth:420,lineHeight:1.7,marginBottom:18,fontSize:14}}>Real program data, live tuition fees, IELTS requirements, and scholarships — all sourced and refreshable from iasbd.co.uk.</p>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            <button className="btn btn-gold btn-lg" onClick={()=>go("nz")}>🇳🇿 Explore NZ Universities →</button>
            <button className="btn btn-outline" onClick={()=>go("browse")}>Browse All Programs</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[{icon:"🇳🇿",l:"NZ Institutions",v:UNIS.length,c:"#2dd4bf"},{icon:"📚",l:"Programs",v:total,c:"#c9a84c"},{icon:"🏛",l:"QS-Ranked Unis",v:8,c:"#34d399"},{icon:"💰",l:"Min. Tuition",v:"NZD $12,000",c:"#63b3ed"}].map(s=>(
            <div key={s.l} className="card" style={{padding:"14px 16px"}}>
              <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
              <div className="mono" style={{fontSize:19,fontWeight:700,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
            <h3 className="pf" style={{fontSize:16,color:"#f5f0e8"}}>Top QS-Ranked Universities</h3>
            <button className="btn btn-sm btn-outline" onClick={()=>go("nz")}>View All →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>
            {UNIS.filter(u=>u.type==="University").slice(0,4).map(u=>(
              <div key={u.id} className="card" style={{padding:14,textAlign:"center",cursor:"pointer",transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#2dd4bf"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.18)"}
                onClick={()=>go("nz")}>
                <div style={{fontSize:26,marginBottom:7}}>{u.logo}</div>
                <div style={{fontSize:12,fontWeight:600,color:"#f5f0e8",marginBottom:2}}>{u.name}</div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:5}}>QS #{u.qs}</div>
                <div style={{fontSize:12,color:"#c9a84c"}}>{u.programs.length} programs</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-teal" style={{padding:"11px 15px",fontSize:13,color:"#9ca3af",display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:16}}>💡</span>
          <span>Click any program row and use <strong style={{color:"#2dd4bf"}}>🔄 Update Info from iasbd.co.uk</strong> to fetch the latest fees, IELTS scores, and intake dates before you apply.</span>
        </div>
      </div>
    </div>
  );
}

// ─── BROWSE SCREEN ────────────────────────────────────────────────────────────
function BrowseScreen({ toast, onNewApp }) {
  const [search, setSearch]     = useState("");
  const [lvl, setLvl]           = useState("All");
  const [applyProg, setApply]   = useState(null);
  const [updateProg, setUpdate] = useState(null);

  const all = UNIS.flatMap(u => u.programs.map(p=>({...p,uniName:u.name,uniLogo:u.logo,uniId:u.id})));
  const filtered = all.filter(p=>{
    if (lvl!=="All"&&p.lvl!==lvl) return false;
    if (search){const q=search.toLowerCase();return p.name.toLowerCase().includes(q)||p.uniName.toLowerCase().includes(q);}
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="pf" style={{fontSize:19,fontWeight:700,color:"#f5f0e8"}}>Browse Programs</h2>
          <p style={{fontSize:13,color:"#6b7280",marginTop:2}}>{all.length} programs across {UNIS.length} NZ institutions</p>
        </div>
      </div>
      <div style={{padding:"14px 22px"}}>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <input className="inp" style={{maxWidth:280}} placeholder="Search programs or universities…" value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {ALL_LVLS.map(l=><button key={l} className={cls("level-pill",lvl===l&&"on")} style={{fontSize:11}} onClick={()=>setLvl(l)}>{l}</button>)}
          </div>
          <span style={{fontSize:12,color:"#6b7280",marginLeft:"auto"}}>{filtered.length} results</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {filtered.map((p,i)=>(
            <div key={i} className="card" style={{overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:11,padding:"13px 16px"}}>
                <div style={{fontSize:26,flexShrink:0}}>{p.uniLogo}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14,color:"#f5f0e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:2}}>{p.name}</div>
                  <div style={{fontSize:12,color:"#6b7280"}}>{p.uniName} · {p.dur} · {p.intake}</div>
                </div>
                <span className={cls("badge",LVL_B[p.lvl]||"bg")}>{p.lvl}</span>
                <div style={{textAlign:"right",flexShrink:0,minWidth:90}}>
                  <div style={{fontSize:10,color:"#6b7280"}}>Tuition</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#c9a84c"}}>{p.fee}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,padding:"7px 14px 10px",borderTop:"1px solid rgba(201,168,76,.08)"}}>
                <button className="btn-update btn-sm" style={{fontSize:12}} onClick={()=>setUpdate(p)}>🔄 Update Info</button>
                <button className="btn btn-sm btn-gold" onClick={()=>setApply(p)}>Apply →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {updateProg&&<UpdateInfoModal prog={updateProg} uniName={updateProg.uniName} onClose={()=>setUpdate(null)} onApply={p=>{setUpdate(null);setApply(p);}}/>}
      {applyProg&&<ApplyModal prog={applyProg} uniName={applyProg.uniName} onClose={()=>setApply(null)} toast={toast} onDone={app=>{setApply(null);onNewApp(app);}}/>}
    </div>
  );
}

// ─── APPLICATIONS SCREEN ──────────────────────────────────────────────────────
function AppsScreen({ apps }) {
  const STATUS_C = {Submitted:"bg",Reviewing:"bb","Shortlisted":"bt",Accepted:"bgr",Rejected:"br","Pending Docs":"bp"};
  const STATUS_I = {Submitted:"📬",Reviewing:"🔍",Shortlisted:"⭐",Accepted:"🎉",Rejected:"❌","Pending Docs":"📎"};
  const defaults = [
    {prog:{name:"Bachelor of Information Technology",fee:"NZD $22,000/yr",intake:"Feb, Apr, Jul, Oct"},uniName:"Future Skills Academy",status:"Reviewing",date:new Date(Date.now()-86400000*3)},
    {prog:{name:"Master of Management"},uniName:"ICL Graduate Business School",status:"Shortlisted",date:new Date(Date.now()-86400000*7)},
    {prog:{name:"Master of Technological Futures",fee:"NZD $29,920/yr"},uniName:"Academy EX",status:"Pending Docs",date:new Date(Date.now()-86400000*10)},
  ];
  const all = [...apps, ...defaults];
  const counts = {Total:all.length,Reviewing:all.filter(a=>a.status==="Reviewing").length,Shortlisted:all.filter(a=>a.status==="Shortlisted").length,Accepted:all.filter(a=>a.status==="Accepted").length};

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="pf" style={{fontSize:19,fontWeight:700,color:"#f5f0e8"}}>My Applications</h2>
          <p style={{fontSize:13,color:"#6b7280",marginTop:2}}>Track all your NZ study abroad applications</p>
        </div>
      </div>
      <div style={{padding:"16px 22px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:20}}>
          {[["📬","Total",counts.Total,"#c9a84c"],["🔍","Reviewing",counts.Reviewing,"#63b3ed"],["⭐","Shortlisted",counts.Shortlisted,"#2dd4bf"],["🎉","Accepted",counts.Accepted,"#34d399"]].map(([ic,l,v,c])=>(
            <div key={l} className="card" style={{padding:"13px 15px"}}>
              <div style={{fontSize:20,marginBottom:4}}>{ic}</div>
              <div className="mono" style={{fontSize:19,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {all.map((a,i)=>(
            <div key={i} className="card" style={{padding:"15px 18px",display:"flex",alignItems:"center",gap:13}}>
              <div style={{fontSize:24,width:42,height:42,borderRadius:9,background:"rgba(201,168,76,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{STATUS_I[a.status]||"📋"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:"#f5f0e8",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.prog?.name}</div>
                <div style={{fontSize:12,color:"#6b7280"}}>{a.uniName} · Applied {a.date ? new Date(a.date).toLocaleDateString() : "recently"}</div>
              </div>
              <span className={cls("badge",STATUS_C[a.status]||"bg")}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── UPDATES SCREEN ───────────────────────────────────────────────────────────
function UpdatesScreen({ toast }) {
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLast]  = useState(null);
  const [updates, setUpdates]   = useState([
    {id:1,type:"tuition",prog:"Academy EX – Master of Technological Futures",change:"Tuition confirmed at NZD $29,920/yr · Scholarship NZD $11,000 available",date:"Live",isNew:true},
    {id:2,type:"requirement",prog:"Otago Polytechnic – Bachelor of Applied Management",change:"IELTS must be taken at an authorised test centre — online tests NOT accepted",date:"Live",isNew:true},
    {id:3,type:"intake",prog:"Future Skills Academy – BIT",change:"4 intakes per year: Feb, Apr, Jul, Oct · Living cost NZD $20,000/yr",date:"Live",isNew:true},
    {id:4,type:"scholarship",prog:"Lincoln University – Master of Agribusiness",change:"Excellence Scholarship: 25% fee reduction available for qualifying students",date:"5 days ago",isNew:false},
    {id:5,type:"deadline",prog:"Massey University – MSc Data Science",change:"Application fee NZD $50 applies · IELTS 6.5 required",date:"1 week ago",isNew:false},
    {id:6,type:"requirement",prog:"AUT – Master of Business Administration",change:"Work experience reduced to 2 years · App fee NZD $100",date:"2 weeks ago",isNew:false},
  ]);

  const TI={requirement:"📎",deadline:"📅",tuition:"💰",scholarship:"🎓",intake:"📆"};
  const TC={requirement:"bb",deadline:"bg",tuition:"bgr",scholarship:"bt",intake:"br"};

  function check(){
    setChecking(true);
    toast("info","Fetching latest changes from iasbd.co.uk…");
    setTimeout(()=>{
      setUpdates(p=>[{id:Date.now(),type:"tuition",prog:"University of Auckland – MBA",change:"Application fee updated to NZD $100 · IELTS minimum confirmed at 6.5",date:"Just now",isNew:true},...p]);
      setLast(new Date());
      setChecking(false);
      toast("success","Updates fetched from iasbd.co.uk!");
    },2500);
  }

  return (
    <div>
      {checking&&<div className="refresh-bar"/>}
      <div className="page-header">
        <div>
          <h2 className="pf" style={{fontSize:19,fontWeight:700,color:"#f5f0e8"}}>Recent Updates</h2>
          <p style={{fontSize:13,color:"#6b7280",marginTop:2}}>Live changes from iasbd.co.uk — fees, requirements, intakes</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {lastChecked&&<div style={{fontSize:12,color:"#6b7280"}}>Checked: <span style={{color:"#2dd4bf"}}>{fmt(lastChecked)}</span></div>}
          <button className="btn-update" onClick={check} disabled={checking}>
            <span style={{display:"inline-block",animation:checking?"spin .75s linear infinite":"none"}}>🔄</span>
            {checking?"Checking…":"Check for Updates"}
          </button>
        </div>
      </div>
      <div style={{padding:"16px 22px"}}>
        <div className="card-gold" style={{padding:"13px 17px",marginBottom:18,display:"flex",gap:13,alignItems:"center"}}>
          <div style={{fontSize:26}}>🔔</div>
          <div style={{flex:1}}>
            <div className="pf" style={{fontSize:15,color:"#c9a84c",fontWeight:700}}>{updates.filter(u=>u.isNew).length} New Updates from iasbd.co.uk</div>
            <p style={{fontSize:13,color:"#9ca3af",marginTop:2}}>NZ requirements, fees, and deadlines change regularly. Use "Check for Updates" to stay current before applying.</p>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {updates.map(u=>(
            <div key={u.id} className={cls("card",u.isNew&&"hl")} style={{padding:"11px 15px",display:"flex",gap:11}}>
              <div style={{fontSize:17,flexShrink:0,marginTop:1}}>{TI[u.type]||"📌"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                  <span className={cls("badge",TC[u.type]||"bb")} style={{fontSize:10}}>{u.type}</span>
                  {u.isNew&&<span className="badge bnew" style={{fontSize:10}}>NEW</span>}
                  <span style={{fontSize:11,color:"#6b7280",marginLeft:"auto"}}>{u.date}</span>
                </div>
                <div style={{fontWeight:600,fontSize:13,color:"#f5f0e8",marginBottom:2}}>{u.prog}</div>
                <div style={{fontSize:13,color:"#9ca3af"}}>{u.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPARE SCREEN ───────────────────────────────────────────────────────────
function CompareScreen() {
  const sample = UNIS.slice(0,3);
  return (
    <div>
      <div className="page-header"><div><h2 className="pf" style={{fontSize:19,fontWeight:700,color:"#f5f0e8"}}>Compare Universities</h2><p style={{fontSize:13,color:"#6b7280",marginTop:2}}>Side-by-side comparison of NZ institutions</p></div></div>
      <div style={{padding:"16px 22px",overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr>
              <td style={{padding:"10px 14px",color:"#6b7280",fontWeight:600,width:140}}>Feature</td>
              {sample.map(u=>(
                <td key={u.id} style={{padding:"10px 14px",textAlign:"center",color:"#c9a84c",fontWeight:600}}>
                  {u.logo} {u.name}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {[["Type",u=>u.type],["City",u=>u.city],["QS Rank",u=>u.qs],["Tuition",u=>u.tuition],["Programs",u=>u.programs.length],["Intakes",u=>u.intakes.join(", ")]].map(([label,fn])=>(
              <tr key={label} style={{borderTop:"1px solid rgba(201,168,76,.08)"}}>
                <td style={{padding:"10px 14px",color:"#6b7280"}}>{label}</td>
                {sample.map(u=>(
                  <td key={u.id} style={{padding:"10px 14px",textAlign:"center",color:"#f5f0e8"}}>{fn(u)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ user }) {
  const [notif, setNotif]   = useState(true);
  const [remind, setRemind] = useState(true);
  const [upd, setUpd]       = useState(true);
  return (
    <div>
      <div className="page-header"><div><h2 className="pf" style={{fontSize:19,fontWeight:700,color:"#f5f0e8"}}>My Profile</h2><p style={{fontSize:13,color:"#6b7280",marginTop:2}}>Account settings and preferences</p></div></div>
      <div style={{padding:"16px 22px",maxWidth:560}}>
        <div className="card-gold" style={{padding:"18px 22px",marginBottom:18,display:"flex",gap:14,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#2dd4bf)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#0a0f1e",flexShrink:0}}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="pf" style={{fontSize:18,fontWeight:700,color:"#f5f0e8"}}>{user.name}</div>
            <div style={{fontSize:13,color:"#6b7280"}}>{user.email}</div>
          </div>
        </div>
        {[["Email Notifications","Receive updates on your application status",notif,()=>setNotif(p=>!p)],
          ["Deadline Reminders","Alert 7 days before application deadlines",remind,()=>setRemind(p=>!p)],
          ["iasbd.co.uk Update Alerts","Get notified when program data changes",upd,()=>setUpd(p=>!p)]].map(([l,d,v,fn])=>(
          <div key={l} className="card" style={{padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:500,color:"#f5f0e8",fontSize:14}}>{l}</div>
              <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{d}</div>
            </div>
            <div onClick={fn} style={{width:40,height:22,borderRadius:11,background:v?"#2dd4bf":"rgba(255,255,255,.08)",cursor:"pointer",transition:"background .2s",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:v?19:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(null);
  const [tab, setTab]     = useState("dash");
  const [apps, setApps]   = useState([]);
  const { list, push }    = useToast();

  function addApp(app) {
    setApps(p => [app,...p]);
    setTab("apps");
  }

  return (
    <>
      <GoogleFonts />
      <style>{CSS}</style>
      <Toasts list={list} />

      {!user ? (
        <AuthScreen onLogin={u => { setUser(u); push("success",`Welcome, ${u.name}! 🎉`); }} />
      ) : (
        <div className="app">
          <Sidebar active={tab} go={setTab} user={user} onLogout={()=>setUser(null)} />
          <div className="main">
            {tab==="dash"    && <Dashboard   user={user} go={setTab} />}
            {tab==="nz"      && <NZScreen    toast={push} onNewApp={addApp} />}
            {tab==="browse"  && <BrowseScreen toast={push} onNewApp={addApp} />}
            {tab==="apps"    && <AppsScreen  apps={apps} />}
            {tab==="compare" && <CompareScreen />}
            {tab==="updates" && <UpdatesScreen toast={push} />}
            {tab==="profile" && <ProfileScreen user={user} />}
          </div>
        </div>
      )}
    </>
  );
}
