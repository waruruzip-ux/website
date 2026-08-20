"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";

type Job = {
  id: string; title: string; company: string; role: "health" | "safety" | "both";
  location: string; district: string; career: string; employment: string;
  workType: string; appointment: string; licenses: string[]; salary: string;
  posted: string; deadline: string; source: string; summary: string;
  responsibilities: string[]; requirements: string[]; isNew?: boolean; isUrgent?: boolean;
};

const jobs: Job[] = [];

const roleLabel = { health:"보건관리자", safety:"안전관리자", both:"보건·안전" };
const regions = ["전체","서울","경기","인천","충남","울산"];

export default function SafeJobApp() {
  const [query,setQuery]=useState(""); const [searchInput,setSearchInput]=useState("");
  const [role,setRole]=useState("전체"); const [region,setRegion]=useState("전체");
  const [career,setCareer]=useState("전체"); const [employment,setEmployment]=useState("전체");
  const [sort,setSort]=useState("최신순"); const [saved,setSaved]=useState<string[]>([]);
  const [savedOnly,setSavedOnly]=useState(false); const [filtersOpen,setFiltersOpen]=useState(false);
  const [selectedJob,setSelectedJob]=useState<Job|null>(null); const [menuOpen,setMenuOpen]=useState(false);
  const healthCount=jobs.filter((job)=>job.role==="health"||job.role==="both").length;
  const safetyCount=jobs.filter((job)=>job.role==="safety"||job.role==="both").length;
  const newCount=jobs.filter((job)=>job.isNew).length;

  useEffect(()=>{ try { setSaved(JSON.parse(localStorage.getItem("safejob:saved")||"[]")); } catch { setSaved([]); } },[]);
  useEffect(()=>{
    const url=new URL(window.location.href); ["q","role","region","career","employment","saved"].forEach((key)=>url.searchParams.delete(key));
    if(query)url.searchParams.set("q",query); if(role!=="전체")url.searchParams.set("role",role); if(region!=="전체")url.searchParams.set("region",region);
    if(career!=="전체")url.searchParams.set("career",career); if(employment!=="전체")url.searchParams.set("employment",employment); if(savedOnly)url.searchParams.set("saved","1");
    window.history.replaceState({},"",url);
  },[query,role,region,career,employment,savedOnly]);

  const visibleJobs=useMemo(()=>{
    const q=query.trim().toLowerCase();
    const result=jobs.filter((job)=>{
      const roleMatches=role==="전체"||roleLabel[job.role]===role||(job.role==="both"&&(role==="보건관리자"||role==="안전관리자"));
      const queryMatches=!q||[job.title,job.company,job.location,job.district,...job.licenses].join(" ").toLowerCase().includes(q);
      return roleMatches&&queryMatches&&(region==="전체"||job.location===region)&&(career==="전체"||job.career===career)&&(employment==="전체"||job.employment===employment)&&(!savedOnly||saved.includes(job.id));
    });
    return sort==="마감 임박순"?[...result].sort((a,b)=>Number(a.deadline.replace(/\D/g,""))-Number(b.deadline.replace(/\D/g,""))):result;
  },[query,role,region,career,employment,sort,savedOnly,saved]);

  const submitSearch=(event:FormEvent)=>{ event.preventDefault(); setQuery(searchInput.trim()); document.getElementById("jobs")?.scrollIntoView({behavior:"smooth"}); };
  const chooseRole=(nextRole:string)=>{ setRole(nextRole); setSavedOnly(false); document.getElementById("jobs")?.scrollIntoView({behavior:"smooth"}); };
  const toggleSaved=(id:string)=>setSaved((current)=>{ const next=current.includes(id)?current.filter((item)=>item!==id):[id,...current]; localStorage.setItem("safejob:saved",JSON.stringify(next)); return next; });
  const resetFilters=()=>{ setQuery("");setSearchInput("");setRole("전체");setRegion("전체");setCareer("전체");setEmployment("전체");setSavedOnly(false); };
  const openSaved=()=>{ setSavedOnly(true);setMenuOpen(false);document.getElementById("jobs")?.scrollIntoView({behavior:"smooth"}); };
  const handleCardKey=(event:KeyboardEvent<HTMLElement>,job:Job)=>{ if(event.key==="Enter")setSelectedJob(job); };

  return <main>
    <header className="site-header"><div className="shell header-inner"><a className="brand" href="#top" aria-label="세이프잡 홈"><span className="brand-mark" aria-hidden="true">S</span><span>세이프잡</span></a><button className="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><span/><span/><span/></button><nav className={menuOpen?"open":""} aria-label="주요 메뉴"><a className="active" href="#jobs" onClick={()=>{setSavedOnly(false);setMenuOpen(false);}}>채용공고</a><button type="button" onClick={openSaved}>저장한 공고 <span className="saved-count">{saved.length}</span></button><a href="#about" onClick={()=>setMenuOpen(false)}>서비스 소개</a></nav></div></header>

    <section className="hero" id="top"><div className="hero-stars" aria-hidden="true"><i/><i/><i/><i/></div><div className="shell hero-inner"><div className="hero-copy"><span className="eyebrow light">보건·안전 직무 전문 채용 플랫폼</span><h1>당신의 전문성이<br/>더 안전한 내일을 만듭니다.</h1><p>흩어진 보건관리자·안전관리자 채용공고를 한곳에서 찾고,<br className="desktop-break"/> 자격과 근무 조건을 빠르게 비교하세요.</p><form className="search-box" onSubmit={submitSearch}><label className="sr-only" htmlFor="hero-search">채용공고 검색</label><span className="search-symbol" aria-hidden="true">⌕</span><input id="hero-search" value={searchInput} onChange={(e)=>setSearchInput(e.target.value)} placeholder="회사명, 지역, 자격증으로 검색"/><button type="submit">공고 찾기 <span aria-hidden="true">→</span></button></form><div className="popular-searches"><span>많이 찾는 검색어</span><button onClick={()=>{setSearchInput("산업안전기사");setQuery("산업안전기사");}} type="button">산업안전기사</button><button onClick={()=>{setSearchInput("간호사");setQuery("간호사");}} type="button">간호사</button><button onClick={()=>setRegion("경기")} type="button">경기</button></div></div><aside className="hero-stat" aria-label="현재 채용 현황"><div className="stat-top"><span>현재 채용 현황</span><b>연동 대기</b></div><strong>{jobs.length.toLocaleString("ko-KR")}</strong><p>현재 연결된 실제 공고</p><div className="stat-bottom"><span><b>{newCount}</b> 오늘 새 공고</span><span><b>{jobs.length}</b> 전체 공고</span></div></aside></div></section>

    <section className="shell role-section"><div className="section-heading"><div><span className="eyebrow blue">직무별 공고</span><h2>어떤 기회를 찾고 있나요?</h2></div><button type="button" onClick={()=>chooseRole("전체")}>전체 공고 보기 <span aria-hidden="true">→</span></button></div><div className="role-grid"><button className="role-card health" type="button" onClick={()=>chooseRole("보건관리자")}><span className="role-icon" aria-hidden="true">＋</span><span className="role-text"><span>보건관리자</span><b>{healthCount}개</b><small>산업위생 · 간호 · 건강관리</small></span><span className="round-arrow" aria-hidden="true">→</span></button><button className="role-card safety" type="button" onClick={()=>chooseRole("안전관리자")}><span className="role-icon" aria-hidden="true">✓</span><span className="role-text"><span>안전관리자</span><b>{safetyCount}개</b><small>건설 · 제조 · 물류 · 시설</small></span><span className="round-arrow" aria-hidden="true">→</span></button></div></section>

    <section className="jobs-section" id="jobs"><div className="shell update-bar"><div><span className="status-dot pending"/><strong>공식 API 연동 대기</strong><span>승인된 데이터만 표시합니다.</span></div><span>현재 연결된 실제 공고는 {jobs.length}개입니다.</span></div><div className="shell jobs-heading"><div><span className="eyebrow blue">맞춤 채용공고</span><h2>{savedOnly?"저장한 공고":query?`“${query}” 검색 결과`:"최신 채용공고"}</h2><p>{savedOnly?"이 브라우저에 저장한 공고만 모아봤어요.":"검증된 출처의 최신 공고를 조건에 맞게 찾아보세요."}</p></div><button className="filter-mobile" type="button" onClick={()=>setFiltersOpen(true)}>필터 <span aria-hidden="true">＋</span></button></div>
      <div className="shell jobs-layout"><aside className={`filters ${filtersOpen?"mobile-open":""}`} aria-label="채용공고 필터"><div className="filter-header"><strong>상세 필터</strong><button type="button" onClick={resetFilters}>전체 초기화</button><button className="filter-close" type="button" aria-label="필터 닫기" onClick={()=>setFiltersOpen(false)}>×</button></div><FilterGroup label="직군" value={role} options={["전체","보건관리자","안전관리자"]} onChange={setRole}/><FilterGroup label="지역" value={region} options={regions} onChange={setRegion}/><FilterGroup label="경력" value={career} options={["전체","신입","경력","경력무관"]} onChange={setCareer}/><FilterGroup label="고용형태" value={employment} options={["전체","정규직","계약직"]} onChange={setEmployment}/><button className="apply-filter" type="button" onClick={()=>setFiltersOpen(false)}>선택 조건 적용하기</button></aside>{filtersOpen&&<button className="filter-backdrop" aria-label="필터 닫기" onClick={()=>setFiltersOpen(false)}/>}<div className="job-results"><div className="result-toolbar"><p>조건에 맞는 공고 <strong>{visibleJobs.length}건</strong></p><select aria-label="공고 정렬" value={sort} onChange={(e)=>setSort(e.target.value)}><option>최신순</option><option>마감 임박순</option></select></div><div className="active-filters">{[role,region,career,employment].filter((item)=>item!=="전체").map((item)=><span key={item}>{item}</span>)}{savedOnly&&<span>저장한 공고</span>}</div>
        {visibleJobs.length?<div className="job-list">{visibleJobs.map((job)=><article className="job-card" key={job.id} tabIndex={0} onKeyDown={(event)=>handleCardKey(event,job)}><div className="job-card-top"><div className="badges"><span className={`role-badge ${job.role}`}>{roleLabel[job.role]}</span>{job.isNew&&<span className="new-badge">NEW</span>}{job.isUrgent&&<span className="urgent-badge">마감 임박</span>}</div><button className={`bookmark ${saved.includes(job.id)?"saved":""}`} type="button" aria-label={saved.includes(job.id)?"저장 해제":"공고 저장"} onClick={()=>toggleSaved(job.id)}>{saved.includes(job.id)?"★":"☆"}</button></div><button className="job-open" type="button" onClick={()=>setSelectedJob(job)}><h3>{job.title}</h3><p className="company">{job.company}</p><div className="job-meta"><span>⌖ {job.location} {job.district}</span><span>{job.career}</span><span>{job.employment}</span><span>{job.workType}</span></div><div className="license-row">{job.licenses.map((license)=><span key={license}>{license}</span>)}</div><div className="job-bottom"><div><strong>{job.salary}</strong><span>{job.source} · {job.posted}</span></div><b className={job.isUrgent?"urgent-date":""}>{job.deadline}</b></div></button></article>)}</div>:<div className="empty-state"><div aria-hidden="true">⌕</div><h3>{jobs.length?"조건에 맞는 공고가 없어요":"공식 채용정보 연동을 준비하고 있어요"}</h3><p>{jobs.length?"필터를 조금 줄이거나 다른 검색어를 입력해 보세요.":"승인 전에는 샘플 공고나 임의의 숫자를 실제 정보처럼 표시하지 않습니다."}</p>{jobs.length?<button type="button" onClick={resetFilters}>전체 공고 보기</button>:<div className="empty-actions"><a href="https://www.saramin.co.kr/zf_user/search?searchword=%EB%B3%B4%EA%B1%B4%EA%B4%80%EB%A6%AC%EC%9E%90" target="_blank" rel="noreferrer">사람인에서 직접 보기 ↗</a><a href="https://www.jobkorea.co.kr/Search/?stext=%EB%B3%B4%EA%B1%B4%EA%B4%80%EB%A6%AC%EC%9E%90" target="_blank" rel="noreferrer">잡코리아에서 직접 보기 ↗</a></div>}</div>}
      </div></div></section>

    <section className="shell source-note" id="about"><div className="source-icon" aria-hidden="true">✓</div><div><span className="eyebrow blue">신뢰할 수 있는 채용정보</span><h2>승인된 출처만 정확하게 연결합니다.</h2><p>사람인·잡코리아 공식 API 승인 후 매일 0시와 12시에 갱신하고, 모든 공고에 원문 링크를 표시할 예정입니다.</p></div><div className="source-points"><p><b>2회</b><span>하루 갱신 예정</span></p><p><b>100%</b><span>원문 링크 원칙</span></p></div></section>
    <footer><div className="shell footer-grid"><div><a className="brand" href="#top"><span className="brand-mark">S</span><span>세이프잡</span></a><p>보건·안전 전문가의 더 나은 선택을 돕습니다.</p></div><div><strong>서비스</strong><a href="#jobs">채용공고</a><button type="button" onClick={openSaved}>저장한 공고</button></div><div><strong>안내</strong><a href="#about">서비스 소개</a><a href="#about">데이터 출처</a></div><div><strong>고객지원</strong><a href="mailto:hello@safejob.kr">정보 오류 신고</a><a href="mailto:hello@safejob.kr">문의하기</a></div></div><div className="shell footer-bottom"><span>© 2026 SafeJob. All rights reserved.</span><span>공고의 최종 정보는 원문에서 확인해 주세요.</span></div></footer>
    {selectedJob&&<JobDialog job={selectedJob} saved={saved.includes(selectedJob.id)} onSave={()=>toggleSaved(selectedJob.id)} onClose={()=>setSelectedJob(null)}/>} </main>;
}

function FilterGroup({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(value:string)=>void}) { return <fieldset className="filter-group"><legend>{label}</legend>{options.map((option)=><label key={option}><input type="radio" name={label} checked={value===option} onChange={()=>onChange(option)}/><span>{option}</span></label>)}</fieldset>; }

function JobDialog({job,saved,onSave,onClose}:{job:Job;saved:boolean;onSave:()=>void;onClose:()=>void}) {
  useEffect(()=>{ const close=(event:globalThis.KeyboardEvent)=>event.key==="Escape"&&onClose(); window.addEventListener("keydown",close); document.body.classList.add("dialog-open"); return()=>{window.removeEventListener("keydown",close);document.body.classList.remove("dialog-open");}; },[onClose]);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><section className="job-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="dialog-close" type="button" onClick={onClose} aria-label="상세 닫기">×</button><div className="dialog-badges"><span className={`role-badge ${job.role}`}>{roleLabel[job.role]}</span><span>{job.source}</span></div><h2 id="dialog-title">{job.title}</h2><p className="dialog-company">{job.company} · {job.location} {job.district}</p><div className="dialog-summary">{job.summary}</div><dl><div><dt>고용형태</dt><dd>{job.employment}</dd></div><div><dt>경력</dt><dd>{job.career}</dd></div><div><dt>근무형태</dt><dd>{job.workType}</dd></div><div><dt>선임 여부</dt><dd>{job.appointment}</dd></div><div><dt>급여</dt><dd>{job.salary}</dd></div><div><dt>마감</dt><dd>{job.deadline}</dd></div></dl><div className="dialog-columns"><div><h3>주요 업무</h3><ul>{job.responsibilities.map((item)=><li key={item}>{item}</li>)}</ul></div><div><h3>지원 요건</h3><ul>{job.requirements.map((item)=><li key={item}>{item}</li>)}</ul></div></div><p className="data-notice">세이프잡은 탐색에 필요한 요약 정보를 제공합니다. 지원 전 원문 공고를 확인해 주세요.</p><div className="dialog-actions"><button className={`dialog-save ${saved?"saved":""}`} type="button" onClick={onSave}>{saved?"★ 저장됨":"☆ 공고 저장"}</button><a href="https://www.work24.go.kr" target="_blank" rel="noreferrer">원문에서 지원하기 <span aria-hidden="true">↗</span></a></div></section></div>;
}
