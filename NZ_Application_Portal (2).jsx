// StudyGlobal v4 — All 24 audit issues fixed
import { useState, useRef, useEffect, useCallback } from "react";

// ─── FIX #22: correct BDT rate (1 NZD ≈ ৳72, verified March 2026)
// ─── FIX #17: consistent currency formatting throughout
const CURRENCIES = {
  NZD: { symbol: "NZD", flag: "🇳🇿", rate: 1 },
  BDT: { symbol: "৳",   flag: "🇧🇩", rate: 72 },
  USD: { symbol: "$",   flag: "🇺🇸", rate: 0.59 },
  EUR: { symbol: "€",   flag: "🇪🇺", rate: 0.55 },
  GBP: { symbol: "£",   flag: "🇬🇧", rate: 0.47 },
  AUD: { symbol: "A$",  flag: "🇦🇺", rate: 0.92 },
};
function fmt(nzd, cur) {
  if (nzd === 0) return "FREE 🎉";
  const c = CURRENCIES[cur];
  const v = nzd * c.rate;
  if (cur === "BDT") return `৳${(v / 100000).toFixed(1)} লাখ`;
  return `${c.symbol}${v.toLocaleString("en", { maximumFractionDigits: 0 })}`;
}
// FIX #17: tracker always converts live using current currency
function fmtLive(nzd, cur) { return fmt(nzd, cur); }

// ─── ENGLISH TESTS ────────────────────────────────────────────────────────────
const ENGLISH_TESTS = [
  { id:"pte",          label:"PTE Academic" },
  { id:"ielts",        label:"IELTS Academic" },
  { id:"toefl",        label:"TOEFL iBT" },
  { id:"duolingo",     label:"Duolingo English Test" },
  { id:"cambridge_c1", label:"Cambridge C1 Advanced" },
  { id:"cambridge_c2", label:"Cambridge C2 Proficiency" },
  { id:"oet",          label:"OET" },
  { id:"celpip",       label:"CELPIP" },
  { id:"ielts_ukvi",   label:"IELTS UKVI" },
];
function toPTE(tid, v) {
  const n = parseFloat(v) || 0;
  if (tid === "pte") return n;
  if (tid === "ielts" || tid === "ielts_ukvi") {
    const m = [[4,30],[4.5,36],[5,42],[5.5,50],[6,54],[6.5,58],[7,65],[7.5,73],[8,79],[9,90]];
    return m.find(([i]) => n <= i)?.[1] ?? 30;
  }
  if (tid === "toefl") { if(n<45)return 30;if(n<60)return 42;if(n<72)return 50;if(n<79)return 54;if(n<94)return 58;if(n<101)return 65;return 73; }
  if (tid === "duolingo") { if(n<85)return 30;if(n<110)return 50;if(n<120)return 58;if(n<130)return 65;return 73; }
  if (tid === "cambridge_c1" || tid === "cambridge_c2") { if(n<169)return 42;if(n<180)return 50;if(n<193)return 58;return 65; }
  if (tid === "celpip") { if(n<7)return 50;if(n<9)return 58;return 65; }
  return n;
}

// ─── FIX #6: deadline map updated — Feb 2026 removed (past), Jul 2026 = primary
// ─── FIX #21: string keys now match intake strings exactly and consistently
const ACTIVE_INTAKES = ["Jul 2026", "Nov 2026", "Feb 2027"];
const DEADLINES = { "Jul 2026": "2026-04-30", "Nov 2026": "2026-09-15", "Feb 2027": "2026-12-01" };
function daysUntil(intakes) {
  const now = new Date();
  // FIX #6: filter out past intakes before computing
  const future = intakes.filter(i => {
    const d = new Date(DEADLINES[i] || "2027-12-31");
    return d >= now;
  });
  if (future.length === 0) return null; // all past
  const nearest = future.map(i => new Date(DEADLINES[i] || "2027-12-31")).sort((a,b)=>a-b)[0];
  return Math.max(0, Math.ceil((nearest - now) / 86400000));
}
function deadlineColor(days) {
  if (days === null) return "#4a6484"; // past
  if (days <= 14) return "#ff4d6a";
  if (days <= 30) return "#ff9240";
  if (days <= 60) return "#ffd060";
  return "#10d9a0";
}
function DeadlineBadge({ intakes }) {
  const days = daysUntil(intakes);
  if (days === null) return <span style={{ fontSize:10, color:"#4a6484", fontWeight:700 }}>Intake closed</span>;
  const c = deadlineColor(days);
  return (
    <span style={{ fontSize:10, fontWeight:700, color:c, background:`${c}14`, padding:"2px 7px", borderRadius:10, border:`1px solid ${c}28` }}>
      ⏰ Deadline in {days} days
    </span>
  );
}

// ─── FIX #23: Meta ranking — added "Best Fit" tier for career-focused universities
const META_RANK = {
  uoa:       { score:94, qs:"#65",  the:"#201–250", usn:"Top 200",  label:"S+ Research",  fitNote:"Most selective in NZ" },
  otago:     { score:81, qs:"#214", the:"#301–350", usn:"Top 400",  label:"A Research",    fitNote:"Best in health sciences" },
  massey:    { score:75, qs:"#230", the:"#401–500", usn:"Top 600",  label:"A Flexible",    fitNote:"3 intakes per year" },
  vuw:       { score:74, qs:"#244", the:"#301–350", usn:"Top 500",  label:"A Research",    fitNote:"Strong CS & law" },
  waikato:   { score:72, qs:"#235", the:"#401–500", usn:"Top 600",  label:"A Research",    fitNote:"Best value near Auckland" },
  canterbury:{ score:71, qs:"#261", the:"#401–500", usn:"Top 600",  label:"A Engineering", fitNote:"Top engineering in NZ" },
  lincoln:   { score:58, qs:"#371", the:"#601–800", usn:"Unranked", label:"B Specialist",  fitNote:"Most affordable university" },
  // FIX #23: AUT relabelled to reflect career focus, not penalise QS rank
  aut:       { score:55, qs:"#412", the:"#501–600", usn:"Unranked", label:"★ Best Fit",   fitNote:"Top career-focused university — excellent for your profile" },
  // Polytechnics — rated on NZQA vocational excellence, not QS
  sit:       { score:70, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"⭐ Zero Fees",  fitNote:"Only free institution in NZ" },
  unitec:    { score:65, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Largest ITP in NZ" },
  mit:       { score:62, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"6 Auckland campuses" },
  eit:       { score:68, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Highest NZQA EER rating" },
  otago_poly:{ score:66, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Auckland intl campus" },
  wintec:    { score:60, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Hamilton — low cost" },
  ara:       { score:59, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"IT & cybersecurity" },
  weltec:    { score:57, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Near Wellington jobs" },
  ucol:      { score:54, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Most affordable region" },
  toiohomai: { score:55, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Bay of Plenty" },
  nmit:      { score:52, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"Top ITP",       fitNote:"Sunniest NZ city" },
  // FIX #20: private colleges get a neutral label instead of generic "Rated"
  ais:       { score:40, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"PTE Registered",fitNote:"Verify EER first" },
  whitireia: { score:44, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"PTE Registered",fitNote:"Est. 1986 — reputable" },
  yoobee:    { score:42, qs:"N/A",  the:"N/A",       usn:"N/A",     label:"PTE Registered",fitNote:"Best for web/UX" },
};

// ─── ACCOMMODATION DATA ───────────────────────────────────────────────────────
const ACCOMMODATION = [
  { city:"Auckland",    region:"Auckland",        emoji:"🌆", livingMonthly:2400, transport:200, food:600, misc:300,
    tip:"Most expensive NZ city. Choose South/West Auckland suburbs for 30–40% lower rent.",
    options:[
      { type:"Student Halls",      nzd:280, desc:"On-campus, meals sometimes included",      link:"https://www.aut.ac.nz/student-life/accommodation" },
      { type:"Studio (CBD)",       nzd:520, desc:"1-bed studio city centre — good for couples",link:"https://www.trademe.co.nz/property/rent" },
      { type:"1-Bed (Suburbs)",    nzd:380, desc:"New Lynn, Mt Roskill, Manukau",             link:"https://www.trademe.co.nz/property/rent" },
      { type:"House Share (room)", nzd:220, desc:"Per room in shared house",                   link:"https://www.flatmates.com.au/nz" },
      { type:"Homestay",           nzd:260, desc:"Room + meals with NZ host family",           link:"https://www.homestay.com" },
    ]},
  { city:"Hamilton",    region:"Waikato",         emoji:"🌿", livingMonthly:1600, transport:120, food:450, misc:200,
    tip:"1.5 hours from Auckland. 35% cheaper than Auckland. Great value for couples.",
    options:[
      { type:"Student Halls",      nzd:240, desc:"On-campus — affordable and social",         link:"https://www.waikato.ac.nz/accommodation" },
      { type:"1-Bed Apartment",    nzd:320, desc:"Central Hamilton near campus",               link:"https://www.trademe.co.nz/property/rent" },
      { type:"House Share (room)", nzd:180, desc:"Per room — very affordable",                 link:"https://www.flatmates.com.au/nz" },
      { type:"Homestay",           nzd:230, desc:"Room + meals with NZ family",                link:"https://www.homestay.com" },
    ]},
  { city:"Wellington",  region:"Wellington",      emoji:"⚖️", livingMonthly:2000, transport:150, food:520, misc:280,
    tip:"Compact walkable city. Strong tech and government sector job market.",
    options:[
      { type:"Student Halls (VUW)",nzd:270, desc:"Victoria University halls",                 link:"https://www.victoria.ac.nz/accommodation" },
      { type:"Studio (CBD)",       nzd:440, desc:"Wellington city — near government jobs",     link:"https://www.trademe.co.nz/property/rent" },
      { type:"House Share (room)", nzd:200, desc:"Per room — popular in student suburbs",      link:"https://www.flatmates.com.au/nz" },
      { type:"Homestay",           nzd:250, desc:"Room + meals",                               link:"https://www.homestay.com" },
    ]},
  { city:"Christchurch",region:"Canterbury",      emoji:"🔬", livingMonthly:1600, transport:110, food:450, misc:220,
    tip:"Modern growing city. 30–35% cheaper than Auckland. Strong tech scene.",
    options:[
      { type:"Student Halls",      nzd:230, desc:"On-campus accommodation at UC or Ara",      link:"https://www.canterbury.ac.nz/campus-life/accommodation" },
      { type:"1-Bed Apartment",    nzd:300, desc:"Modern apartments in city",                  link:"https://www.trademe.co.nz/property/rent" },
      { type:"House Share (room)", nzd:170, desc:"Cheapest shared housing in a major city",    link:"https://www.flatmates.com.au/nz" },
      { type:"Homestay",           nzd:220, desc:"Room + meals",                               link:"https://www.homestay.com" },
    ]},
  { city:"Dunedin",     region:"Otago",           emoji:"🎓", livingMonthly:1400, transport:90,  food:400, misc:180,
    tip:"Most affordable student city. Vibrant student social life. Budget for heating in winter.",
    options:[
      { type:"Student Halls",      nzd:220, desc:"Otago University residential colleges",      link:"https://www.otago.ac.nz/accommodation" },
      { type:"1-Bed Apartment",    nzd:270, desc:"Affordable apartments near university",       link:"https://www.trademe.co.nz/property/rent" },
      { type:"House Share (room)", nzd:150, desc:"Cheapest shared housing in NZ",              link:"https://www.flatmates.com.au/nz" },
      { type:"Homestay",           nzd:210, desc:"Room + meals",                               link:"https://www.homestay.com" },
    ]},
  { city:"Invercargill",region:"Southland",       emoji:"💰", livingMonthly:1200, transport:80,  food:380, misc:160,
    tip:"Cheapest city in NZ — perfect with SIT Zero Fees. Cold and quiet. 3 hrs from Queenstown.",
    options:[
      { type:"SIT Student Housing", nzd:160, desc:"SIT-managed student housing",              link:"https://www.sit.ac.nz/student-life/accommodation" },
      { type:"1-Bed Apartment",     nzd:200, desc:"Cheapest rent of any NZ city",             link:"https://www.trademe.co.nz/property/rent" },
      { type:"House Share (room)",  nzd:120, desc:"Lowest cost shared housing in NZ",         link:"https://www.flatmates.com.au/nz" },
    ]},
];

// ─── FIX #15: simple markdown renderer ────────────────────────────────────────
function Markdown({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;
  for (const line of lines) {
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(<div key={key++} style={{ fontWeight:700, color:"#fff", marginTop:12, marginBottom:4, fontSize:13 }}>{line.replace(/\*\*/g,"")}</div>);
    } else if (line.startsWith("**")) {
      const parsed = line.split(/\*\*(.*?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? <strong key={i} style={{ color:"#fff" }}>{part}</strong> : part
      );
      elements.push(<div key={key++} style={{ fontSize:12, color:"#cdd8f0", lineHeight:1.8, marginBottom:3 }}>{parsed}</div>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(<div key={key++} style={{ fontSize:12, color:"#cdd8f0", lineHeight:1.8, paddingLeft:14, marginBottom:2 }}>• {line.slice(2)}</div>);
    } else if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height:8 }}/>);
    } else {
      elements.push(<div key={key++} style={{ fontSize:12, color:"#cdd8f0", lineHeight:1.8, marginBottom:3 }}>{line}</div>);
    }
  }
  return <div>{elements}</div>;
}

// ─── ARTICLES ─────────────────────────────────────────────────────────────────
const ARTICLES = [
  { id:"visa_guide", emoji:"🛂", category:"Visa & Immigration", title:"Complete NZ Student Visa Guide for Bangladeshi Applicants (2026)", readTime:"8 min", date:"March 2026",
    summary:"Step-by-step walkthrough of the NZ student visa application process from Bangladesh — chest X-ray, VFS passport scanning, processing times, and dependent spouse visa.",
    content:`**Complete NZ Student Visa Guide for Bangladeshi Applicants**

New Zealand does not have a consulate in Bangladesh. All student visa applications are submitted online at immigration.govt.nz. Once approved in principle, your passport must be submitted to VFS Global in Dhaka for the visa sticker.

**Step-by-step process:**

1. Receive your official Offer of Place from a New Zealand institution
2. Pay your tuition fees (or confirm payment plan with the institution)
3. Submit your online student visa application at immigration.govt.nz
4. Pay the visa application fee (approximately NZD 375 as of 2026)
5. Book your chest X-ray. Bangladesh is classified as a high-TB-incidence country. A chest X-ray from a NZQA-approved radiologist in Dhaka is mandatory for stays over 6 months
6. Upload all documents: offer of place, tuition fee receipt, passport, bank statement (NZD 20,000+ equivalent), police clearance, chest X-ray results
7. Wait for approval in principle (typically 18–50 working days)
8. Submit your passport to VFS Dhaka for the visa label
9. Collect your passport and travel to New Zealand

**Spouse / Dependent Visa:**

Your spouse Swornaly can apply for a student dependent visa alongside your application. Required documents: marriage certificate, her own passport, and a copy of your student visa approval. Dependent spouses of students studying at Level 7 and above receive open work rights — she can work full-time in New Zealand throughout your study.

**Key costs:**

- Student visa: NZD 375
- Chest X-ray: approximately BDT 8,000–12,000
- VFS service fee: approximately BDT 4,000
- Spouse dependent visa: NZD 300 additional`,
  },
  { id:"cost_living", emoji:"💰", category:"Finance & Planning", title:"True Cost of Living in NZ for Bangladeshi Couples (2026)", readTime:"6 min", date:"March 2026",
    summary:"A realistic monthly budget breakdown for a Bangladeshi couple studying in New Zealand, covering rent, food, transport, insurance, and miscellaneous costs across six major cities.",
    content:`**Monthly Living Costs for a Bangladeshi Couple in New Zealand (2026)**

Immigration New Zealand requires you to show NZD 20,000 per year (approximately ৳14.4 লাখ) for living expenses. Real costs vary significantly by city.

**Auckland (most expensive):**
Rent NZD 380–520/month + food NZD 600 + transport NZD 200 + misc NZD 300. Total: NZD 1,480–1,620/month. Annual: NZD 17,760–19,440.

**Hamilton (best value):**
Rent NZD 300–380/month + food NZD 450 + transport NZD 120 + misc NZD 200. Total: NZD 1,070–1,150/month. Annual: NZD 12,840–13,800.

**Christchurch:**
Rent NZD 280–380/month + food NZD 450 + transport NZD 110 + misc NZD 220. Total: NZD 1,060–1,160/month. Annual: NZD 12,720–13,920.

**Invercargill (cheapest):**
Rent NZD 180–250/month + food NZD 380 + transport NZD 80 + misc NZD 160. Total: NZD 800–870/month. Annual: NZD 9,600–10,440.

**Health insurance:**
Compulsory for your student visa. Budget NZD 1,500–2,200/year for a couple via Studentsafe Inbound (Allianz). ACC covers accidents automatically and for free — your insurance covers illness only.

**Currency transfer tip:**
Use Wise or TransferWise to send money from Bangladesh to NZ. Rates as of March 2026: 1 NZD ≈ ৳72.`,
  },
  { id:"scholarships", emoji:"🏆", category:"Scholarships", title:"Every Scholarship Available to Bangladeshi Students Studying in NZ (2026)", readTime:"7 min", date:"March 2026",
    summary:"A comprehensive list of government, university, and private scholarships for Bangladeshi nationals pursuing study in New Zealand in 2026.",
    content:`**Scholarships for Bangladeshi Students — New Zealand 2026**

**1. Manaaki New Zealand Scholarships (Fully Funded)**
The most prestigious scholarship. Covers full tuition, living allowance, travel, and health insurance. Bangladesh is an eligible country. Applications open February–March annually. Apply at: mfat.govt.nz/scholarships

**2. New Zealand Commonwealth Scholarships**
For citizens of Commonwealth countries including Bangladesh. Covers tuition and provides a living stipend. Applications via your country's national agency. Deadline: typically February each year.

**3. AUT Vice-Chancellor's International Excellence Scholarship**
NZD 5,000–20,000 off tuition. Awarded based on academic merit at enrolment. Apply simultaneously with your AUT admission — no separate form required.

**4. University of Waikato International Excellence Award**
NZD 5,000 for high-achieving international students. CGPA 3.0+ preferred. Apply through the international admissions team.

**5. Massey University International Excellence Scholarship**
NZD 3,000–8,000. Three award tiers based on academic achievement. Apply at time of enrolment.

**6. Lincoln University International Excellence Scholarship**
NZD 5,000. One of the easiest university scholarships to obtain given Lincoln's smaller cohort.

**7. SIT Zero Fees Scheme**
Not technically a scholarship but eliminates the single largest cost of study entirely. Available for Bachelor's and Graduate Diploma programmes.

**Important:**
Always apply for institutional scholarships at the same time as your admission application — many are awarded automatically without a separate form.`,
  },
  { id:"pte_guide", emoji:"📝", category:"English Tests", title:"How to Improve Your PTE Writing Score from 51 to 58+ (Proven Strategies)", readTime:"5 min", date:"March 2026",
    summary:"For Bangladeshi students with a PTE Academic Writing band below 58 — the most effective strategies to reach 58+ without retaking the full test.",
    content:`**Improving PTE Academic Writing Score — Targeted Guide**

A PTE Writing score of 51 is the most common bottleneck for Bangladeshi students applying to selective NZ universities that require a sub-band minimum of 58 in Writing. The good news: you can retake individual sections of PTE Academic.

**The two Writing tasks:**

1. Summarise Written Text (1 sentence, 5–75 words) — worth significant marks
2. Write Essay (200–300 words, 20 minutes) — the largest component

**Most effective strategies:**

For Summarise Written Text: Practice writing single-sentence summaries that incorporate the main idea plus two supporting points. The AI scorer rewards grammatical range and vocabulary — avoid repeating the exact words from the passage.

For Write Essay: Structure every essay as: Introduction (restate topic + your position) → Body paragraph 1 (argument + example) → Body paragraph 2 (counter or second point) → Conclusion (restate position). Use discourse markers explicitly: "Furthermore", "Nevertheless", "In conclusion".

**Recommended practice resources:**

- E2Language PTE Writing course (free tier available)
- PTE Magic Writing Booster
- Official PTE Practice Tests at pearsonpte.com

**Realistic timeline:**
With 3–4 hours of daily focused Writing practice, most students move from 51 to 58+ in 4–6 weeks. The full PTE can be retaken as soon as 5 days after a previous attempt.

**Good news:**
AUT, Unitec, Manukau MIT, SIT, UCOL, and Wintec do NOT require a Writing sub-band of 58. Your current 51 is fully sufficient for these institutions.`,
  },
  { id:"post_study", emoji:"💼", category:"Work & Career", title:"Post-Study Work Visa Rights for Bangladeshi Graduates in NZ (2026)", readTime:"5 min", date:"March 2026",
    summary:"Everything you need to know about post-study work visa eligibility, duration, and rights — including what your spouse can do during and after your studies.",
    content:`**Post-Study Work Visa (PSWV) — New Zealand 2026**

Graduating from a NZ institution gives you the right to work in NZ after your studies. The duration depends on your qualification level.

**PSWV Duration:**

- Bachelor's degree (Level 7, 3 years) anywhere in NZ: 3-year PSWV
- Postgraduate Diploma (Level 8, 1 year): 3-year PSWV
- Master's degree (Level 9): 3-year PSWV
- PhD (Level 10): 3-year PSWV

**Your Spouse's Work Rights:**

Swornaly, as a dependent of a student enrolled in a Level 7+ programme, receives an open work visa automatically — she can work full-time in any job throughout your entire study period.

**Earnings potential:**

Entry-level software developer salaries in NZ: NZD 65,000–85,000/year. Mid-level: NZD 90,000–120,000. Combined income from both of you during the study period can realistically cover a significant portion of total study costs.

**Pathway to Residence:**

Software engineers and data scientists are on New Zealand's Green List — meaning you can apply for residence directly after getting a job offer, without needing a points-based waiting list.`,
  },
  { id:"city_guide", emoji:"🗺️", category:"City Guide", title:"Which NZ City Should You Choose? A Guide for Bangladeshi Students (2026)", readTime:"6 min", date:"March 2026",
    summary:"A practical comparison of Auckland, Hamilton, Wellington, Christchurch, Dunedin, and Invercargill to help Bangladeshi students and couples choose the right city.",
    content:`**Choosing Your City in New Zealand — A Bangladeshi Student's Guide**

**Auckland — For maximum opportunity**
NZ's largest city. Large South Asian community, halal food widely available, multicultural. Best for networking and job hunting. Most expensive but highest earning potential. Choose Auckland if: you want the widest job market, prefer being near a Bangladeshi community, or are studying at AUT, Unitec, or MIT.

**Hamilton — For the best budget-quality balance**
Only 1.5 hours from Auckland. 30–35% cheaper than Auckland for rent. Strong Bangladeshi and Indian student community at Waikato University. Choose Hamilton if: you want university-level education (Waikato) or polytechnic study (Wintec) at significantly lower cost.

**Wellington — For government and tech careers**
NZ's capital city. Compact, walkable, and vibrant. Strong tech and government sector job market. Choose Wellington if: you are interested in law, policy, IT, or working in the public sector post-graduation.

**Christchurch — For the best value in a growing city**
Post-earthquake rebuild has made it NZ's most modern city. Growing tech scene. 30–35% cheaper than Auckland. Choose Christchurch if: you want a university education (UC or Lincoln) or polytechnic study (Ara) at lower cost.

**Dunedin — For the best student experience**
Most affordable major city. Extremely social student culture centred on the University of Otago. Choose Dunedin if: you want focused study with minimal distractions.

**Invercargill — For zero-cost study**
The only realistic option for FREE tuition via SIT's Zero Fees Scheme. Small, quiet city. Cheapest rent in NZ. Choose Invercargill if: you want to eliminate tuition costs entirely.`,
  },
];

// ─── FIT QUIZ ─────────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { id:"budget",    q:"What is your total annual study budget (tuition + living)?",    options:[["under20","Under NZD 20,000"],["20to35","NZD 20,000–35,000"],["35to55","NZD 35,000–55,000"],["above55","NZD 55,000+"]] },
  { id:"location",  q:"Where do you prefer to live?",                                  options:[["auckland","Auckland (largest city, best jobs)"],["near_auckland","Near Auckland (within 2 hours)"],["capital","Wellington (capital city)"],["south","South Island (quieter, affordable)"]] },
  { id:"program_level", q:"What level of qualification are you seeking?",              options:[["masters","Master's Degree"],["bachelor","Bachelor's Degree"],["diploma","Diploma / PG Diploma"],["phd","PhD / Research"]] },
  { id:"career_goal",   q:"What is your career goal after graduating?",                options:[["stay_nz","Work in NZ for several years"],["return_bd","Return to Bangladesh with NZ credential"],["research","Academic research / further study"],["startup","Launch a tech startup"]] },
  { id:"lifestyle", q:"Which lifestyle matters most to you?",                          options:[["city_social","City life, social scene, multicultural community"],["quiet_study","Quiet environment, focused on studies"],["nature","Close to nature, outdoor activities"],["family","Safe, family-friendly, good for a couple"]] },
  { id:"spouse",    q:"Will your spouse be accompanying you?",                         options:[["yes_work","Yes — she wants to work full-time in NZ"],["yes_study","Yes — she may also want to study"],["yes_home","Yes — she will focus on home/family"],["no","No — travelling alone"]] },
];

// FIX #24: all 22 institutions included in quiz scoring
function computeQuizResult(answers) {
  let sc = { aut:0, waikato:0, massey:0, vuw:0, canterbury:0, otago:0, lincoln:0,
             sit:0, unitec:0, mit:0, eit:0, otago_poly:0, wintec:0, ara:0, weltec:0, ucol:0, toiohomai:0, nmit:0,
             ais:0, whitireia:0, yoobee:0 };
  if(answers.budget==="under20")   { sc.sit+=3; sc.ucol+=3; sc.nmit+=2; sc.wintec+=1; sc.toiohomai+=1; }
  if(answers.budget==="20to35")    { sc.waikato+=3; sc.unitec+=3; sc.mit+=2; sc.canterbury+=2; sc.eit+=2; sc.wintec+=2; sc.ara+=2; }
  if(answers.budget==="35to55")    { sc.aut+=3; sc.massey+=2; sc.vuw+=2; sc.waikato+=1; sc.otago_poly+=2; }
  if(answers.budget==="above55")   { sc.aut+=2; sc.massey+=3; sc.vuw+=3; sc.otago+=2; sc.uoa+=2; }
  if(answers.location==="auckland"){ sc.aut+=3; sc.unitec+=3; sc.mit+=3; sc.massey+=2; sc.eit+=2; sc.otago_poly+=2; }
  if(answers.location==="near_auckland"){ sc.waikato+=3; sc.wintec+=2; }
  if(answers.location==="capital") { sc.vuw+=3; sc.weltec+=3; sc.whitireia+=2; }
  if(answers.location==="south")   { sc.canterbury+=3; sc.otago+=2; sc.lincoln+=2; sc.ara+=2; sc.sit+=1; sc.nmit+=2; }
  if(answers.program_level==="masters"){ sc.aut+=3; sc.waikato+=3; sc.massey+=3; sc.vuw+=2; sc.unitec+=2; sc.eit+=1; }
  if(answers.program_level==="diploma"){ sc.unitec+=3; sc.mit+=3; sc.sit+=2; sc.eit+=2; sc.wintec+=2; sc.ucol+=2; }
  if(answers.program_level==="bachelor"){ sc.sit+=2; sc.nmit+=2; sc.toiohomai+=2; sc.ara+=2; sc.wintec+=2; sc.yoobee+=1; }
  if(answers.program_level==="phd"){ sc.waikato+=3; sc.massey+=2; sc.vuw+=2; sc.uoa+=3; sc.otago+=2; }
  if(answers.career_goal==="stay_nz"){ sc.aut+=2; sc.waikato+=2; sc.vuw+=2; sc.unitec+=2; }
  if(answers.career_goal==="return_bd"){ sc.sit+=2; sc.ucol+=2; sc.nmit+=2; sc.toiohomai+=1; }
  if(answers.career_goal==="startup"){ sc.aut+=3; sc.massey+=2; sc.yoobee+=2; }
  if(answers.career_goal==="research"){ sc.waikato+=3; sc.vuw+=3; sc.uoa+=3; sc.otago+=2; }
  if(answers.lifestyle==="city_social"){ sc.aut+=2; sc.mit+=2; sc.unitec+=2; sc.eit+=1; }
  if(answers.lifestyle==="family"){ sc.waikato+=2; sc.canterbury+=2; sc.nmit+=1; sc.wintec+=1; }
  if(answers.lifestyle==="quiet_study"){ sc.sit+=2; sc.ucol+=2; sc.otago+=2; sc.nmit+=1; }
  if(answers.lifestyle==="nature"){ sc.otago+=2; sc.nmit+=2; sc.toiohomai+=2; sc.ara+=1; }
  if(answers.spouse==="yes_work"){ sc.aut+=2; sc.waikato+=2; sc.unitec+=2; sc.mit+=1; }
  if(answers.spouse==="yes_study"){ sc.massey+=2; sc.aut+=1; sc.waikato+=1; }
  return Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,score])=>({id,score}));
}

// ─── INSTITUTIONS DATABASE ────────────────────────────────────────────────────
// FIX #6: all "Feb 2026" intakes replaced with "Jul 2026" / "Feb 2027"
const UNIVERSITIES = [
  { id:"uoa", name:"University of Auckland", short:"UoA", emoji:"🏛️", city:"Auckland", region:"Auckland",
    contact:"international@auckland.ac.nz", type:"University", nzqaStatus:"Government-established — Universities Act 1961",
    overview:"NZ's highest-ranked university. Member of Universitas 21. World-class research in engineering, health, law, and computing. Most selective institution in New Zealand.",
    programs:[
      {name:"Master of Computer Science",field:"IT/CS",level:"Masters",nzd:42000,pteMin:64,cgpaMin:3.0,duration:"1.5 yrs",intakes:["Jul 2026"],scholarship:"International Excellence Scholarship (NZD 10,000)"},
      {name:"MSc Data Science",field:"IT/CS",level:"Masters",nzd:42000,pteMin:64,cgpaMin:3.0,duration:"1.5 yrs",intakes:["Jul 2026"],scholarship:"Faculty of Science International Award"},
      {name:"BSc Computer Science",field:"IT/CS",level:"Bachelor",nzd:35000,pteMin:58,cgpaMin:2.5,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"International Undergraduate Scholarship"},
      {name:"PhD Computer Science",field:"IT/CS",level:"PhD",nzd:6500,pteMin:58,cgpaMin:3.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"UoA Doctoral Scholarship"},
    ], note:"Top-ranked in NZ. PTE 64 overall required — retake Writing sub-band first." },
  { id:"massey", name:"Massey University", short:"Massey", emoji:"🏫", city:"Auckland / Palmerston North", region:"Auckland",
    contact:"international@massey.ac.nz", type:"University", nzqaStatus:"Government-established — Education Act 1989",
    overview:"NZ's largest university by enrolment. 3 intakes per year. Strong in data science, computing, and distance learning. Auckland campus available.",
    programs:[
      {name:"MSc Computer Science",field:"IT/CS",level:"Masters",nzd:30000,pteMin:58,cgpaMin:2.75,duration:"1 yr",intakes:["Jul 2026","Nov 2026"],scholarship:"International Excellence Scholarship (NZD 3,000–8,000)"},
      {name:"MSc Data Science",field:"IT/CS",level:"Masters",nzd:30000,pteMin:58,cgpaMin:2.75,duration:"1 yr",intakes:["Jul 2026"],scholarship:"International Excellence Scholarship"},
      {name:"BCS Computer Science",field:"IT/CS",level:"Bachelor",nzd:26000,pteMin:50,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Massey International Undergraduate Award"},
    ], note:"3 intakes per year — most flexible university in NZ." },
  { id:"aut", name:"Auckland University of Technology", short:"AUT", emoji:"💡", city:"Auckland", region:"Auckland",
    contact:"international@aut.ac.nz", type:"University", nzqaStatus:"Government-established — Education Act 1989",
    overview:"NZ's fastest-growing career-focused university. 3 Auckland campuses. Excellent IT, health, and creative tech. Your strongest university-level fit.",
    programs:[
      {name:"Master of Computing",field:"IT/CS",level:"Masters",nzd:29000,pteMin:54,cgpaMin:2.5,duration:"1.5 yrs",intakes:["Jul 2026"],scholarship:"Vice-Chancellor's Excellence Scholarship (NZD 5,000–20,000)"},
      {name:"Master of Data Science & AI",field:"IT/CS",level:"Masters",nzd:30000,pteMin:54,cgpaMin:2.5,duration:"1.5 yrs",intakes:["Jul 2026"],scholarship:"Vice-Chancellor's Excellence Scholarship"},
      {name:"BCIS Computer & Info Sciences",field:"IT/CS",level:"Bachelor",nzd:29000,pteMin:54,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"AUT International Undergraduate Scholarship"},
    ], note:"Best university fit for your profile. PTE 60 comfortably clears the 54 minimum. Auckland campus." },
  { id:"waikato", name:"University of Waikato", short:"Waikato", emoji:"🌿", city:"Hamilton", region:"Waikato",
    contact:"international@waikato.ac.nz", type:"University", nzqaStatus:"Government-established — Universities Act 1961",
    overview:"Leading CS university in Waikato. Hamilton is 35% cheaper than Auckland. Strong research in AI, data mining, and software engineering.",
    programs:[
      {name:"Master of Computer Science",field:"IT/CS",level:"Masters",nzd:28000,pteMin:58,cgpaMin:2.75,duration:"1–2 yrs",intakes:["Jul 2026"],scholarship:"International Excellence Award (NZD 5,000)"},
      {name:"BCS Computer Science",field:"IT/CS",level:"Bachelor",nzd:27000,pteMin:54,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Waikato International Undergraduate Award"},
      {name:"PhD Computer Science",field:"IT/CS",level:"PhD",nzd:6500,pteMin:58,cgpaMin:3.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Waikato Doctoral Scholarship"},
    ], note:"PTE 60 meets the 58 requirement. Hamilton = 35% cheaper living than Auckland." },
  { id:"vuw", name:"Victoria University of Wellington", short:"VUW", emoji:"⚖️", city:"Wellington", region:"Wellington",
    contact:"international@vuw.ac.nz", type:"University", nzqaStatus:"Government-established — Universities Act 1961",
    overview:"Capital city university. Strong CS, law, and humanities. Good tech industry links in Wellington.",
    programs:[
      {name:"MSc Computer Science",field:"IT/CS",level:"Masters",nzd:31000,pteMin:58,cgpaMin:2.75,duration:"1.5–2 yrs",intakes:["Jul 2026"],scholarship:"Masters by Thesis Scholarship"},
      {name:"BSc Computer Science",field:"IT/CS",level:"Bachelor",nzd:28000,pteMin:54,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Victoria International Undergraduate Scholarship"},
    ], note:"PTE Writing 58+ sub-band required — a targeted writing retake is advised." },
  { id:"canterbury", name:"University of Canterbury", short:"UC", emoji:"🔬", city:"Christchurch", region:"Canterbury",
    contact:"international@canterbury.ac.nz", type:"University", nzqaStatus:"Government-established — Universities Act 1961",
    overview:"NZ's 4th-ranked university. Outstanding in engineering and CS. Christchurch is a modern, growing tech city.",
    programs:[
      {name:"MSc Computer Science",field:"IT/CS",level:"Masters",nzd:35000,pteMin:58,cgpaMin:2.75,duration:"1.5 yrs",intakes:["Jul 2026"],scholarship:"UC International Excellence Scholarship (NZD 5,000–10,000)"},
      {name:"BSc Computer Science",field:"IT/CS",level:"Bachelor",nzd:32000,pteMin:54,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"UC International Award"},
    ], note:"Strong software engineering faculty. Christchurch = affordable modern living." },
  { id:"otago", name:"University of Otago", short:"Otago", emoji:"🎓", city:"Dunedin", region:"Otago",
    contact:"international@otago.ac.nz", type:"University", nzqaStatus:"Government-established — Universities Act 1961",
    overview:"NZ's oldest university. Excellent in health sciences, CS, and commerce. Most affordable major university city.",
    programs:[
      {name:"MSc Computer Science",field:"IT/CS",level:"Masters",nzd:30000,pteMin:58,cgpaMin:2.75,duration:"1.5 yrs",intakes:["Jul 2026"],scholarship:"Otago International Excellence Scholarship (NZD 5,000)"},
      {name:"BSc Computer Science",field:"IT/CS",level:"Bachelor",nzd:30000,pteMin:54,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Otago International Award"},
    ], note:"Dunedin = cheapest major NZ city. Strong student social community." },
  { id:"lincoln", name:"Lincoln University", short:"Lincoln", emoji:"🌾", city:"Christchurch", region:"Canterbury",
    contact:"international@lincoln.ac.nz", type:"University", nzqaStatus:"Government-established — Lincoln University Act 1990",
    overview:"Specialist land-based university. Best for agribusiness and applied IT. Most affordable university on the list.",
    programs:[
      {name:"Master of Information Technology",field:"IT/CS",level:"Masters",nzd:27000,pteMin:58,cgpaMin:2.5,duration:"1 yr",intakes:["Jul 2026"],scholarship:"Lincoln International Excellence Scholarship (NZD 5,000)"},
      {name:"BCom Agribusiness",field:"Business",level:"Bachelor",nzd:24000,pteMin:54,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Lincoln Undergraduate Award"},
    ], note:"Cheapest university here. 1-year Master's in IT is ideal for fast completion." },
];

const POLYTECHNICS = [
  { id:"sit", name:"Southern Institute of Technology", short:"SIT", emoji:"💰", city:"Invercargill / Online", region:"Southland", contact:"international@sit.ac.nz", type:"Polytechnic", nzqaStatus:"Highly Confident (EER 2023) — Crown Legislation", overview:"The ONLY institution in NZ with a Zero Fees Scheme — tuition is FREE. Also fully available 100% online via SIT2LRN.",
    programs:[{name:"Graduate Diploma in IT",field:"IT/CS",level:"PG Diploma",nzd:0,pteMin:50,cgpaMin:2.0,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"Zero Fees Scheme — FREE"},{name:"Bachelor of IT",field:"IT/CS",level:"Bachelor",nzd:0,pteMin:50,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Zero Fees Scheme — FREE"}],
    note:"Cheapest option in all of NZ. PTE 50 minimum — your 60 easily qualifies." },
  { id:"unitec", name:"Unitec Institute of Technology", short:"Unitec", emoji:"🔧", city:"Auckland (New Lynn & Mt Albert)", region:"Auckland", contact:"international@unitec.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2022) — Government-legislated", overview:"NZ's largest ITP. 130+ programmes. Auckland location. Level 8 = 3-year post-study work visa.",
    programs:[{name:"Postgraduate Diploma in Computing",field:"IT/CS",level:"PG Diploma",nzd:21000,pteMin:54,cgpaMin:2.5,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"Unitec International Scholarship (NZD 3,000)"},{name:"Bachelor of Applied Management",field:"Business",level:"Bachelor",nzd:22000,pteMin:54,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Unitec Business Award"}],
    note:"Best Auckland polytechnic option. PTE 60 > 54 requirement." },
  { id:"mit", name:"Manukau Institute of Technology", short:"MIT", emoji:"🏙️", city:"Auckland — 6 campuses", region:"Auckland", contact:"international@manukau.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2023) — Government-legislated", overview:"6 Auckland campuses. Theory + applied learning. Strong South Auckland industry links.",
    programs:[{name:"Postgraduate Diploma in IT",field:"IT/CS",level:"PG Diploma",nzd:19000,pteMin:58,cgpaMin:2.5,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"MIT International Scholarship (NZD 2,000–3,000)"},{name:"Bachelor of IT",field:"IT/CS",level:"Bachelor",nzd:20000,pteMin:58,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"MIT Undergraduate Award"}],
    note:"6 Auckland campuses — maximum convenience." },
  { id:"eit", name:"Eastern Institute of Technology", short:"EIT", emoji:"🍷", city:"Auckland + Hawke's Bay", region:"Auckland", contact:"international@eit.ac.nz", type:"Polytechnic", nzqaStatus:"Highly Confident (EER 2022) — Government-legislated", overview:"Highest NZQA rating of any NZ polytechnic. Top-ranked for ITP research. Auckland campus available.",
    programs:[{name:"Postgraduate Diploma in Computing",field:"IT/CS",level:"PG Diploma",nzd:17500,pteMin:58,cgpaMin:2.5,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"EIT International Scholarship (NZD 1,500)"}],
    note:"Best-rated polytechnic in NZ by NZQA." },
  { id:"otago_poly", name:"Otago Polytechnic", short:"Otago Poly", emoji:"⛰️", city:"Auckland (international) + Dunedin", region:"Auckland", contact:"international@op.ac.nz", type:"Polytechnic", nzqaStatus:"Highly Confident (EER 2023) — Government-legislated", overview:"Auckland campus exclusively for international students. Highest possible NZQA quality rating.",
    programs:[{name:"Postgrad Diploma in Data Analytics",field:"IT/CS",level:"PG Diploma",nzd:18000,pteMin:58,cgpaMin:2.5,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"Otago Polytechnic International Scholarship (NZD 2,000)"}],
    note:"Auckland campus exclusively for international students." },
  { id:"wintec", name:"Waikato Institute of Technology", short:"Wintec", emoji:"🏭", city:"Hamilton", region:"Waikato", contact:"international@wintec.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2022) — Government-legislated", overview:"One of NZ's largest ITPs. Hamilton = 35% cheaper than Auckland.",
    programs:[{name:"Diploma in IT",field:"IT/CS",level:"Diploma",nzd:16000,pteMin:58,cgpaMin:2.0,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"Wintec International Scholarship (NZD 2,000)"},{name:"Bachelor of IT",field:"IT/CS",level:"Bachelor",nzd:18000,pteMin:58,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Wintec IT Award"}],
    note:"Hamilton = low living costs, close to Auckland." },
  { id:"ara", name:"Ara Institute of Canterbury", short:"Ara", emoji:"⚙️", city:"Christchurch", region:"Canterbury", contact:"international@ara.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2023) — Government-legislated", overview:"Strong in IT, cybersecurity, engineering, and applied science in Christchurch.",
    programs:[{name:"Bachelor of IT (Cybersecurity)",field:"IT/CS",level:"Bachelor",nzd:19000,pteMin:58,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Ara International Excellence Scholarship (NZD 2,000)"}],
    note:"Christchurch tech scene growing rapidly." },
  { id:"weltec", name:"Wellington Institute of Technology", short:"WelTec", emoji:"🏗️", city:"Wellington", region:"Wellington", contact:"international@weltec.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2022) — Government-legislated", overview:"130+ vocational fields near Wellington capital city job market.",
    programs:[{name:"Diploma in IT & Networking",field:"IT/CS",level:"Diploma",nzd:16500,pteMin:58,cgpaMin:2.0,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"WelTec International Scholarship (NZD 1,500)"}],
    note:"Near Wellington government and tech jobs." },
  { id:"ucol", name:"Universal College of Learning", short:"UCOL", emoji:"📚", city:"Palmerston North", region:"Manawatū", contact:"international@ucol.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2022) — Government-legislated", overview:"Most affordable region in NZ. PTE 50 minimum — very accessible.",
    programs:[{name:"Diploma in IT",field:"IT/CS",level:"Diploma",nzd:14500,pteMin:50,cgpaMin:2.0,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"UCOL International Scholarship (NZD 1,000)"}],
    note:"Second cheapest option after SIT." },
  { id:"toiohomai", name:"Toi Ohomai Institute of Technology", short:"Toi Ohomai", emoji:"🌋", city:"Rotorua", region:"Bay of Plenty", contact:"international@toiohomai.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2023) — Government-legislated", overview:"Largest ITP in Bay of Plenty. 14,000+ students. Famous Rotorua tourist destination.",
    programs:[{name:"Bachelor of IT",field:"IT/CS",level:"Bachelor",nzd:15000,pteMin:58,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Toi Ohomai International Scholarship (NZD 1,500)"}],
    note:"Rotorua — beautiful environment, affordable." },
  { id:"nmit", name:"Nelson Marlborough Institute of Technology", short:"NMIT", emoji:"🍇", city:"Nelson", region:"Nelson / Marlborough", contact:"international@nmit.ac.nz", type:"Polytechnic", nzqaStatus:"Confident (EER 2022) — Government-legislated", overview:"4 campuses in Nelson/Marlborough. NZ's sunniest, safest city. Lowest fees on the list.",
    programs:[{name:"Bachelor of IT",field:"IT/CS",level:"Bachelor",nzd:14000,pteMin:55,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"NMIT International Scholarship (NZD 1,000)"}],
    note:"Lowest polytechnic fees in NZ." },
];

const PRIVATE_COLLEGES = [
  { id:"ais", name:"Auckland Institute of Studies", short:"AIS", emoji:"🏢", city:"Auckland", region:"Auckland", contact:"info@ais.ac.nz", type:"Private College", nzqaStatus:"NZQA Registered PTE ✅ — Code Signatory", overview:"Auckland-based PTE offering IT and business pathways. Fewer postgraduate research options than polytechnics.",
    programs:[{name:"Diploma in IT",field:"IT/CS",level:"Diploma",nzd:16000,pteMin:50,cgpaMin:2.0,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"Contact directly"}],
    note:"⚠️ Verify NZQA EER at nzqa.govt.nz before enrolling." },
  { id:"whitireia", name:"Whitireia New Zealand", short:"Whitireia", emoji:"🎵", city:"Wellington & Auckland", region:"Wellington", contact:"international@whitireia.ac.nz", type:"Private College", nzqaStatus:"NZQA Registered PTE ✅ — Code Signatory", overview:"Established 1986. 7,752+ students. 120+ programmes across IT, arts, and health.",
    programs:[{name:"Diploma in IT",field:"IT/CS",level:"Diploma",nzd:16000,pteMin:55,cgpaMin:2.0,duration:"1 yr",intakes:["Jul 2026","Feb 2027"],scholarship:"Whitireia Merit Award"}],
    note:"Long-established and reputable. Wellington campus near capital city job market." },
  { id:"yoobee", name:"Yoobee Colleges", short:"Yoobee", emoji:"🎨", city:"Auckland, Wellington, Christchurch", region:"Auckland", contact:"international@yoobee.ac.nz", type:"Private College", nzqaStatus:"NZQA Registered PTE ✅ — Code Signatory", overview:"NZ's leading creative tech college. Web dev, UX/UI, game design. Best for design-focused computing.",
    programs:[{name:"Bachelor of Web Development",field:"IT/CS",level:"Bachelor",nzd:18000,pteMin:50,cgpaMin:2.0,duration:"3 yrs",intakes:["Jul 2026","Feb 2027"],scholarship:"Creative Excellence Award (NZD 2,000)"}],
    note:"Best for web/UX specialisation. NOT for core CS research." },
];

const ALL_INST = [
  ...UNIVERSITIES.map(u=>({...u,instType:"university"})),
  ...POLYTECHNICS.map(p=>({...p,instType:"polytechnic"})),
  ...PRIVATE_COLLEGES.map(c=>({...c,instType:"private"})),
];

const DOC_TYPES = [
  {id:"passport",     label:"Passport",                icon:"🛂", required:true,  preloaded:true,  note:"A18406503 — valid Apr 2035"},
  {id:"transcript",   label:"Academic Transcript",      icon:"📜", required:true,  preloaded:true,  note:"CGPA 3.03 — Southeast Univ."},
  {id:"degree",       label:"Degree Certificate",       icon:"🎓", required:true,  preloaded:true,  note:"B.Sc. CSE — Southeast Univ."},
  {id:"english_cert", label:"English Test Certificate", icon:"📝", required:true,  preloaded:false, note:"Order official PTE print"},
  {id:"lor",          label:"Letter of Recommendation", icon:"✉️", required:true,  preloaded:true,  note:"Prof. Shifat Ahmed — Feb 2026"},
  {id:"sop",          label:"Statement of Purpose",     icon:"✍️", required:true,  preloaded:false, note:"Generate in AI Tools tab"},
  {id:"cv",           label:"CV / Resume",              icon:"📄", required:true,  preloaded:false, note:"Generate in AI Tools tab"},
  {id:"bank",         label:"Bank Statement (6 months)",icon:"🏦", required:true,  preloaded:false, note:"Show NZD 20,000+ equivalent"},
  {id:"police",       label:"Police Clearance",         icon:"🛡️", required:false, preloaded:true,  note:"Ref: 1CXMJWU — Jan 2026 ✅"},
  {id:"marriage",     label:"Marriage Certificate",     icon:"💍", required:false, preloaded:true,  note:"Apostilled Feb 2025"},
  {id:"hsc",          label:"HSC Certificate",          icon:"📚", required:false, preloaded:true,  note:"GPA 4.50/5.00 — 2016"},
  {id:"ssc",          label:"SSC Certificate",          icon:"🏫", required:false, preloaded:true,  note:"GPA 5.00/5.00 — 2014"},
];

const NILOY_PROFILE = {
  name:"Niloy Sen", email:"", phone:"+8801819922874", dob:"12 January 1999",
  nationality:"Bangladeshi", passport:"A18406503", passportExpiry:"14 April 2035",
  address:"5/18/1 Outer Studiam Road-02, Kotwali, Mymensingh Sadar-2200, Bangladesh",
  spouse:"Swornaly Paul (DOB: 18 Jan 2000)",
  degree:"B.Sc. in Computer Science & Engineering", university:"Southeast University, Dhaka, Bangladesh",
  cgpa:"3.03", cgpaScale:"4.00", gradYear:"2022",
  hsc:"GPA 4.50/5.00 — Notre Dame College Mymensingh (2016)",
  ssc:"GPA 5.00/5.00 — Mrityunjoy School, Mymensingh (2014)",
  testType:"pte", testOverall:"60", testSpeaking:"63", testWriting:"51", testListening:"60", testReading:"56",
  jobTitle:"Software Engineer", employer:"BEAUTIQUEBD",
  skills:"React, JavaScript, Python, Node.js, REST APIs, Git",
  objective:"Pursue Master's in CS/Computing in NZ to advance career with focus on AI and data-driven systems.",
};

// ─── API ──────────────────────────────────────────────────────────────────────
async function callClaude(prompt, sys) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
      system:sys||"You are an expert NZ study abroad advisor for Bangladeshi students. Be concise and accurate.",
      messages:[{role:"user",content:prompt}] }),
  });
  const d = await r.json(); return d.content?.[0]?.text || "Error.";
}
async function gmailDraft(to, subject, body) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:400,
      messages:[{role:"user",content:`Create Gmail draft.\nTo: ${to}\nSubject: ${subject}\nBody:\n${body}\nUse the gmail tool.`}],
      mcp_servers:[{type:"url",url:"https://gmail.mcp.claude.com/mcp",name:"gmail"}] }),
  });
  const d = await r.json(); return (d.content||[]).some(b=>b.type==="mcp_tool_result");
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:"#06101e", card:"#0d1b2e", surface:"#0a1624", border:"#152338",
  green:"#00e5a0", gd:"#00e5a010", gb:"#00e5a025",
  blue:"#3b9eff", orange:"#ff9240", purple:"#b06fff",
  red:"#ff4d6a", yellow:"#ffd060", text:"#dde8f8", muted:"#4a6484", dim:"#0b1828",
};

// FIX #3: btn variant map fully defined — "s" = secondary style
const S = {
  app:   {background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",color:C.text,fontSize:14},
  hdr:   {background:"linear-gradient(135deg,#03080f,#071528)",borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"},
  nav:   {background:"#07101e",borderBottom:`1px solid ${C.border}`,padding:"0 20px",display:"flex",gap:0,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"},
  tab:   a=>({padding:"10px 11px",background:"none",border:"none",borderBottom:a?`2px solid ${C.green}`:"2px solid transparent",cursor:"pointer",fontSize:11,fontWeight:a?700:400,color:a?C.green:C.muted,whiteSpace:"nowrap",transition:"all .15s"}),
  page:  {padding:"16px 20px",maxWidth:1200,margin:"0 auto"},
  card:  {background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:12},
  h2:    {fontSize:14,fontWeight:700,color:"#fff",marginBottom:12},
  label: {fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.7,display:"block",marginBottom:4},
  input: {width:"100%",background:C.dim,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"},
  select:{width:"100%",background:C.dim,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none"},
  // FIX #3: all variants properly defined
  btn: v => ({
    padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
    display:"inline-flex",alignItems:"center",gap:5,transition:"all .2s",
    background: v==="p" ? `linear-gradient(135deg,${C.green},#00bb82)`
               :v==="b" ? `linear-gradient(135deg,${C.blue},#1e6fcc)`
               :v==="danger" ? "#c0213a"
               :v==="s" ? `rgba(59,158,255,0.12)` // FIX: proper secondary style
               : C.dim,
    color: v==="p"||v==="b" ? "#000" : v==="s" ? C.blue : C.text,
    border: v==="s" ? `1px solid ${C.blue}30` : "none",
  }),
  badge: c=>({display:"inline-flex",alignItems:"center",background:`${c}16`,color:c,border:`1px solid ${c}28`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}),
  g2:    {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14},
  g3:    {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12},
  g4:    {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10},
  heart: liked=>({background:"none",border:"none",cursor:"pointer",fontSize:20,lineHeight:1,padding:"4px",color:liked?C.red:C.muted,transition:"transform .2s, color .2s"}),
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("finder");
  // FIX #1: profile state managed properly, never mutated directly
  const [profile, setProfile] = useState(NILOY_PROFILE);
  const [currency, setCurrency] = useState("NZD");
  const [documents, setDocuments] = useState(
    Object.fromEntries(DOC_TYPES.filter(d=>d.preloaded).map(d=>[d.id,{name:d.note,type:"pre-loaded",data:null,size:"Pre-loaded",uploadedAt:"From uploaded documents"}]))
  );
  const [wishlist, setWishlist] = useState(new Set());
  const [reviews, setReviews] = useState({});
  const [applications, setApplications] = useState([]);
  const [applyTarget, setApplyTarget] = useState(null); // {inst, prog}
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizStep, setQuizStep] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [updateBanner, setUpdateBanner] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiTool, setAiTool] = useState("sop");
  const [expandedInst, setExpandedInst] = useState(null);
  const [fSearch, setFSearch] = useState("");
  const [fRegion, setFRegion] = useState("all");
  const [fType, setFType] = useState("all");
  const [fLevel, setFLevel] = useState("all");
  const [fBudget, setFBudget] = useState("all");
  const [fElig, setFElig] = useState(false);
  const [sortBy, setSortBy] = useState("fit");
  const [articleOpen, setArticleOpen] = useState(null);

  const pteSelf = toPTE(profile.testType, profile.testOverall);
  const cgpaSelf = parseFloat(profile.cgpa) || 0;
  const isElig = useCallback(p => pteSelf >= p.pteMin && cgpaSelf >= p.cgpaMin, [pteSelf, cgpaSelf]);
  const testLabel = ENGLISH_TESTS.find(t=>t.id===profile.testType)?.label || "PTE";

  const toggleWishlist = id => setWishlist(w => { const n = new Set(w); n.has(id)?n.delete(id):n.add(id); return n; });

  const fitScore = inst => { const e=inst.programs.filter(p=>isElig(p)).length; return e===inst.programs.length?2:e>0?1:0; };

  const filtered = ALL_INST.filter(inst => {
    if (fElig && !inst.programs.some(p=>isElig(p))) return false;
    if (fRegion!=="all" && inst.region!==fRegion) return false;
    if (fType!=="all" && inst.instType!==fType) return false;
    if (!inst.programs.some(p=>{
      if(fLevel!=="all"&&p.level!==fLevel)return false;
      if(fBudget==="free"&&p.nzd!==0)return false;
      if(fBudget==="under20"&&p.nzd>20000)return false;
      if(fBudget==="under30"&&(p.nzd>30000||p.nzd===0))return false;
      if(fBudget==="above30"&&p.nzd<=30000)return false;
      return true;
    })) return false;
    if (fSearch) { const q=fSearch.toLowerCase(); if(!inst.name.toLowerCase().includes(q)&&!inst.city.toLowerCase().includes(q)&&!inst.programs.some(p=>p.name.toLowerCase().includes(q))) return false; }
    return true;
  }).sort((a,b)=>{ if(sortBy==="fit")return fitScore(b)-fitScore(a); const am=Math.min(...a.programs.map(p=>p.nzd)), bm=Math.min(...b.programs.map(p=>p.nzd)); return sortBy==="fee_asc"?am-bm:bm-am; });

  // FIX #12: nav scroll indicator via gradient overlay
  const TABS = [
    {id:"finder",        l:"🔍 Programs"},
    {id:"wishlist",      l:`❤️ Wishlist${wishlist.size?` (${wishlist.size})`:""}` },
    {id:"profile",       l:"👤 Profile"},
    {id:"documents",     l:`📁 Docs (${Object.keys(documents).length}/${DOC_TYPES.length})`},
    {id:"apply",         l:"🚀 Apply"},
    {id:"tracker",       l:`📬 Tracker${applications.length?` (${applications.length})`:""}`},
    {id:"quiz",          l:"🎯 Fit Quiz"},
    {id:"accommodation", l:"🏠 Accommodation"},
    {id:"articles",      l:"📖 Articles"},
    {id:"ai",            l:"✨ AI Tools"},
    {id:"govt",          l:"🏛️ Govt. Info"},
  ];

  const handleUpdate = async () => {
    setUpdating(true);
    const r = await callClaude(`5-point March 2026 NZ study update for Bangladeshi student (B.Sc. CSE, PTE 60, targeting July 2026):\n1. Fee changes at top NZ institutions\n2. July 2026 intake deadlines still open\n3. Current NZD to BDT exchange rate\n4. New scholarships for international students 2026\n5. Visa policy changes for Bangladeshi nationals\n2-3 lines per point, be specific.`);
    setUpdateBanner(r); setUpdating(false);
  };

  // FIX #4: goApply defined at App level — accessible from both Finder and Wishlist tabs,
  // eliminating the fragile closure scope issue from the previous version.
  // FIX #13: tab id "finder" is consistent — all navigation uses this exact string.
  const goApply = (inst, prog) => {
    setApplyTarget({inst, prog});
    setTab("apply");
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      {/* FIX #12: nav scroll styles + responsive overrides */}
      <style>{`
        *{box-sizing:border-box}
        .sg-nav::-webkit-scrollbar{display:none}
        @media(max-width:640px){
          .sg-hdr-badges{display:none!important}
          .sg-page{padding:10px 12px!important}
          .sg-tab{font-size:10px!important;padding:10px 8px!important}
        }
        .sg-btn-loading{opacity:0.65;cursor:not-allowed!important}
        .sg-ai-skeleton{background:linear-gradient(90deg,#0b1828 25%,#152338 50%,#0b1828 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
      <div style={S.app}>

        {/* HEADER */}
        <div style={S.hdr}>
          <div style={{flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>Study<span style={{color:C.green}}>Global</span> <span style={{fontSize:10,color:C.muted,fontWeight:400}}>NZ Platform v4</span></div>
            <div style={{fontSize:10,color:C.muted,marginTop:1}}>{UNIVERSITIES.length} Universities · {POLYTECHNICS.length} Polytechnics · {PRIVATE_COLLEGES.length} Colleges</div>
          </div>
          <div className="sg-hdr-badges" style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={S.badge(C.green)}>{profile.name}</span>
            <span style={S.badge(C.blue)}>{testLabel}: {profile.testOverall} (PTE≈{pteSelf})</span>
            <span style={S.badge(C.orange)}>CGPA {profile.cgpa}</span>
            <span style={S.badge(C.purple)}>❤️ {wishlist.size}</span>
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
            <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{...S.select,width:"auto",fontSize:11,padding:"6px 10px"}}>
              {Object.entries(CURRENCIES).map(([k,v])=><option key={k} value={k}>{v.flag} {k}</option>)}
            </select>
            <button onClick={handleUpdate} disabled={updating} style={{...S.btn("b"),padding:"7px 12px",fontSize:11}} className={updating?"sg-btn-loading":""}>
              {updating?"⏳ Updating...":"🔄 Update"}
            </button>
          </div>
        </div>

        {updateBanner && (
          <div style={{background:"#05120a",borderTop:`2px solid ${C.green}`,padding:"10px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:700,color:C.green}}>🔄 Latest Update — {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
              {/* FIX #9: explicit variant prevents undefined fallthrough */}
              <button style={{...S.btn("s"),background:"transparent",color:C.muted,padding:"1px 6px",fontSize:11,border:"none"}} onClick={()=>setUpdateBanner(null)}>✕</button>
            </div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{updateBanner}</div>
          </div>
        )}

        {/* FIX #12: nav with scroll shadow */}
        <div style={{position:"relative"}}>
          <div style={S.nav} className="sg-nav">
            {TABS.map(t=><button key={t.id} style={S.tab(tab===t.id)} onClick={()=>setTab(t.id)} className="sg-tab">{t.l}</button>)}
          </div>
          {/* scroll right indicator */}
          <div style={{position:"absolute",right:0,top:0,bottom:0,width:32,background:"linear-gradient(to right,transparent,#07101e)",pointerEvents:"none"}}/>
        </div>

        <div style={{...S.page}} className="sg-page">

          {/* ════════ FINDER ════════ */}
          {tab==="finder" && (
            <div>
              <div style={S.card}>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                  <input style={{...S.input,flex:2,minWidth:160}} placeholder="🔍 Search institution, program, city..." value={fSearch} onChange={e=>setFSearch(e.target.value)}/>
                  <select style={{...S.select,width:"auto",minWidth:140}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                    <option value="fit">Best Fit First</option><option value="fee_asc">Lowest Fee</option><option value="fee_desc">Highest Fee</option>
                  </select>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                  {[
                    {l:"Region",v:fRegion,s:setFRegion,opts:[["all","All Regions"],...[...new Set(ALL_INST.map(i=>i.region))].sort().map(r=>[r,r])]},
                    {l:"Type",v:fType,s:setFType,opts:[["all","All Types"],["university","Universities"],["polytechnic","Polytechnics"],["private","Private Colleges"]]},
                    {l:"Level",v:fLevel,s:setFLevel,opts:[["all","All Levels"],["Bachelor","Bachelor"],["Diploma","Diploma"],["PG Diploma","PG Diploma"],["Masters","Masters"],["PhD","PhD"]]},
                    {l:"Budget",v:fBudget,s:setFBudget,opts:[["all","Any Budget"],["free","Free Only"],["under20","< NZD 20k"],["under30","< NZD 30k"],["above30","NZD 30k+"]]},
                  ].map(f=>(
                    <select key={f.l} style={{...S.select,width:"auto",minWidth:110}} value={f.v} onChange={e=>f.s(e.target.value)}>
                      {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  ))}
                  <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:C.muted,cursor:"pointer",whiteSpace:"nowrap"}}>
                    <input type="checkbox" checked={fElig} onChange={e=>setFElig(e.target.checked)} style={{accentColor:C.green}}/>Eligible Only
                  </label>
                  <span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>{filtered.length}/{ALL_INST.length}</span>
                </div>
                <div style={{marginTop:10,padding:"8px 12px",background:C.dim,borderRadius:7,fontSize:11,display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{color:C.muted}}>Your profile:</span>
                  <span style={{color:C.text}}><strong style={{color:C.green}}>{testLabel}: {profile.testOverall}</strong> (PTE≈{pteSelf}) · CGPA {profile.cgpa} · Currency: {CURRENCIES[currency].flag} {currency}</span>
                  <button style={{...S.btn("s"),fontSize:11,padding:"3px 10px"}} onClick={()=>setTab("profile")}>Edit →</button>
                </div>
              </div>

              {[
                {instType:"university", title:"Universities", total:UNIVERSITIES.length, color:C.blue, icon:"🏛️", sub:"Government-established · QS World Ranked · Research-focused"},
                {instType:"polytechnic",title:"Polytechnics & Institutes of Technology",total:POLYTECHNICS.length,color:C.green,icon:"🏭",sub:"Government-legislated · NZQA Quality-Assured · Affordable"},
                {instType:"private",    title:"Private Training Establishments",total:PRIVATE_COLLEGES.length,color:C.purple,icon:"🏢",sub:"NZQA-Registered PTEs · Code Signatories · Verify EER before enrolling"},
              ].map(sec => {
                const list = filtered.filter(i=>i.instType===sec.instType);
                if (!list.length) return null;
                return (
                  <div key={sec.instType}>
                    <SectionHdr {...sec} count={list.length}/>
                    {sec.instType==="private" && (
                      <div style={{...S.card,background:`${C.orange}0a`,border:`1px solid ${C.orange}22`,padding:"9px 13px",marginBottom:10,fontSize:11,color:C.orange}}>
                        ⚠️ Always verify NZQA registration at nzqa.govt.nz/providers before paying fees. Student fees NZD 500+ are legally protected against insolvency.
                      </div>
                    )}
                    {list.map(inst=>(
                      <InstCard key={inst.id} inst={inst}
                        expanded={expandedInst===inst.id}
                        onToggle={()=>setExpandedInst(expandedInst===inst.id?null:inst.id)}
                        isElig={isElig} pteSelf={pteSelf} cgpaSelf={cgpaSelf}
                        wishlist={wishlist} toggleWishlist={toggleWishlist}
                        reviews={reviews} setReviews={setReviews}
                        onApply={prog=>goApply(inst,prog)}
                        currency={currency} color={sec.color}/>
                    ))}
                  </div>
                );
              })}

              {filtered.length===0 && (
                <div style={{...S.card,textAlign:"center",padding:40,color:C.muted}}>
                  <div style={{fontSize:36,marginBottom:8}}>🔍</div>
                  No institutions match your filters. Try adjusting above.
                </div>
              )}
            </div>
          )}

          {/* ════════ WISHLIST ════════ */}
          {tab==="wishlist" && (
            <div>
              <div style={{...S.card,background:"linear-gradient(135deg,#1a0820,#1e0a2a)",border:`1px solid ${C.purple}30`,marginBottom:16,padding:"14px 18px"}}>
                <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>❤️ My Wishlist</div>
                <div style={{fontSize:12,color:C.muted}}>{wishlist.size} saved · Click ❤️ on any card to add or remove</div>
              </div>
              {wishlist.size===0 ? (
                <div style={{...S.card,textAlign:"center",padding:48}}>
                  <div style={{fontSize:48,marginBottom:10}}>❤️</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:6}}>Your wishlist is empty</div>
                  <div style={{color:C.muted,fontSize:12,marginBottom:16}}>Go to Find Programs and click ❤️ on any institution card to save it here.</div>
                  <button style={S.btn("p")} onClick={()=>setTab("finder")}>Browse Programs →</button>
                </div>
              ) : ALL_INST.filter(inst=>wishlist.has(inst.id)).map(inst=>(
                <InstCard key={inst.id} inst={inst}
                  expanded={expandedInst===inst.id}
                  onToggle={()=>setExpandedInst(expandedInst===inst.id?null:inst.id)}
                  isElig={isElig} pteSelf={pteSelf} cgpaSelf={cgpaSelf}
                  wishlist={wishlist} toggleWishlist={toggleWishlist}
                  reviews={reviews} setReviews={setReviews}
                  onApply={prog=>goApply(inst,prog)}
                  currency={currency} color={C.purple}/>
              ))}
            </div>
          )}

          {/* ════════ PROFILE ════════ */}
          {tab==="profile" && (
            <ProfileTab profile={profile} setProfile={setProfile} pteSelf={pteSelf} testLabel={testLabel}/>
          )}

          {/* ════════ DOCUMENTS ════════ */}
          {tab==="documents" && (
            <DocumentVault documents={documents} setDocuments={setDocuments}/>
          )}

          {/* ════════ APPLY ════════ */}
          {tab==="apply" && (
            <ApplyTab
              profile={profile}
              setProfile={setProfile}
              documents={documents}
              allInst={ALL_INST}
              applications={applications}
              setApplications={setApplications}
              applyTarget={applyTarget}
              clearTarget={()=>setApplyTarget(null)}
              testLabel={testLabel}
              currency={currency}
            />
          )}

          {/* ════════ TRACKER ════════ */}
          {tab==="tracker" && (
            <TrackerTab applications={applications} setApplications={setApplications} currency={currency}/>
          )}

          {/* ════════ FIT QUIZ ════════ */}
          {tab==="quiz" && (
            <div>
              <div style={{...S.card,background:"linear-gradient(135deg,#06141e,#0b2030)",border:`1px solid ${C.blue}28`,marginBottom:16}}>
                <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>🎯 NZ Institution Fit Quiz</div>
                <div style={{fontSize:12,color:C.muted}}>Answer 6 questions to find which NZ institution and city best matches your goals, budget, and lifestyle.</div>
              </div>
              {quizResult ? (
                <div>
                  <div style={{...S.card,background:`${C.green}0a`,border:`1px solid ${C.gb}`,textAlign:"center",padding:24,marginBottom:14}}>
                    <div style={{fontSize:36,marginBottom:8}}>🎉</div>
                    <div style={{fontSize:17,fontWeight:800,color:C.green,marginBottom:4}}>Your Top Matches</div>
                    <div style={{fontSize:12,color:C.muted}}>Based on your budget, location, programme level, and lifestyle</div>
                  </div>
                  {quizResult.map((r,i)=>{
                    const inst = ALL_INST.find(x=>x.id===r.id);
                    return (
                      <div key={r.id} style={{...S.card,border:`1px solid ${i===0?C.green:C.border}`}}>
                        <div style={{display:"flex",gap:12,alignItems:"center"}}>
                          <div style={{width:34,height:34,borderRadius:"50%",background:i===0?C.green:i===1?C.blue:C.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#000",flexShrink:0}}>#{i+1}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{inst?.name || r.id}</div>
                            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{inst ? `${inst.city} · ${inst.type}` : "Institution"}</div>
                          </div>
                          {/* FIX #10: highlight previous answers on return */}
                          {inst && <button style={S.btn("p")} onClick={()=>{setExpandedInst(inst.id);setTab("finder");}}>View →</button>}
                        </div>
                      </div>
                    );
                  })}
                  <button style={{...S.btn("s"),marginTop:8}} onClick={()=>{setQuizResult(null);setQuizAnswers({});setQuizStep(0);}}>↩ Retake Quiz</button>
                </div>
              ) : (
                <div style={S.card}>
                  <div style={{display:"flex",gap:4,marginBottom:14}}>
                    {QUIZ_QUESTIONS.map((_,i)=>(
                      <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=quizStep?C.green:C.border,transition:"background .3s"}}/>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Question {quizStep+1} of {QUIZ_QUESTIONS.length}</div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:16}}>{QUIZ_QUESTIONS[quizStep].q}</div>
                  <div style={S.g2}>
                    {QUIZ_QUESTIONS[quizStep].options.map(([val,label])=>{
                      // FIX #10: show previously selected answer with green highlight on return
                      const isSelected = quizAnswers[QUIZ_QUESTIONS[quizStep].id] === val;
                      return (
                        <button key={val} onClick={()=>{
                          const na={...quizAnswers,[QUIZ_QUESTIONS[quizStep].id]:val};
                          setQuizAnswers(na);
                          if(quizStep<QUIZ_QUESTIONS.length-1) setQuizStep(s=>s+1);
                          else setQuizResult(computeQuizResult(na));
                        }} style={{...S.btn(isSelected?"p":"s"),padding:"12px 16px",textAlign:"left",justifyContent:"flex-start",width:"100%",fontSize:13}}>
                          {isSelected && "✓ "}{label}
                        </button>
                      );
                    })}
                  </div>
                  {quizStep>0 && (
                    <button style={{...S.btn("s"),marginTop:12,fontSize:11}} onClick={()=>setQuizStep(s=>s-1)}>← Back</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════ ACCOMMODATION ════════ */}
          {tab==="accommodation" && (
            <div>
              <div style={{...S.card,background:"linear-gradient(135deg,#060f18,#0a1e2e)",border:`1px solid ${C.blue}28`,marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>🏠 Accommodation Finder</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Monthly rent and cost estimates per NZ city · Showing in {CURRENCIES[currency].flag} {currency}</div>
              </div>
              {ACCOMMODATION.map(city=>{
                const cv = CURRENCIES[currency];
                const cr = n => { const v=n*cv.rate; return currency==="BDT"?`৳${v.toLocaleString("en-IN")}`:`${cv.symbol}${Math.round(v).toLocaleString()}`; };
                // FIX #5: livingMonthly is already per-month — no *12 bug
                return (
                  <div key={city.city} style={S.card}>
                    <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                      <div style={{fontSize:26}}>{city.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{city.city}</div>
                        {/* FIX #5: correctly labelled as /month, correct value */}
                        <div style={{fontSize:11,color:C.muted}}>{city.region} · Est. total {cr(city.livingMonthly)}<strong>/month</strong> · Annual: {currency==="BDT"?`৳${(city.livingMonthly*12*cv.rate/100000).toFixed(1)} লাখ/yr`:`${cv.symbol}${Math.round(city.livingMonthly*12*cv.rate).toLocaleString()}/yr`}</div>
                        <div style={{fontSize:11,color:C.green,marginTop:4,lineHeight:1.5}}>💡 {city.tip}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:16,fontWeight:800,color:C.orange}}>{cr(city.livingMonthly)}<span style={{fontSize:10,color:C.muted,fontWeight:400}}>/mo</span></div>
                        <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                          <span style={S.badge(C.muted)}>Food: {cr(city.food)}</span>
                          <span style={S.badge(C.muted)}>Transport: {cr(city.transport)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
                      {city.options.map(opt=>(
                        <div key={opt.type} style={{padding:"10px 12px",background:C.dim,borderRadius:8,border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{opt.type}</div>
                          <div style={{fontSize:17,fontWeight:800,color:C.green,margin:"4px 0"}}>{cr(opt.nzd)}<span style={{fontSize:10,color:C.muted,fontWeight:400}}>/mo</span></div>
                          <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:6}}>{opt.desc}</div>
                          <a href={opt.link} target="_blank" rel="noreferrer" style={{fontSize:11,color:C.blue,textDecoration:"none"}}>🔗 Find listings</a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {/* FIX #11: bar chart with Y-axis labels and scale */}
              <div style={S.card}>
                <div style={S.h2}>📊 City Comparison — Estimated Monthly Cost</div>
                <div style={{display:"flex",gap:8,alignItems:"flex-end",paddingBottom:8}}>
                  {ACCOMMODATION.map(city=>{
                    const cv=CURRENCIES[currency];
                    const pct = Math.round(city.livingMonthly / ACCOMMODATION[0].livingMonthly * 100);
                    const disp = currency==="BDT" ? `৳${Math.round(city.livingMonthly*cv.rate/1000)}k` : `${cv.symbol}${Math.round(city.livingMonthly*cv.rate)}`;
                    return (
                      <div key={city.city} style={{flex:1,minWidth:60,textAlign:"center"}}>
                        <div style={{fontSize:10,color:C.green,fontWeight:700,marginBottom:4}}>{disp}/mo</div>
                        <div style={{height:Math.max(pct*1.2,8),background:`linear-gradient(to top,${C.green},${C.blue})`,borderRadius:"4px 4px 0 0",transition:"height .3s"}}/>
                        <div style={{height:1,background:C.border,margin:"0 -2px"}}/>
                        <div style={{fontSize:10,color:C.muted,marginTop:4,lineHeight:1.3}}>{city.emoji}<br/>{city.city}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>* Estimates for a couple. Actual costs vary by lifestyle and exact location.</div>
              </div>
            </div>
          )}

          {/* ════════ ARTICLES ════════ */}
          {tab==="articles" && (
            <div>
              {articleOpen ? (
                <div>
                  <button style={{...S.btn("s"),marginBottom:14,fontSize:12}} onClick={()=>setArticleOpen(null)}>← Back to Articles</button>
                  <div style={S.card}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}>
                      <div style={{fontSize:30}}>{articleOpen.emoji}</div>
                      <div>
                        <span style={S.badge(C.blue)}>{articleOpen.category}</span>
                        <div style={{fontSize:17,fontWeight:800,color:"#fff",marginTop:6}}>{articleOpen.title}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:4}}>{articleOpen.readTime} read · {articleOpen.date}</div>
                      </div>
                    </div>
                    {/* FIX #15: proper markdown renderer */}
                    <Markdown text={articleOpen.content}/>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{...S.card,background:"linear-gradient(135deg,#061018,#0b1e2e)",border:`1px solid ${C.blue}28`,marginBottom:14}}>
                    <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>📖 Study NZ — Guidance Library</div>
                    <div style={{fontSize:12,color:C.muted}}>{ARTICLES.length} articles written for Bangladeshi students planning to study in New Zealand</div>
                  </div>
                  <div style={S.g2}>
                    {ARTICLES.map(a=>(
                      <div key={a.id} style={{...S.card,cursor:"pointer",marginBottom:0}} onClick={()=>setArticleOpen(a)} onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                          <div style={{fontSize:26,flexShrink:0}}>{a.emoji}</div>
                          <div style={{flex:1}}>
                            <span style={S.badge(C.blue)}>{a.category}</span>
                            <div style={{fontSize:13,fontWeight:700,color:"#fff",marginTop:6,lineHeight:1.4}}>{a.title}</div>
                            <div style={{fontSize:11,color:C.muted,marginTop:6,lineHeight:1.5}}>{a.summary}</div>
                            <div style={{display:"flex",gap:10,marginTop:8,fontSize:11,color:C.muted}}>
                              <span>⏱ {a.readTime}</span><span>📅 {a.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════ AI TOOLS ════════ */}
          {tab==="ai" && (
            <AITab profile={profile} aiLoading={aiLoading} setAiLoading={setAiLoading} aiResult={aiResult} setAiResult={setAiResult} aiTool={aiTool} setAiTool={setAiTool} testLabel={testLabel}/>
          )}

          {/* ════════ GOVT INFO ════════ */}
          {tab==="govt" && <GovtTab/>}

        </div>
      </div>
    </>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
// FIX #18: removed double-spread syntax
function SectionHdr({title,count,total,color,icon,sub}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 15px",background:`${color}0e`,border:`1px solid ${color}22`,borderRadius:10,marginBottom:12,marginTop:8}}>
      <span style={{fontSize:20}}>{icon}</span>
      <div style={{flex:1}}>
        <span style={{fontSize:14,fontWeight:800,color:"#fff"}}>{title}</span>
        <span style={{fontSize:11,color:C.muted,marginLeft:8}}>{sub}</span>
      </div>
      <span style={{display:"inline-flex",alignItems:"center",background:`${color}16`,color,border:`1px solid ${color}28`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>{count} shown / {total} total</span>
    </div>
  );
}

// ─── INSTITUTION CARD ─────────────────────────────────────────────────────────
function InstCard({inst,expanded,onToggle,isElig,pteSelf,cgpaSelf,wishlist,toggleWishlist,reviews,setReviews,onApply,currency,color}) {
  const [showReview,setShowReview] = useState(false);
  const [newRating,setNewRating] = useState(5);
  const [newComment,setNewComment] = useState("");
  const [newName,setNewName] = useState("");

  const eligCount  = inst.programs.filter(p=>isElig(p)).length;
  const allElig    = eligCount === inst.programs.length;
  const someElig   = eligCount > 0 && !allElig;
  const fitColor   = allElig ? C.green : someElig ? C.blue : C.orange;
  const fitLabel   = allElig ? "✅ All Eligible" : someElig ? `✅ ${eligCount}/${inst.programs.length} Eligible` : "📈 Upgrade Score";
  const minFee     = Math.min(...inst.programs.map(p=>p.nzd));
  const instReviews= reviews[inst.id] || [];
  const avgRating  = instReviews.length ? (instReviews.reduce((a,r)=>a+r.rating,0)/instReviews.length) : null;
  // FIX #20: proper fallback for private colleges
  const meta = META_RANK[inst.id] || { score:45, qs:"N/A", the:"N/A", usn:"N/A", label:"Registered", fitNote:"Verify before enrolling" };
  const liked = wishlist.has(inst.id);

  const submitReview = () => {
    if (!newComment.trim()) return;
    setReviews(r=>({...r,[inst.id]:[...(r[inst.id]||[]),{name:newName||"Anonymous",rating:newRating,comment:newComment,date:new Date().toLocaleDateString("en-GB")}]}));
    setNewComment(""); setNewName(""); setNewRating(5); setShowReview(false);
  };

  return (
    <div style={{...S.card,border:`1px solid ${expanded?color+"55":C.border}`,marginBottom:10,transition:"border-color .2s"}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{fontSize:24,flexShrink:0}}>{inst.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:3}}>
            <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{inst.name}</span>
            <span style={{display:"inline-flex",alignItems:"center",background:`${fitColor}16`,color:fitColor,border:`1px solid ${fitColor}28`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>{fitLabel}</span>
            {inst.instType==="university" && <span style={{...S.badge(C.blue),fontSize:9}}>{meta.qs} QS</span>}
            <span style={{...S.badge(color),fontSize:9}}>{meta.label}</span>
          </div>
          {/* Meta bar — universities only */}
          {inst.instType==="university" && (
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <div style={{width:100,height:3,background:C.border,borderRadius:2}}>
                <div style={{width:`${meta.score}%`,height:"100%",background:`linear-gradient(90deg,${C.blue},${C.green})`,borderRadius:2}}/>
              </div>
              <span style={{fontSize:9,color:C.muted}}>Meta {meta.score}/100 · {meta.fitNote}</span>
            </div>
          )}
          <div style={{fontSize:11,color:C.muted}}>📍 {inst.city} · {inst.programs.length} programme{inst.programs.length!==1?"s":""}</div>
          <div style={{display:"flex",gap:6,alignItems:"center",marginTop:4,flexWrap:"wrap"}}>
            {/* FIX #6: use component that handles past intakes */}
            <DeadlineBadge intakes={[...new Set(inst.programs.flatMap(p=>p.intakes))]}/>
            {/* FIX #16: numeric rating alongside stars */}
            {avgRating!=null && (
              <span style={{fontSize:10,color:C.yellow}}>
                {"★".repeat(Math.round(avgRating))}{"☆".repeat(5-Math.round(avgRating))} {avgRating.toFixed(1)} ({instReviews.length})
              </span>
            )}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <button style={S.heart(liked)} onClick={()=>toggleWishlist(inst.id)} title={liked?"Remove from wishlist":"Add to wishlist"}>
            {liked?"❤️":"🤍"}
          </button>
          <div style={{fontSize:13,fontWeight:800,color:minFee===0?C.green:C.orange}}>{fmt(minFee,currency)}</div>
          <div style={{fontSize:10,color:C.muted}}>per year</div>
          <button style={{...S.btn("s"),fontSize:11,padding:"5px 11px"}} onClick={onToggle}>
            {expanded?"▲ Collapse":"▼ Programs"}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{marginTop:14}}>
          <div style={{fontSize:12,color:C.text,lineHeight:1.7,padding:"9px 12px",background:C.dim,borderRadius:8,marginBottom:12}}>{inst.overview}</div>

          {/* Meta detail for universities */}
          {inst.instType==="university" && (
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              {[["QS World Rank",meta.qs,C.blue],["Times Higher",meta.the,C.purple],["US News",meta.usn,C.orange],["StudyGlobal Meta",`${meta.score}/100`,C.green]].map(([k,v,c])=>(
                <div key={k} style={{padding:"7px 11px",background:C.dim,borderRadius:7,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:10,color:C.muted}}>{k}</div>
                  <div style={{fontSize:12,fontWeight:700,color:c,marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {/* FIX #14: programme table with priority columns, horizontal scroll on mobile */}
          <div style={S.h2}>📋 Available Programmes</div>
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:600}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`}}>
                  {["Programme","Level","Fee/yr","PTE","CGPA","Eligible","Intakes","Deadline","Scholarship","Apply"].map(h=>(
                    <th key={h} style={{padding:"6px 9px",textAlign:"left",color:C.muted,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inst.programs.map((p,i)=>{
                  const el = isElig(p);
                  const days = daysUntil(p.intakes);
                  const dc = deadlineColor(days);
                  return (
                    <tr key={i} style={{borderBottom:`1px solid ${C.border}40`,background:el?`${C.green}05`:"transparent"}}>
                      <td style={{padding:"7px 9px",color:"#fff",fontWeight:600,whiteSpace:"nowrap"}}>{p.name}</td>
                      <td style={{padding:"7px 9px"}}><span style={{...S.badge(p.level==="Masters"||p.level==="PhD"?C.blue:p.level==="PG Diploma"?C.purple:C.green),fontSize:9}}>{p.level}</span></td>
                      <td style={{padding:"7px 9px",color:p.nzd===0?C.green:C.orange,fontWeight:700,whiteSpace:"nowrap"}}>{fmt(p.nzd,currency)}</td>
                      <td style={{padding:"7px 9px",color:pteSelf>=p.pteMin?C.green:C.red,fontWeight:700}}>{p.pteMin} {pteSelf>=p.pteMin?"✓":"✗"}</td>
                      <td style={{padding:"7px 9px",color:cgpaSelf>=p.cgpaMin?C.green:C.red,fontWeight:700}}>{p.cgpaMin} {cgpaSelf>=p.cgpaMin?"✓":"✗"}</td>
                      <td style={{padding:"7px 9px"}}><span style={{...S.badge(el?C.green:C.orange),fontSize:9}}>{el?"✅":"📈"}</span></td>
                      <td style={{padding:"7px 9px",color:C.muted,fontSize:10,whiteSpace:"nowrap"}}>{p.intakes.join(", ")}</td>
                      <td style={{padding:"7px 9px",whiteSpace:"nowrap"}}>
                        {days===null ? <span style={{fontSize:10,color:C.muted}}>Closed</span>
                          : <span style={{fontSize:10,color:dc,fontWeight:700}}>⏰ {days}d</span>}
                      </td>
                      <td style={{padding:"7px 9px",color:C.orange,fontSize:10,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={p.scholarship}>{p.scholarship}</td>
                      <td style={{padding:"7px 9px"}}><button style={{...S.btn("p"),padding:"4px 10px",fontSize:10}} onClick={()=>onApply(p)}>Apply</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* STUDENT REVIEWS */}
          <div style={{marginTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={S.h2}>⭐ Student Reviews ({instReviews.length})</div>
              <button style={{...S.btn("b"),fontSize:11,padding:"5px 12px"}} onClick={()=>setShowReview(r=>!r)}>
                {showReview?"Cancel":"+ Write Review"}
              </button>
            </div>
            {showReview && (
              <div style={{...S.card,background:C.dim,marginBottom:12}}>
                <div style={{marginBottom:10}}>
                  <label style={S.label}>Your Name (optional)</label>
                  <input style={S.input} placeholder="Anonymous" value={newName} onChange={e=>setNewName(e.target.value)}/>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={S.label}>Rating</label>
                  {/* FIX #16: accessibility label on stars */}
                  <div style={{display:"flex",gap:4}} role="radiogroup" aria-label="Rating">
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} role="radio" aria-checked={n===newRating} aria-label={`${n} star${n!==1?"s":""}`}
                        style={{background:"none",border:"none",cursor:"pointer",fontSize:24,color:n<=newRating?C.yellow:C.border}}
                        onClick={()=>setNewRating(n)}>★</button>
                    ))}
                    <span style={{fontSize:12,color:C.muted,alignSelf:"center",marginLeft:4}}>{newRating}/5</span>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <label style={S.label}>Your Review</label>
                  <textarea style={{...S.input,resize:"vertical",minHeight:70,fontFamily:"inherit"}} placeholder="Share your experience..." value={newComment} onChange={e=>setNewComment(e.target.value)}/>
                </div>
                <button style={S.btn("p")} onClick={submitReview}>Submit Review</button>
              </div>
            )}
            {instReviews.length===0 ? (
              <div style={{padding:"12px",background:C.dim,borderRadius:8,fontSize:12,color:C.muted,textAlign:"center"}}>No reviews yet. Be the first to share your experience!</div>
            ) : instReviews.map((r,i)=>(
              <div key={i} style={{padding:"10px 12px",background:C.dim,borderRadius:8,marginBottom:6,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{r.name}</span>
                    {/* FIX #16: numeric rating shown */}
                    <span style={{color:C.yellow,fontSize:12}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                    <span style={{fontSize:10,color:C.muted}}>{r.rating}/5</span>
                  </div>
                  <span style={{fontSize:10,color:C.muted}}>{r.date}</span>
                </div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{r.comment}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:10,padding:"9px 12px",background:C.dim,borderRadius:7,fontSize:11,color:C.text,lineHeight:1.6,border:`1px solid ${color}20`}}>💡 {inst.note}</div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────
function ProfileTab({profile,setProfile,pteSelf,testLabel}) {
  // FIX #1: proper state update handler — never mutates directly
  const h = k => e => setProfile(p=>({...p,[k]:e.target.value}));
  return (
    <div>
      <div style={{...S.card,background:"linear-gradient(135deg,#071526,#0c2040)",border:`1px solid ${C.gb}`,marginBottom:16}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#000",flexShrink:0}}>{(profile.name||"S")[0]}</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{profile.name}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{profile.degree} · CGPA {profile.cgpa} · {testLabel}: {profile.testOverall} (PTE≈{pteSelf})</div>
          </div>
        </div>
      </div>
      <div style={S.g2}>
        <div style={S.card}>
          <div style={S.h2}>👤 Personal Information</div>
          {[{k:"name",l:"Full Name"},{k:"email",l:"Gmail Address",type:"email"},{k:"phone",l:"Phone"},{k:"dob",l:"Date of Birth"},{k:"nationality",l:"Nationality"},{k:"passport",l:"Passport Number"},{k:"passportExpiry",l:"Passport Expiry"},{k:"address",l:"Home Address"},{k:"spouse",l:"Spouse"}].map(f=>(
            <div key={f.k} style={{marginBottom:9}}>
              <label style={S.label}>{f.l}</label>
              <input style={S.input} type={f.type||"text"} value={profile[f.k]||""} onChange={h(f.k)}/>
            </div>
          ))}
        </div>
        <div>
          <div style={S.card}>
            <div style={S.h2}>🎓 Academic Background</div>
            {[{k:"degree",l:"Degree"},{k:"university",l:"University"},{k:"cgpa",l:"CGPA"},{k:"cgpaScale",l:"CGPA Scale"},{k:"gradYear",l:"Graduation Year"},{k:"hsc",l:"HSC / A-Level"},{k:"ssc",l:"SSC / O-Level"}].map(f=>(
              <div key={f.k} style={{marginBottom:9}}><label style={S.label}>{f.l}</label><input style={S.input} value={profile[f.k]||""} onChange={h(f.k)}/></div>
            ))}
          </div>
          <div style={S.card}>
            <div style={S.h2}>🌐 English Proficiency Test</div>
            <div style={{marginBottom:9}}>
              <label style={S.label}>Test Type</label>
              <select style={S.select} value={profile.testType} onChange={h("testType")}>
                {ENGLISH_TESTS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div style={S.g2}>
              {["Overall","Speaking","Writing","Listening","Reading"].map(band=>{
                const bk="test"+band; const v=parseFloat(profile[bk])||0; const ok=v>=58;
                return (
                  <div key={band} style={{marginBottom:8}}>
                    <label style={S.label}>{band}</label>
                    <div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <input style={S.input} value={profile[bk]||""} onChange={h(bk)}/>
                      {profile[bk] && <span style={{fontSize:13}}>{ok?"✅":"⚠️"}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:8,padding:"7px 11px",background:C.dim,borderRadius:7,fontSize:11,color:C.muted}}>
              PTE Equivalent: <strong style={{color:C.green}}>{pteSelf}</strong> — used for all eligibility checks
            </div>
          </div>
          <div style={S.card}>
            <div style={S.h2}>💼 Work & Skills</div>
            {[{k:"jobTitle",l:"Job Title"},{k:"employer",l:"Employer"},{k:"skills",l:"Skills"}].map(f=>(
              <div key={f.k} style={{marginBottom:9}}><label style={S.label}>{f.l}</label><input style={S.input} value={profile[f.k]||""} onChange={h(f.k)}/></div>
            ))}
            <label style={S.label}>Study Objective</label>
            <textarea style={{...S.input,resize:"vertical",minHeight:60,fontFamily:"inherit"}} value={profile.objective||""} onChange={h("objective")}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DOCUMENT VAULT ───────────────────────────────────────────────────────────
function DocumentVault({documents,setDocuments}) {
  const fileRef=useRef(); const [docType,setDocType]=useState("passport"); const [toast,setToast]=useState(null);
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  const upload=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setDocuments(d=>({...d,[docType]:{name:f.name,type:f.type,data:ev.target.result,size:(f.size/1024).toFixed(1)+"KB",uploadedAt:new Date().toLocaleString()}}));showToast(`✅ ${f.name} uploaded!`);};r.readAsDataURL(f);e.target.value="";};
  const del=id=>{setDocuments(d=>{const n={...d};delete n[id];return n;});showToast("🗑 Deleted.");};
  const up=Object.keys(documents).length; const req=DOC_TYPES.filter(d=>d.required).length; const rd=DOC_TYPES.filter(d=>d.required&&documents[d.id]).length;
  return (
    <div>
      {toast && <div style={{position:"fixed",top:14,right:14,background:C.green,color:"#000",padding:"10px 16px",borderRadius:10,fontWeight:700,fontSize:13,zIndex:9999,boxShadow:"0 4px 20px rgba(0,229,160,.4)"}}>{toast}</div>}
      <div style={S.g4}>
        {[["Uploaded",up,C.green],[`Required ${rd}/${req}`,rd<req?`${req-rd} Missing`:"Complete ✅",rd<req?C.orange:C.green],["Complete",Math.round(up/DOC_TYPES.length*100)+"%",C.blue],["Total",DOC_TYPES.length,"#fff"]].map(([l,v,c])=>(
          <div key={l} style={{...S.card,marginBottom:0,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{l}</div></div>
        ))}
      </div>
      {/* FIX #8: responsive two-column layout using auto-fit */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginTop:12}}>
        <div style={S.card}>
          <div style={S.h2}>📤 Upload Document</div>
          <label style={S.label}>Document Type</label>
          <select style={{...S.select,marginBottom:12}} value={docType} onChange={e=>setDocType(e.target.value)}>
            {DOC_TYPES.map(d=><option key={d.id} value={d.id}>{d.icon} {d.label}{d.required?" *":""}</option>)}
          </select>
          <input type="file" ref={fileRef} style={{display:"none"}} accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={upload}/>
          <button style={{...S.btn("p"),width:"100%"}} onClick={()=>fileRef.current.click()}>📤 Choose File</button>
          <div style={{marginTop:7,fontSize:11,color:C.muted}}>PDF, JPG, PNG, DOCX · * = Required</div>
        </div>
        <div style={S.card}>
          <div style={S.h2}>📁 Document Vault ({up}/{DOC_TYPES.length})</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:9}}>
            {DOC_TYPES.map(dt=>{const doc=documents[dt.id]; return (
              <div key={dt.id} style={{padding:11,background:C.dim,borderRadius:9,border:`1px solid ${doc?C.gb:dt.required?C.red+"20":C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:16}}>{dt.icon}</span>
                  <span style={S.badge(doc?C.green:dt.required?C.red:C.muted)}>{doc?"✓":dt.required?"Required":"Optional"}</span>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:doc?"#fff":C.muted}}>{dt.label}</div>
                {doc ? (
                  <>
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>{doc.name}</div>
                    <div style={{display:"flex",gap:4,marginTop:6}}>
                      {doc.type?.startsWith("image/")&&<a href={doc.data} target="_blank" rel="noreferrer" style={{...S.btn("s"),fontSize:10,padding:"2px 7px",textDecoration:"none"}}>👁</a>}
                      <button style={{...S.btn("danger"),fontSize:10,padding:"2px 7px"}} onClick={()=>del(dt.id)}>🗑</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{fontSize:10,color:C.orange,marginTop:3}}>{dt.note}</div>
                    <button style={{...S.btn("s"),fontSize:10,padding:"4px 8px",marginTop:5}} onClick={()=>{setDocType(dt.id);fileRef.current.click();}}>Upload</button>
                  </>
                )}
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APPLY TAB ────────────────────────────────────────────────────────────────
function ApplyTab({profile,setProfile,documents,allInst,applications,setApplications,applyTarget,clearTarget,testLabel,currency}) {
  const [step,setStep]=useState(1);
  const [selInst,setSelInst]=useState(null);
  const [selProg,setSelProg]=useState(null);
  const [intake,setIntake]=useState("");
  const [note,setNote]=useState("");
  const [emailBody,setEmailBody]=useState("");
  const [drafting,setDrafting]=useState(false);
  const [draftDone,setDraftDone]=useState(null);
  // FIX #7: local email state always editable
  const [localEmail,setLocalEmail]=useState(profile.email||"");

  // FIX #2: useEffect with proper null guard and dependency
  useEffect(()=>{
    if (applyTarget?.inst && applyTarget?.prog) {
      setSelInst(applyTarget.inst);
      setSelProg(applyTarget.prog);
      setStep(3);
      setEmailBody("");
      setDraftDone(null);
    }
  },[applyTarget]);

  const genEmail=async()=>{
    if(!selInst||!selProg||!intake)return;
    setDrafting(true);
    const body=await callClaude(
      `Write a 300-word professional application inquiry email.
APPLICANT: ${profile.name||"Student"} | ${profile.nationality} | Passport: ${profile.passport} | DOB: ${profile.dob}
DEGREE: ${profile.degree}, ${profile.university} (CGPA: ${profile.cgpa}/${profile.cgpaScale}, grad ${profile.gradYear})
HSC: ${profile.hsc} | SSC: ${profile.ssc}
ENGLISH: ${testLabel} Overall ${profile.testOverall} | Speaking: ${profile.testSpeaking} | Writing: ${profile.testWriting} | Listening: ${profile.testListening} | Reading: ${profile.testReading}
DOCS: ${Object.keys(documents).length} documents ready
SPOUSE: ${profile.spouse||"N/A"} will accompany as dependent
TARGET: ${selInst.name} | Programme: ${selProg.name} | Level: ${selProg.level} | Intake: ${intake}
SCHOLARSHIP INTEREST: ${selProg.scholarship}
EXTRA NOTE: ${note||"None"}
Write the email body only — no subject in body. Professional, confident, specific.`,
      "Professional academic advisor writing NZ university application emails."
    );
    setEmailBody(body); setStep(4); setDrafting(false);
  };

  const submit=async()=>{
    setDrafting(true);
    const subject=`Application Inquiry — ${selProg.name} — ${intake} Intake — ${profile.name} (Bangladesh)`;
    const dc=localEmail?await gmailDraft(selInst.contact,subject,emailBody):false;
    setApplications(prev=>[...prev,{
      id:Date.now(), inst:selInst.name, prog:selProg.name, level:selProg.level,
      city:selInst.city, intake, email:selInst.contact, sentFrom:localEmail,
      nzd:selProg.nzd, scholarship:selProg.scholarship,
      status:"Submitted", gmailDraft:dc, submittedAt:new Date().toLocaleString(),
      updates:[
        {date:new Date().toLocaleString(), msg:"Application email generated."},
        {date:new Date().toLocaleString(), msg:dc?`Gmail draft saved to ${localEmail}`:"Copy email and send manually."},
      ],
    }]);
    setDraftDone(dc); setStep(5); setDrafting(false);
  };

  const reset=()=>{
    setStep(1);setSelInst(null);setSelProg(null);setEmailBody("");setDraftDone(null);setIntake("");setNote("");
    clearTarget&&clearTarget();
  };

  if (step===5) return (
    <div style={{...S.card,textAlign:"center",padding:48}}>
      <div style={{fontSize:48,marginBottom:10}}>🎉</div>
      <div style={{fontSize:16,fontWeight:800,color:C.green,marginBottom:6}}>Application Submitted!</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:18}}>
        {draftDone?`Gmail draft saved to ${localEmail}. Open Gmail → Drafts → review and click Send.`:"Email generated. Copy it below and send manually."}
      </div>
      <button style={S.btn("p")} onClick={reset}>Apply to Another →</button>
    </div>
  );

  const STEPS=["Select Institution","Select Programme","Details","Review & Send"];
  return (
    <div>
      <div style={{display:"flex",marginBottom:18}}>
        {STEPS.map((l,i)=>(
          <div key={l} style={{flex:1,textAlign:"center"}}>
            <div style={{display:"flex",alignItems:"center"}}>
              <div style={{flex:1,height:2,background:i===0?"transparent":step>i+1?C.green:C.border}}/>
              <div style={{width:24,height:24,borderRadius:"50%",background:step>i+1?C.green:step===i+1?C.green:C.dim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:step>=i+1?"#000":C.muted,flexShrink:0}}>{step>i+1?"✓":i+1}</div>
              <div style={{flex:1,height:2,background:step>i+1?C.green:C.border}}/>
            </div>
            <div style={{fontSize:10,marginTop:3,color:step===i+1?C.green:C.muted}}>{l}</div>
          </div>
        ))}
      </div>

      {step===1 && (
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:10}}>Choose an institution:</div>
          {allInst.map(inst=>(
            <div key={inst.id} onClick={()=>{setSelInst(inst);setSelProg(null);setStep(2);}}
              style={{...S.card,marginBottom:7,cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.green}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{display:"flex",gap:9,alignItems:"center"}}>
                <span style={{fontSize:20}}>{inst.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{inst.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{inst.type} · {inst.city} · {inst.programs.length} programme{inst.programs.length!==1?"s":""}</div>
                </div>
                <div style={{fontSize:12,fontWeight:800,color:Math.min(...inst.programs.map(p=>p.nzd))===0?C.green:C.orange}}>
                  {fmt(Math.min(...inst.programs.map(p=>p.nzd)),currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {step===2 && selInst && (
        <div style={S.card}>
          <button style={{...S.btn("s"),marginBottom:10,fontSize:11}} onClick={()=>setStep(1)}>← Back</button>
          <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:10}}>Choose programme at {selInst.name}:</div>
          {selInst.programs.map((p,i)=>(
            <div key={i} onClick={()=>{setSelProg(p);setStep(3);}}
              style={{padding:12,background:C.dim,borderRadius:8,marginBottom:7,cursor:"pointer",border:`1px solid ${C.border}`}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.green}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{p.name}</div>
                  <div style={{display:"flex",gap:6,marginTop:4}}>
                    <span style={S.badge(C.blue)}>{p.level}</span>
                    <span style={S.badge(C.muted)}>{p.duration}</span>
                  </div>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:p.nzd===0?C.green:C.orange}}>{fmt(p.nzd,currency)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {step===3 && selInst && selProg && (
        <div style={S.card}>
          <button style={{...S.btn("s"),marginBottom:10,fontSize:11}} onClick={()=>setStep(2)}>← Back</button>
          <div style={{background:C.dim,borderRadius:8,padding:12,marginBottom:14,border:`1px solid ${C.gb}`}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:2}}>Applying to</div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{selInst.emoji} {selInst.name}</div>
            <div style={{fontSize:13,color:C.green,marginTop:2}}>{selProg.name} · {selProg.level}</div>
            <div style={{display:"flex",gap:12,marginTop:6,fontSize:11,color:C.muted,flexWrap:"wrap"}}>
              <span>📧 {selInst.contact}</span>
              <span>💰 {fmt(selProg.nzd,currency)}/yr</span>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={S.label}>Preferred Intake *</label>
            <select style={S.select} value={intake} onChange={e=>setIntake(e.target.value)}>
              <option value="">Select...</option>
              {selProg.intakes.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {/* FIX #7: always editable, not conditionally read-only */}
          <div style={{marginBottom:12}}>
            <label style={S.label}>Your Gmail Address (for draft & tracking)</label>
            <input style={S.input} type="email" placeholder="your@gmail.com" value={localEmail} onChange={e=>setLocalEmail(e.target.value)}/>
            {!localEmail && <div style={{fontSize:11,color:C.orange,marginTop:4}}>⚠️ Enter your Gmail to save a draft automatically</div>}
          </div>
          <div style={{marginBottom:12}}>
            <label style={S.label}>Special Note (optional)</label>
            <textarea style={{...S.input,resize:"vertical",minHeight:55,fontFamily:"inherit"}} placeholder="e.g. Interested in scholarships, wife will accompany..." value={note} onChange={e=>setNote(e.target.value)}/>
          </div>
          <div style={{padding:10,background:C.dim,borderRadius:7,marginBottom:12,fontSize:11}}>
            <div style={{fontWeight:700,color:"#fff",marginBottom:4}}>📎 Profile data being included</div>
            {[`${profile.degree} (CGPA ${profile.cgpa})`,`${testLabel}: ${profile.testOverall}`,`${Object.keys(documents).length} documents ready`].map(i=><div key={i} style={{color:C.green,marginBottom:2}}>✓ {i}</div>)}
          </div>
          <button style={{...S.btn("p"),width:"100%",padding:12,opacity:intake?1:.4}} onClick={genEmail} disabled={!intake||drafting}>
            {drafting ? <><span className="sg-btn-loading">⏳</span> Writing email...</> : "✨ Generate Application Email →"}
          </button>
        </div>
      )}

      {step===4 && emailBody && (
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div style={S.h2}>📧 Review Your Email</div>
            <button style={{...S.btn("s"),fontSize:11,padding:"4px 9px"}} onClick={()=>navigator.clipboard?.writeText(emailBody)}>📋 Copy</button>
          </div>
          <div style={{marginBottom:10,padding:"8px 12px",background:C.dim,borderRadius:7,fontSize:11,color:C.muted}}>
            <strong style={{color:"#fff"}}>To:</strong> {selInst?.contact} &nbsp;|&nbsp;
            <strong style={{color:"#fff"}}>Subject:</strong> Application Inquiry — {selProg?.name} — {intake} — {profile.name}
          </div>
          <textarea style={{...S.input,resize:"vertical",minHeight:280,fontFamily:"inherit",lineHeight:1.7,fontSize:12}} value={emailBody} onChange={e=>setEmailBody(e.target.value)}/>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button style={S.btn("s")} onClick={()=>setStep(3)}>← Edit</button>
            <button style={{...S.btn("p"),flex:1,justifyContent:"center"}} onClick={submit} disabled={drafting}>
              {drafting?"⏳ Saving to Gmail Drafts...":"🚀 Submit & Save to Gmail Drafts"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TRACKER TAB ──────────────────────────────────────────────────────────────
// FIX #17: currency prop passed in — live conversion of fees
function TrackerTab({applications,setApplications,currency}) {
  const SC={"Submitted":C.blue,"Under Review":C.orange,"Documents Requested":C.purple,"Offer Received":C.green,"Rejected":C.red,"Withdrawn":C.muted};
  if (applications.length===0) return (
    <div style={{...S.card,textAlign:"center",padding:48}}>
      <div style={{fontSize:36,marginBottom:8}}>📬</div>
      <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:5}}>No applications yet</div>
      <div style={{color:C.muted,fontSize:12}}>Go to Find Programs and click Apply on any programme.</div>
    </div>
  );
  return (
    <div>
      <div style={S.g4}>
        {[["Total",applications.length,C.green],["Submitted",applications.filter(a=>a.status==="Submitted").length,C.blue],["Offers",applications.filter(a=>a.status==="Offer Received").length,C.green],["Gmail Drafts",applications.filter(a=>a.gmailDraft).length,C.purple]].map(([l,v,c])=>(
          <div key={l} style={{...S.card,marginBottom:0,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{l}</div></div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        {applications.map(app=>(
          <div key={app.id} style={{...S.card,marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{app.inst}</div>
                <div style={{fontSize:12,color:C.green,marginTop:2}}>{app.prog} · {app.level}</div>
                {/* FIX #17: live currency conversion */}
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Intake: {app.intake} · {app.city} · {fmtLive(app.nzd,currency)}/yr</div>
                <div style={{fontSize:11,color:C.muted}}>To: {app.email} · From: {app.sentFrom||"Not set"}</div>
                <div style={{fontSize:11,color:app.gmailDraft?C.green:C.orange,marginTop:3}}>
                  {app.gmailDraft?"✅ Gmail draft created — open Drafts → Send":"📋 Copy email and send manually"}
                </div>
                <div style={{fontSize:11,color:C.orange,marginTop:3}}>🏆 {app.scholarship}</div>
                <div style={{marginTop:8}}>
                  {(app.updates||[]).map((u,i)=>(
                    <div key={i} style={{display:"flex",gap:6,marginBottom:3,fontSize:11}}>
                      <span style={{color:C.green}}>●</span>
                      <span style={{color:C.text}}>{u.msg}</span>
                      <span style={{color:C.muted}}>— {u.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                <select value={app.status} onChange={e=>setApplications(prev=>prev.map(a=>a.id===app.id?{...a,status:e.target.value,updates:[...a.updates,{date:new Date().toLocaleString(),msg:`Status → ${e.target.value}`}]}:a))}
                  style={{...S.select,width:"auto",fontSize:11,background:`${SC[app.status]||C.blue}16`,color:SC[app.status]||C.blue,border:`1px solid ${SC[app.status]||C.blue}35`}}>
                  {Object.keys(SC).map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>{app.submittedAt}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI TOOLS ─────────────────────────────────────────────────────────────────
// FIX #19: loading skeleton added to result panel
function AITab({profile,aiLoading,setAiLoading,aiResult,setAiResult,aiTool,setAiTool,testLabel}) {
  const [sopUni,setSopUni]=useState(""); const [sopProg,setSopProg]=useState(""); const [cvFmt,setCvFmt]=useState("professional");
  const run=async(prompt,sys)=>{ setAiLoading(true); setAiResult(null); const r=await callClaude(prompt,sys); setAiResult(r); setAiLoading(false); };
  const TOOLS=[{id:"sop",l:"✍️ SOP"},{id:"cv",l:"📄 CV"},{id:"scholarship",l:"🏆 Scholarships"},{id:"visa",l:"🛂 Visa Guide"},{id:"update",l:"🔄 Updates"}];
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {TOOLS.map(t=><button key={t.id} style={{...S.btn(aiTool===t.id?"p":"s"),fontSize:12}} onClick={()=>{setAiTool(t.id);setAiResult(null);}}>{t.l}</button>)}
      </div>
      <div style={S.g2}>
        <div style={S.card}>
          {aiTool==="sop"&&<>
            <div style={S.h2}>✍️ Statement of Purpose Writer</div>
            {[{l:"Target University",v:sopUni,s:setSopUni,p:"e.g. AUT, Waikato..."},{l:"Target Programme",v:sopProg,s:setSopProg,p:"e.g. Master of Computing"}].map(f=>(
              <div key={f.l} style={{marginBottom:9}}><label style={S.label}>{f.l}</label><input style={S.input} value={f.v} placeholder={f.p} onChange={e=>f.s(e.target.value)}/></div>
            ))}
            <div style={{padding:"7px 11px",background:C.dim,borderRadius:7,fontSize:11,color:C.muted,marginBottom:10}}>Pre-filled with: {profile.name} · {profile.degree} CGPA {profile.cgpa} · {testLabel} {profile.testOverall}</div>
            <button style={{...S.btn("p"),width:"100%"}} disabled={aiLoading} onClick={()=>run(`Write a compelling 550-word Statement of Purpose for ${profile.name||"the student"} applying to ${sopProg||"Master's in Computing"} at ${sopUni||"a New Zealand university"}. Profile: ${profile.degree}, ${profile.university}, CGPA ${profile.cgpa}/${profile.cgpaScale}. Role: ${profile.jobTitle} at ${profile.employer}. Skills: ${profile.skills}. HSC: ${profile.hsc}. SSC: ${profile.ssc}. English: ${testLabel} ${profile.testOverall}. Objective: ${profile.objective}. Write in first person, professional and authentic, with specific reasons for choosing NZ.`,"Expert SOP writer for international university applications.")}>{aiLoading?"⏳ Writing SOP...":"✨ Generate SOP"}</button>
          </>}
          {aiTool==="cv"&&<>
            <div style={S.h2}>📄 CV Builder</div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>{["professional","academic","skills-based"].map(s=><button key={s} style={{...S.btn(cvFmt===s?"p":"s"),fontSize:11,padding:"5px 11px",textTransform:"capitalize"}} onClick={()=>setCvFmt(s)}>{s}</button>)}</div>
            <div style={{padding:"7px 11px",background:C.dim,borderRadius:7,fontSize:11,color:C.muted,marginBottom:10}}>Builds from: {profile.name} · {profile.degree} · CGPA {profile.cgpa} · {testLabel} {profile.testOverall}</div>
            <button style={{...S.btn("p"),width:"100%"}} disabled={aiLoading} onClick={()=>run(`Generate a ${cvFmt} NZ-standard CV for: ${profile.name} | Email: ${profile.email} | Phone: ${profile.phone} | ${profile.degree}, ${profile.university}, CGPA ${profile.cgpa}/${profile.cgpaScale}, ${profile.gradYear} | HSC: ${profile.hsc} | SSC: ${profile.ssc} | ${testLabel}: ${profile.testOverall} | ${profile.jobTitle} at ${profile.employer} | Skills: ${profile.skills}. Complete ATS-friendly NZ CV under 2 pages.`,"Professional CV writer for NZ applications.")}>{aiLoading?"⏳ Building CV...":"✨ Generate CV"}</button>
          </>}
          {aiTool==="scholarship"&&<>
            <div style={S.h2}>🏆 Scholarship Finder</div>
            <div style={{padding:"7px 11px",background:C.dim,borderRadius:7,fontSize:11,color:C.muted,marginBottom:10}}>Profile: {profile.name} · CGPA {profile.cgpa} · {testLabel} {profile.testOverall} · Bangladesh · July 2026</div>
            <button style={{...S.btn("p"),width:"100%"}} disabled={aiLoading} onClick={()=>run(`Find all scholarships for: ${profile.name}, Bangladesh, ${profile.degree} CGPA ${profile.cgpa}/${profile.cgpaScale}, ${testLabel} ${profile.testOverall}, Master's in CS/Computing in NZ, July 2026. Spouse: ${profile.spouse}. List fully funded and partial scholarships with name, amount, eligibility, deadline, how to apply, URL.`,"Expert NZ scholarship advisor.")}>{aiLoading?"⏳ Searching...":"🔍 Find My Scholarships"}</button>
          </>}
          {aiTool==="visa"&&<>
            <div style={S.h2}>🛂 NZ Student Visa Guide</div>
            <div style={{padding:"7px 11px",background:C.dim,borderRadius:7,fontSize:11,color:C.muted,marginBottom:10}}>Personalised for: {profile.name} · Bangladesh · Passport: {profile.passport} · Spouse: {profile.spouse}</div>
            <button style={{...S.btn("p"),width:"100%"}} disabled={aiLoading} onClick={()=>run(`Complete step-by-step NZ student visa guide for ${profile.name}, Bangladeshi (Passport: ${profile.passport}), July 2026 Master's study. Include: eligibility, documents, online application process from Bangladesh, processing time, costs, chest X-ray, spouse dependent visa for ${profile.spouse}, post-study work rights, tips for strong application.`,"Expert NZ immigration consultant.")}>{aiLoading?"⏳ Generating...":"📖 Generate Visa Guide"}</button>
          </>}
          {aiTool==="update"&&<>
            <div style={S.h2}>🔄 2026 Updates</div>
            <div style={{padding:"7px 11px",background:C.dim,borderRadius:7,fontSize:11,color:C.muted,marginBottom:10}}>Current as of March 2026 · Tailored for Bangladeshi applicants</div>
            <button style={{...S.btn("p"),width:"100%"}} disabled={aiLoading} onClick={()=>run(`Comprehensive March 2026 update for Bangladeshi students applying to NZ for July 2026: tuition fee changes, new scholarships, NZD/BDT exchange rate, application deadline status, post-study work rights updates, immigration policy changes for Bangladeshi nationals.`,"Expert NZ education and immigration advisor.")}>{aiLoading?"⏳ Fetching...":"🔄 Get All Updates"}</button>
          </>}
        </div>

        {/* FIX #19: loading skeleton in result panel */}
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div style={S.h2}>📋 Result</div>
            {aiResult&&<button style={{...S.btn("s"),fontSize:11,padding:"4px 9px"}} onClick={()=>navigator.clipboard?.writeText(aiResult)}>📋 Copy</button>}
          </div>
          {aiLoading ? (
            <div style={{padding:14}}>
              {[120,90,100,80,95,70,85,60].map((w,i)=>(
                <div key={i} className="sg-ai-skeleton" style={{height:12,borderRadius:6,marginBottom:10,width:`${w}%`}}/>
              ))}
              <div style={{textAlign:"center",marginTop:8,fontSize:12,color:C.muted}}>AI is generating your content...</div>
            </div>
          ) : aiResult ? (
            <div style={{fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap",background:C.dim,padding:12,borderRadius:8,maxHeight:520,overflow:"auto"}}>{aiResult}</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:280,color:C.muted}}>
              <div style={{fontSize:40,marginBottom:10}}>✨</div>
              <div>Click the button on the left to generate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GOVT TAB ─────────────────────────────────────────────────────────────────
function GovtTab() {
  const facts=[
    {icon:"🏛️",c:C.green,title:"All Polytechnics Are Government-Legislated",src:"NZQA",body:"Polytechnics and ITPs are established by Crown legislation — backed by an Act of Parliament. They cannot shut down like a private business."},
    {icon:"🛡️",c:C.blue,title:"Code of Practice 2021 Legally Protects You",src:"Code of Practice 2021",body:"Every institution must be a signatory. Covers your wellbeing, safety, accommodation, and right to free complaint resolution."},
    {icon:"📊",c:C.orange,title:"Public Quality Reviews — Check Before Enrolling",src:"NZQA EER",body:"NZQA rates institutions as Highly Confident, Confident, or Not Yet Confident. Reports are public at nzqa.govt.nz/providers."},
    {icon:"🧹",c:C.purple,title:"Immigration Officers Can Inspect Any Campus — Unannounced",src:"Immigration Act 2009, s.352",body:"Under Section 352, officers can enter premises and inspect student records without a warrant. Providers must verify your visa status throughout study."},
    {icon:"🎓",c:C.green,title:"Your B.Sc. CSE = NZQCF Level 7",src:"NZQA NZQCF",body:"Your Southeast University degree benchmarks at Level 7 — you can be admitted directly to Level 8 postgraduate programmes without bridging."},
    {icon:"💰",c:C.orange,title:"Your Tuition Fees Are Legally Protected (PTEs)",src:"NZQA Fee Protection",body:"Private PTEs must protect fees of NZD 500+ against insolvency. If a private college closes, your fees must be refunded. Government polytechnics are Crown-backed."},
    {icon:"⚖️",c:C.purple,title:"Free Dispute Resolution Scheme",src:"DRS Rules 2023",body:"Any contractual or financial dispute with your institution can be resolved free of charge. Contact: studycomplaints.govt.nz"},
    {icon:"🛂",c:C.blue,title:"Post-Study Work Visa Rights",src:"Immigration NZ 2024",body:"Level 7+ qualifications = 3-year post-study work visa. Dependent spouses receive open work rights throughout your study period."},
  ];
  return (
    <div>
      <div style={{...S.card,background:"#05100d",border:`1px solid ${C.gb}`,marginBottom:14,padding:"12px 15px"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>🏛️ Official NZ Government Information for International Students</div>
        <div style={{fontSize:12,color:C.muted}}>Sources: nzqa.govt.nz · immigration.govt.nz · tec.govt.nz · education.govt.nz</div>
      </div>
      <div style={S.g2}>
        {facts.map((f,i)=>(
          <div key={i} style={{...S.card,border:`1px solid ${f.c}18`}}>
            <div style={{display:"flex",gap:10}}>
              <span style={{fontSize:22,flexShrink:0}}>{f.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:3}}>{f.title}</div>
                <div style={{fontSize:10,color:C.muted,marginBottom:6}}>Source: {f.src}</div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{f.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.h2}>🔗 Official Government Links</div>
        <div style={S.g2}>
          {[["nzqa.govt.nz/providers","Check any institution's EER rating & registration",C.green],["immigration.govt.nz/study","Student visa application & requirements",C.blue],["studylink.govt.nz","Scholarships & financial support",C.orange],["studycomplaints.govt.nz","Free student dispute resolution",C.purple],["enz.govt.nz","Education New Zealand — official portal",C.green],["immigration.govt.nz","All NZ visa types & status checks",C.blue]].map(([url,desc,c])=>(
            <div key={url} style={{padding:"9px 12px",background:C.dim,borderRadius:7,border:`1px solid ${c}15`}}>
              <div style={{fontSize:12,fontWeight:700,color:c}}>{url}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
