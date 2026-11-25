// Student Report System - shared script. Each .html page sets data-page; this file renders that page.
const page=document.body.dataset.page, root=document.getElementById('root');
const ss=sessionStorage;
const U=JSON.parse(ss.getItem('srs_user')||'null');
let D=JSON.parse(ss.getItem('srs_data')||'null')||defaultData();
const save=()=>ss.setItem('srs_data',JSON.stringify(D));
let grading=ss.getItem('srs_grading')||'letter';
let sid=ss.getItem('srs_sid')||D.students[0].id;
if(page!=='login'&&!U)location.replace('index.html');
if(page==='login'&&U)location.replace('dashboard.html');

// ---------- helpers ----------
const isF=()=>U&&U.role==='faculty';
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=id=>D.students.find(s=>s.id===id);
const cur=()=>get(isF()?sid:U.own);
const tot=m=>m[0]+m[1], avg=s=>s.marks.reduce((a,m)=>a+tot(m),0)/s.marks.length;
const attP=a=>a[0]?Math.round(a[1]/a[0]*100):0;
const attAvg=s=>Math.round(s.att.reduce((a,x)=>a+x[1],0)/s.att.reduce((a,x)=>a+x[0],0)*100);
const grade=p=>GRADING[grading].of(p);
const perf=p=>p>=80?['Excellent','ok']:p>=60?['Good','ok']:['Needs attention','bd'];
const attSt=p=>p>=85?['Good','ok']:p>=75?['Average','wn']:['Low','bd'];
const badge=([t,c])=>`<span class="bg ${c}">${t}</span>`;
const bar=p=>`<div class="bar" role="img" aria-label="${p}%"><i style="width:${Math.min(p,100)}%"></i></div>`;
const kpi=(l,v,n='')=>`<div class="card kpi"><span>${l}</span><b>${v}</b><span>${n}</span></div>`;
const picker=()=>isF()?`<div class="ctl"><label for="sp" style="margin:0">Student</label><select id="sp">${D.students.map(s=>`<option value="${s.id}" ${s.id===sid?'selected':''}>${esc(s.name)} (${s.id})</option>`).join('')}</select></div>`:'';
const remarksOf=id=>D.remarks.filter(r=>r.sid===id);
const remItem=(r,n)=>`<div class="rm"><b>${n?esc(get(r.sid).name)+' · ':''}${r.sub}</b><br>${esc(r.text)}<br><small>${esc(r.fac)} · ${r.date}</small></div>`;
function chart(vals){const w=420,h=170,p=28,x=i=>p+i*(w-2*p)/(vals.length-1),y=v=>h-p-(v-40)/60*(h-2*p);
 return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Performance over terms: ${vals.join(', ')}">`+[40,60,80,100].map(v=>`<line x1="${p}" x2="${w-p}" y1="${y(v)}" y2="${y(v)}" stroke="#dde4e2"/><text x="2" y="${y(v)+4}">${v}</text>`).join('')+
 `<polyline fill="none" stroke="#0f6b66" stroke-width="2.5" points="${vals.map((v,i)=>x(i)+','+y(v)).join(' ')}"/>`+vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#0f6b66"/><text x="${x(i)-8}" y="${y(v)-9}">${v}</text><text x="${x(i)-14}" y="${h-6}">${TERMS[i]}</text>`).join('')+`</svg>`;}

// ---------- page content ----------
const TITLES={dashboard:'Dashboard',students:'Student List',marks:'Marks',attendance:'Attendance',remarks:'Remarks',reports:'Reports'};
const V={
login(){return `<div class="login"><div class="lside"><div class="logo">SR</div><h1>Student Report System</h1><p>Marks, attendance and faculty remarks in one place.</p></div>
<div class="lform"><form id="lf"><h2>Sign in</h2><div><label for="u">Username or email</label><input id="u" required></div>
<div><label for="pw">Password</label><input id="pw" type="password" required></div><a href="#" id="fp" class="fp">Forgot password?</a>
<div><label for="rl">Role</label><select id="rl"><option value="faculty">Faculty</option><option value="student">Student</option><option value="parent">Parent</option></select></div>
<div class="err" id="err" role="alert"></div><button class="btn">Log in</button>
<div class="demo"><b>Demo credentials</b> (click to fill)<br>${DEMO_USERS.map(d=>`<button type="button" data-demo="${d.role}">${d.role[0].toUpperCase()+d.role.slice(1)}</button>`).join('')}<br>${DEMO_USERS.map(d=>`${d.user} / ${d.pass}`).join('<br>')}</div>
<p class="note"></p></form>
<form id="rp" hidden><h2>Reset password</h2><div><label for="re">Registered email</label><input id="re" type="email" required></div><div><label for="np">New password</label><input id="np" type="password" minlength="6" required></div><div><label for="cp">Confirm new password</label><input id="cp" type="password" minlength="6" required></div><div class="err" id="rerr" role="alert"></div><div class="row"><button class="btn">Reset password</button><button type="button" class="btn o" id="bk">Back to login</button></div><p class="note">Frontend demo only: no email is sent, and the new password is kept only for this browser session.</p></form></div></div>`;},
dashboard(){const s=cur(),a=Math.round(avg(s));
 if(isF()){const all=D.students.reduce((x,t)=>x+avg(t),0)/D.students.length,aa=Math.round(D.students.reduce((x,t)=>x+attAvg(t),0)/D.students.length);
  return `<div class="grid g4">${kpi('Total students',D.students.length,'Across 3 departments')}${kpi('Average marks',all.toFixed(1)+'%','Class average')}${kpi('Average attendance',aa+'%','Class average')}${kpi('Overall performance',perf(all)[0],'Class level')}</div>
  <div class="grid g2 mt"><div class="card"><h2>Performance overview</h2>${D.students.map(t=>`<div class="row" style="margin:9px 0"><span style="width:110px">${esc(t.name)}</span>${bar(Math.round(avg(t)))}<b>${Math.round(avg(t))}%</b></div>`).join('')}</div>
  <div class="card"><h2>Recent remarks</h2>${D.remarks.slice(0,3).map(r=>remItem(r,1)).join('')}</div></div>
  <div class="card mt"><h2>Quick access</h2><div class="qa"><a class="btn o" href="students.html">Student records</a><a class="btn o" href="marks.html">Enter marks</a><a class="btn o" href="attendance.html">Manage attendance</a><a class="btn o" href="remarks.html">Add remarks</a><a class="btn o" href="reports.html">Reports</a></div></div>`;}
 return `<div class="card"><div class="dl"><div><span>Student</span><b>${esc(s.name)}</b></div><div><span>ID</span>${s.id}</div><div><span>Department</span>${s.dept}</div><div><span>Year / Section</span>${s.year} / ${s.sec}</div></div></div>
 <div class="grid g4 mt">${kpi('Overall marks',a+'%','Grade '+grade(a))}${kpi('Attendance',attAvg(s)+'%',attSt(attAvg(s))[0])}${kpi('Overall performance',perf(a)[0],'Based on average marks')}${kpi('Subjects',SUBJECTS.length,s.dept+' · Year '+s.year)}</div>
 <div class="grid g2 mt"><div class="card"><h2>Performance trend</h2>${chart(s.trend)}</div><div class="card"><h2>Recent remarks</h2>${remarksOf(s.id).slice(0,3).map(r=>remItem(r)).join('')||'<p class="note">No remarks yet.</p>'}</div></div>
 <div class="card mt"><h2>Quick access</h2><div class="qa"><a class="btn o" href="marks.html">Marks</a><a class="btn o" href="attendance.html">Attendance</a><a class="btn" href="reports.html">View full report</a></div></div>`;},
students(){const f=isF(),L=f?D.students:[get(U.own)];
 return `${f?`<div class="ctl noprint" style="margin-bottom:14px"><input id="q" placeholder="Search by name, ID or email" aria-label="Search students" style="min-width:240px"><select id="fd" aria-label="Filter by department"><option value="">All departments</option>${[...new Set(D.students.map(s=>s.dept))].map(d=>`<option>${d}</option>`).join('')}</select></div>`:''}
 <div class="card tw"><table><thead><tr><th>Student ID</th><th>Name</th><th>Department</th><th>Year</th><th>Section</th><th>Email</th><th>Action</th></tr></thead><tbody id="tb">${rows(L)}</tbody></table></div>`;},
marks(){const s=cur(),f=isF(),a=Math.round(avg(s));
 return `${picker()?`<div style="margin-bottom:14px">${picker()}</div>`:''}<div class="card tw"><table><thead><tr><th>Student</th><th>Subject</th><th>Internal (30)</th><th>Final (70)</th><th>Total (100)</th><th>Grade</th></tr></thead><tbody>${SUBJECTS.map((n,i)=>{const m=s.marks[i];return `<tr><td>${esc(s.name)}</td><td>${n}</td><td>${f?`<input type="number" min="0" max="30" value="${m[0]}" data-m="${i}.0" aria-label="Internal ${n}">`:m[0]}</td><td>${f?`<input type="number" min="0" max="70" value="${m[1]}" data-m="${i}.1" aria-label="Final ${n}">`:m[1]}</td><td>${tot(m)}</td><td><span class="bg ok">${grade(tot(m))}</span></td></tr>`}).join('')}</tbody></table></div>
 <div class="grid g2 mt"><div class="card"><h3>Overall performance</h3><b style="font-size:24px">${a}% · Grade ${grade(a)}</b> ${badge(perf(a))}<p class="note">Average of ${SUBJECTS.length} subjects</p>${f?'<button class="btn" data-save="m">Save marks</button>':''}</div>
 <div class="card"><h3>Subject-wise performance</h3>${SUBJECTS.map((n,i)=>`<div class="row" style="margin:7px 0"><span style="width:140px;font-size:13px">${n}</span>${bar(tot(s.marks[i]))}<b>${tot(s.marks[i])}</b></div>`).join('')}</div></div>`;},
attendance(){const s=cur(),f=isF();
 return `${picker()?`<div style="margin-bottom:14px">${picker()}</div>`:''}<div class="card tw"><table><thead><tr><th>Student</th><th>Subject</th><th>Total classes</th><th>Classes attended</th><th>Attendance</th><th>Status</th></tr></thead><tbody>${SUBJECTS.map((n,i)=>{const a=s.att[i],p=attP(a);return `<tr><td>${esc(s.name)}</td><td>${n}</td><td>${f?`<input type="number" min="0" value="${a[0]}" data-t="${i}.0" aria-label="Total ${n}">`:a[0]}</td><td>${f?`<input type="number" min="0" value="${a[1]}" data-t="${i}.1" aria-label="Attended ${n}">`:a[1]}</td><td>${a[1]} / ${a[0]} = <b>${p}%</b></td><td>${badge(attSt(p))}</td></tr>`}).join('')}</tbody></table></div>
 <div class="card mt sb"><div><h3>Overall attendance</h3><b style="font-size:24px">${attAvg(s)}%</b> ${badge(attSt(attAvg(s)))}<p class="note">Good: 85% and above · Average: 75-84% · Low: below 75%</p></div>${f?'<button class="btn" data-save="a">Save attendance</button>':''}</div>`;},
remarks(){const s=cur(),f=isF(),L=f?D.remarks:remarksOf(s.id);
 return `<div class="grid g2">${f?`<form class="card" id="rf" style="display:grid;gap:12px;align-content:start"><h2>Add remark</h2><div><label for="rs0">Student</label><select id="rs0">${D.students.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></div><div><label for="rs">Subject</label><select id="rs">${SUBJECTS.map(n=>`<option>${n}</option>`).join('')}</select></div><div><label for="rt">Remark</label><textarea id="rt" rows="4" maxlength="300" required></textarea></div><button class="btn">Save remark</button></form>`:''}
 <div class="card"><h2>${f?'All remarks':'Remarks for '+esc(s.name)}</h2>${L.map(r=>remItem(r,f)).join('')||'<p class="note">No remarks have been added yet.</p>'}</div></div>`;},
reports(){const s=cur(),a=Math.round(avg(s)),L=remarksOf(s.id);
 return `<div class="ctl noprint" style="margin-bottom:14px;justify-content:space-between">${picker()||'<span></span>'}<button class="btn" data-print>Print Report</button></div>
 <div class="card rep"><div class="hd"><div><h2 style="margin:0">Student Report System</h2><span class="note">Consolidated academic report</span></div><div class="note">Grading: ${GRADING[grading].label}</div></div>
 <section style="margin-top:0"><h3>Student information</h3><div class="dl"><div><span>Name</span>${esc(s.name)}</div><div><span>Student ID</span>${s.id}</div><div><span>Department</span>${s.dept}</div><div><span>Year</span>${s.year}</div><div><span>Section</span>${s.sec}</div></div></section>
 <section><h3>Academic performance</h3><div class="tw"><table><thead><tr><th>Subject</th><th>Internal</th><th>Final</th><th>Total</th><th>Grade</th></tr></thead><tbody>${SUBJECTS.map((n,i)=>`<tr><td>${n}</td><td>${s.marks[i][0]}</td><td>${s.marks[i][1]}</td><td>${tot(s.marks[i])}/100</td><td>${grade(tot(s.marks[i]))}</td></tr>`).join('')}</tbody></table></div><p><b>Overall marks: ${a}% · Overall grade: ${grade(a)}</b></p></section>
 <section><h3>Attendance</h3><div class="tw"><table><thead><tr><th>Subject</th><th>Attended / Total</th><th>Status</th></tr></thead><tbody>${SUBJECTS.map((n,i)=>`<tr><td>${n}</td><td>${s.att[i][1]} / ${s.att[i][0]} = ${attP(s.att[i])}%</td><td>${badge(attSt(attP(s.att[i])))}</td></tr>`).join('')}</tbody></table></div><p><b>Overall attendance: ${attAvg(s)}%</b></p></section>
 <section><h3>Faculty remarks</h3>${L.map(r=>remItem(r)).join('')||'<p class="note">No remarks recorded.</p>'}</section>
 <section><h3>Performance</h3>${chart(s.trend)}<div class="dl"><div><span>Average marks</span><b>${a}%</b></div><div><span>Overall grade</span><b>${grade(a)}</b></div><div><span>Attendance</span><b>${attAvg(s)}%</b></div><div><span>Standing</span>${badge(perf(a))}</div></div></section></div>`;}};
function rows(L){return L.map(s=>`<tr><td>${s.id}</td><td>${esc(s.name)}</td><td>${s.dept}</td><td>${s.year}</td><td>${s.sec}</td><td>${esc(s.email)}</td><td><a class="btn s o" href="reports.html" data-view="${s.id}">View</a> ${isF()?`<button class="btn s" data-edit="${s.id}">Edit</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7">No students match.</td></tr>';}

// ---------- shell ----------
function shell(){const nav=[['dashboard','Dashboard'],['students','Student List'],['marks','Marks'],['attendance','Attendance'],['remarks','Remarks'],['reports','Reports']];
 const rn=U.role[0].toUpperCase()+U.role.slice(1);
 return `<nav aria-label="Main"><div class="brand">Student Report System</div>${nav.map(([k,l])=>`<a class="l ${page===k?'on':''}" href="${k}.html" ${page===k?'aria-current="page"':''}>${l}</a>`).join('')}<div class="sp"></div>
 <div class="prof"><div class="av">${esc(U.name.replace(/^(Dr\.|Prof\.|Parent of)\s*/,'')[0])}</div><div><b style="font-size:13px">${esc(U.name)}</b><br><span class="note">${rn}</span></div></div><a class="btn o s" href="index.html" data-logout>Logout</a></nav>
 <main><header class="top"><h1>${TITLES[page]}</h1><div class="ctl noprint"><label for="gs" style="margin:0">Grading</label><select id="gs">${Object.entries(GRADING).map(([k,g])=>`<option value="${k}" ${k===grading?'selected':''}>${g.label}</option>`).join('')}</select></div></header>${V[page]()}</main>`;}
root.innerHTML=page==='login'?V.login():shell();

// ---------- events ----------
const on=(ev,fn)=>document.addEventListener(ev,fn);
on('click',e=>{const t=e.target.closest('button,a');if(!t)return;const d=t.dataset;
 if(t.id==='fp'){e.preventDefault();$('lf').hidden=true;$('rp').hidden=false;return;}
 if(t.id==='bk'){$('rp').hidden=true;$('lf').hidden=false;return;}
 if(d.demo){const u=DEMO_USERS.find(x=>x.role===d.demo);$('u').value=u.user;$('pw').value=(JSON.parse(ss.getItem('srs_pw')||'{}')[u.user]||u.pass);$('rl').value=u.role;}
 if('logout'in d)ss.removeItem('srs_user');
 if(d.view){ss.setItem('srs_sid',d.view);}
 if('print'in d)print();
 if(d.edit){const s=get(d.edit),f=$('df');f.dataset.id=s.id;f.innerHTML=`<h2>Edit student</h2>${[['name','Name',s.name],['dept','Department',s.dept],['year','Year',s.year],['sec','Section',s.sec],['email','Email',s.email]].map(([k,l,v])=>`<div><label>${l}<input name="${k}" value="${esc(v)}" required></label></div>`).join('')}<div class="row"><button class="btn">Save changes</button><button class="btn o" type="button" id="dc">Cancel</button></div>`;$('dlg').showModal();}
 if(t.id==='dc')$('dlg').close();
 if(d.save){const s=cur(),m=d.save==='m';document.querySelectorAll(m?'[data-m]':'[data-t]').forEach(i=>{const[r,c]=(i.dataset.m||i.dataset.t).split('.');const v=Math.max(0,+i.value||0);const lim=m?(c==0?30:70):1e5;(m?s.marks:s.att)[r][c]=Math.min(v,lim);});
  if(!m)s.att.forEach(x=>{x[1]=Math.min(x[1],x[0])});save();location.reload();}});
const $=id=>document.getElementById(id);
on('change',e=>{if(e.target.id==='sp'){ss.setItem('srs_sid',e.target.value);location.reload();}if(e.target.id==='gs'){ss.setItem('srs_grading',e.target.value);location.reload();}if(e.target.id==='fd')filt();});
on('input',e=>{if(e.target.id==='q')filt();});
function filt(){const q=$('q').value.toLowerCase(),d=$('fd').value;$('tb').innerHTML=rows(D.students.filter(s=>(!d||s.dept===d)&&(s.name+s.id+s.email).toLowerCase().includes(q)));}
on('submit',e=>{const f=e.target;
 if(f.id==='lf'){e.preventDefault();const pws=JSON.parse(ss.getItem('srs_pw')||'{}');const u=DEMO_USERS.find(x=>x.role===$('rl').value&&x.user===$('u').value.trim()&&(pws[x.user]||x.pass)===$('pw').value);
  if(!u){$('err').style.color='';$('err').textContent='Invalid username, password or role. Please use one of the demo accounts.';return;}ss.setItem('srs_user',JSON.stringify(u));location.href='dashboard.html';}
 if(f.id==='rp'){e.preventDefault();const em=$('re').value.trim(),a=DEMO_USERS.find(x=>x.user===em),m=$('rerr');
 if(!a){m.textContent='No demo account found for this email.';return;}
 if($('np').value!==$('cp').value){m.textContent='Passwords do not match.';return;}
 const pws=JSON.parse(ss.getItem('srs_pw')||'{}');pws[a.user]=$('np').value;ss.setItem('srs_pw',JSON.stringify(pws));
 f.reset();m.textContent='';f.hidden=true;$('lf').hidden=false;$('err').style.color='#17653a';$('err').textContent='Password reset. Please log in with your new password.';}
 if(f.id==='rf'){e.preventDefault();D.remarks.unshift({sid:$('rs0').value,sub:$('rs').value,fac:U.name,date:new Date().toISOString().slice(0,10),text:$('rt').value.trim()});save();location.reload();}
 if(f.id==='df'){const s=get(f.dataset.id);['name','dept','year','sec','email'].forEach(k=>s[k]=f.elements[k].value);save();location.reload();}});
if(page!=='login'){root.insertAdjacentHTML('beforeend','<dialog id="dlg" style="border:1px solid #dde4e2;border-radius:8px;width:min(420px,92vw)"><form id="df" style="display:grid;gap:12px"></form></dialog>');}
