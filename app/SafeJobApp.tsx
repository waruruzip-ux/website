"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Job = {
  id: string; title: string; company: string; role: "health" | "safety" | "both";
  location: string; district: string; career: string; employment: string;
  workType: string; licenses: string[]; salary: string;
  posted: string; deadline: string; source: string; sourceUrl: string;
  isNew?: boolean; isUrgent?: boolean;
};

type KakaoMapPosition = object;
type KakaoMapsApi = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoMapPosition;
  Map: new (container: HTMLElement, options: { center: KakaoMapPosition; level: number }) => object;
  Marker: new (options: { map: object; position: KakaoMapPosition }) => object;
  services: {
    Geocoder: new () => {
      addressSearch: (address: string, callback: (result: Array<{ x: string; y: string }>, status: string) => void) => void;
    };
    Status: { OK: string };
  };
};

const KAKAO_MAP_KEY=process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY?.trim();
const KAKAO_MAP_ADDRESS="충남 천안시 서북구 광장로 215";
const KAKAO_MAP_SCRIPT_ID="kakao-map-sdk";

const saraminJob=(job:Omit<Job,"source"|"isNew"|"isUrgent">):Job=>({
  ...job,
  source:"사람인",
  isNew:job.posted.includes("26/08/20"),
  isUrgent:job.deadline.includes("내일"),
});

const jobs: Job[] = [
  saraminJob({id:"saramin-54767177",title:"유플러스홈서비스 보건관리자 채용",company:"(주)유플러스홈서비스",role:"health",location:"서울",district:"마포구",career:"경력",employment:"정규직",workType:"대졸↑",licenses:["보건관리자","책임간호사","QPS간호사"],salary:"급여 협의",posted:"등록일 26/08/18",deadline:"~ 09/17(목)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54767177"}),
  saraminJob({id:"saramin-54547754",title:"[울산/상여금465만/전환검토]중견기업 보건관리 사무보조 채용",company:"(주)엠제이코리아",role:"health",location:"울산",district:"북구",career:"경력무관",employment:"파견직",workType:"학력무관",licenses:["보건관리자","안전보건관리자","작업환경측정"],salary:"3,039만원",posted:"수정일 26/07/23",deadline:"내일마감",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54547754"}),
  saraminJob({id:"saramin-54763990",title:"우주사업부 순천사업장 보건관리 담당자 채용 (계약직)",company:"한화에어로스페이스(주)",role:"health",location:"전남",district:"순천시",career:"신입·경력",employment:"계약직",workType:"학력무관",licenses:["보건관리자","안전보건관리자","간호사"],salary:"급여 협의",posted:"수정일 26/08/20",deadline:"~ 08/31(월)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54763990"}),
  saraminJob({id:"saramin-54797641",title:"GS건설 순천그랜드파크자이 현장 보건관리자 채용",company:"지에스건설(주)",role:"health",location:"전남",district:"순천시",career:"경력무관",employment:"계약직",workType:"초대졸↑",licenses:["보건관리자","1군건설"],salary:"급여 협의",posted:"등록일 26/08/20",deadline:"~ 09/11(금)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54797641"}),
  saraminJob({id:"saramin-54770433",title:"아우디 고진모터스(주) 인사총무팀 보건관리자 사원급 채용",company:"고진모터스(주)",role:"health",location:"서울",district:"동대문구",career:"신입·경력",employment:"정규직",workType:"학력무관",licenses:["보건관리자","안전보건관리자","위험성평가"],salary:"급여 협의",posted:"등록일 26/08/18",deadline:"~ 09/17(목)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54770433"}),
  saraminJob({id:"saramin-54767236",title:"[서울반도체] 환경안전팀 보건관리자 채용",company:"서울반도체(주)",role:"health",location:"경기",district:"안산시 단원구",career:"경력2년↑",employment:"계약직",workType:"학력무관",licenses:["보건관리자","안전보건관리자","반도체"],salary:"급여 협의",posted:"수정일 26/08/18",deadline:"~ 09/17(목)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54767236"}),
  saraminJob({id:"saramin-54780234",title:"대방건설(주)부산에코2차 13BL 보건관리자 채용",company:"대방건설(주)",role:"health",location:"부산",district:"강서구",career:"경력무관",employment:"계약직",workType:"대졸↑",licenses:["보건관리자","건설회사"],salary:"급여 협의",posted:"등록일 26/08/19",deadline:"~ 09/18(금)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54780234"}),
  saraminJob({id:"saramin-54699937",title:"보건관리자 신입/경력 채용",company:"케이이티솔루션 주식회사",role:"health",location:"경기",district:"파주시",career:"경력무관",employment:"정규직",workType:"초대졸↑",licenses:["보건관리자","전자"],salary:"급여 협의",posted:"등록일 26/08/10",deadline:"~ 09/09(수)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54699937"}),
  saraminJob({id:"saramin-54766666",title:"서울 서초구 수장고 신축공사 안전관리자 및 보건관리자 채용",company:"(주)포스코이앤씨",role:"both",location:"서울",district:"서초구",career:"경력2년↑",employment:"계약직",workType:"고졸↑",licenses:["보건관리자","안전관리자","건설회사"],salary:"급여 협의",posted:"수정일 26/08/18",deadline:"채용시",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54766666"}),
  saraminJob({id:"saramin-54771137",title:"[인천백병원] 보건관리자 간호사를 모집합니다.",company:"(의)성수의료재단",role:"health",location:"인천",district:"제물포구",career:"경력무관",employment:"정규직",workType:"초대졸↑",licenses:["보건관리자","종합병원"],salary:"급여 협의",posted:"등록일 26/08/18",deadline:"~ 10/17(토)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54771137"}),
  saraminJob({id:"saramin-54741216",title:"(주)레인보우로보틱스 보건 관리",company:"(주)레인보우로보틱스",role:"health",location:"세종",district:"세종특별자치시",career:"경력5년↑",employment:"정규직",workType:"초대졸↑",licenses:["보건관리자","안전보건관리자","기계"],salary:"급여 협의",posted:"수정일 26/08/13",deadline:"채용시",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54741216"}),
  saraminJob({id:"saramin-54785011",title:"현대건설(주) 대전 현장 (안전)보건 관리자 보조 구인",company:"현대건설(주)",role:"both",location:"대전",district:"중구",career:"경력무관",employment:"기간제·계약직",workType:"학력무관",licenses:["보건관리자","안전사무업무보조","건설회사"],salary:"급여 협의",posted:"등록일 26/08/19",deadline:"~ 09/18(금)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54785011"}),
  saraminJob({id:"saramin-54547413",title:"다이소 안성물류센터 야간 보건관리자(간호사) 채용(추가모집)",company:"(주)아성다이소",role:"health",location:"경기",district:"안성시",career:"경력2년↑",employment:"계약직",workType:"초대졸↑",licenses:["보건관리자","간호사","작업환경측정"],salary:"4,500만원",posted:"등록일 26/07/23",deadline:"채용시",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54547413"}),
  saraminJob({id:"saramin-54780340",title:"[부산범천동주상복합] 주택사업 현장 보건관리자 계약직 채용",company:"에이치에스화성(주)",role:"health",location:"부산",district:"부산진구",career:"경력2년↑",employment:"계약직",workType:"초대졸↑",licenses:["보건관리자","안전보건관리자","건설회사"],salary:"급여 협의",posted:"등록일 26/08/19",deadline:"~ 09/18(금)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54780340"}),
  saraminJob({id:"saramin-54801474",title:"[부광약품] 보건관리자 계약직 채용",company:"부광약품㈜",role:"health",location:"서울",district:"동작구",career:"경력1년↑",employment:"계약직",workType:"대졸↑",licenses:["보건관리자","의약·제약"],salary:"급여 협의",posted:"수정일 26/08/20",deadline:"~ 08/28(금)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54801474"}),
  saraminJob({id:"saramin-54766507",title:"2026년 하반기 체험형 청년인턴 채용 (안전보건관리 지원)",company:"한국산업기술시험원",role:"both",location:"경남",district:"진주시",career:"경력무관",employment:"인턴직",workType:"학력무관",licenses:["보건관리자","안전보건관리자","사무보조"],salary:"급여 협의",posted:"수정일 26/08/18",deadline:"~ 08/28(금)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54766507"}),
  saraminJob({id:"saramin-54699845",title:"GM테크니컬센터코리아] 청라연구소 보건관리자 채용",company:"한국지엠(주)",role:"health",location:"인천",district:"서해구",career:"경력3년↑",employment:"기간제·계약직",workType:"대졸↑",licenses:["보건관리자","간호사","산업간호사"],salary:"급여 협의",posted:"등록일 26/08/10",deadline:"~ 09/16(수)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54699845"}),
  saraminJob({id:"saramin-54618659",title:"(주)에프에이모스트 본사 보건관리자 채용공고",company:"(주)에프에이모스트",role:"health",location:"서울",district:"영등포구",career:"경력무관",employment:"정규직",workType:"대졸↑",licenses:["보건관리자","작업환경측정","파견대행"],salary:"급여 협의",posted:"등록일 26/07/31",deadline:"~ 08/30(일)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54618659"}),
  saraminJob({id:"saramin-54786403",title:"[KCC건설] 남부내륙철도(김천~거제)4-1공구 현장 보건관리자",company:"(주)케이씨씨건설",role:"health",location:"경남",district:"합천군",career:"경력무관",employment:"기간제·계약직",workType:"초대졸↑",licenses:["보건관리자","건설회사","1군건설"],salary:"급여 협의",posted:"수정일 26/08/19",deadline:"~ 10/18(일)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54786403"}),
  saraminJob({id:"saramin-54656826",title:"(주) 미래보 환경안전팀 보건관리자 경력 모집",company:"(주)미래보",role:"health",location:"경기",district:"평택시",career:"경력2년↑",employment:"정규직",workType:"초대졸↑",licenses:["보건관리자","안전관리자","환경관리자"],salary:"급여 협의",posted:"등록일 26/08/05",deadline:"~ 10/04(일)",sourceUrl:"https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=54656826"}),
];

const roleLabel = { health:"보건관리자", safety:"안전관리자", both:"보건·안전" };
const regions = ["전체",...Array.from(new Set(jobs.map((job)=>job.location)))];
const careers = ["전체",...Array.from(new Set(jobs.map((job)=>job.career)))];
const employments = ["전체",...Array.from(new Set(jobs.map((job)=>job.employment)))];

export default function SafeJobApp() {
  const [query,setQuery]=useState(""); const [searchInput,setSearchInput]=useState("");
  const [role,setRole]=useState("전체"); const [region,setRegion]=useState("전체");
  const [career,setCareer]=useState("전체"); const [employment,setEmployment]=useState("전체");
  const [sort,setSort]=useState("최신순"); const [saved,setSaved]=useState<string[]>([]);
  const [savedOnly,setSavedOnly]=useState(false); const [filtersOpen,setFiltersOpen]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
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

  return <main>
    <header className="site-header"><div className="shell header-inner"><a className="brand" href="#top" aria-label="세이프잡 홈"><span className="brand-mark" aria-hidden="true">S</span><span>세이프잡</span></a><button className="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><span/><span/><span/></button><nav className={menuOpen?"open":""} aria-label="주요 메뉴"><a className="active" href="#jobs" onClick={()=>{setSavedOnly(false);setMenuOpen(false);}}>채용공고</a><button type="button" onClick={openSaved}>저장한 공고 <span className="saved-count">{saved.length}</span></button><a href="#about" onClick={()=>setMenuOpen(false)}>서비스 소개</a></nav></div></header>

    <section className="hero" id="top"><div className="hero-stars" aria-hidden="true"><i/><i/><i/><i/></div><div className="shell hero-inner"><div className="hero-copy"><span className="eyebrow light">보건·안전 직무 전문 채용 플랫폼</span><h1>당신의 전문성이<br/>더 안전한 내일을 만듭니다.</h1><p>흩어진 보건관리자·안전관리자 채용공고를 한곳에서 찾고,<br className="desktop-break"/> 자격과 근무 조건을 빠르게 비교하세요.</p><form className="search-box" onSubmit={submitSearch}><label className="sr-only" htmlFor="hero-search">채용공고 검색</label><span className="search-symbol" aria-hidden="true">⌕</span><input id="hero-search" value={searchInput} onChange={(e)=>setSearchInput(e.target.value)} placeholder="회사명, 지역, 자격증으로 검색"/><button type="submit">공고 찾기 <span aria-hidden="true">→</span></button></form><div className="popular-searches"><span>많이 찾는 검색어</span><button onClick={()=>{setSearchInput("보건관리자");setQuery("보건관리자");}} type="button">보건관리자</button><button onClick={()=>{setSearchInput("간호사");setQuery("간호사");}} type="button">간호사</button><button onClick={()=>setRegion("경기")} type="button">경기</button></div></div><aside className="hero-stat" aria-label="현재 채용 현황"><div className="stat-top"><span>현재 채용 현황</span><b>사람인 확인</b></div><strong>{jobs.length.toLocaleString("ko-KR")}</strong><p>원문 확인 완료 공고</p><div className="stat-bottom"><span><b>{newCount}</b> 최근 등록·수정</span><span><b>{jobs.length}</b> 전체 공고</span></div></aside></div></section>

    <section className="shell role-section"><div className="section-heading"><div><span className="eyebrow blue">직무별 공고</span><h2>어떤 기회를 찾고 있나요?</h2></div><button type="button" onClick={()=>chooseRole("전체")}>전체 공고 보기 <span aria-hidden="true">→</span></button></div><div className="role-grid"><button className="role-card health" type="button" onClick={()=>chooseRole("보건관리자")}><span className="role-icon" aria-hidden="true">＋</span><span className="role-text"><span>보건관리자</span><b>{healthCount}개</b><small>산업위생 · 간호 · 건강관리</small></span><span className="round-arrow" aria-hidden="true">→</span></button><button className="role-card safety" type="button" onClick={()=>chooseRole("안전관리자")}><span className="role-icon" aria-hidden="true">✓</span><span className="role-text"><span>안전관리자</span><b>{safetyCount}개</b><small>건설 · 제조 · 물류 · 시설</small></span><span className="round-arrow" aria-hidden="true">→</span></button></div></section>

    <section className="jobs-section" id="jobs"><div className="shell update-bar"><div><span className="status-dot"/><strong>사람인 공개 공고 확인</strong><span>2026.08.21 14:55 기준 첫 페이지</span></div><span>원문 링크를 확인한 실제 공고는 {jobs.length}개입니다.</span></div><div className="shell jobs-heading"><div><span className="eyebrow blue">맞춤 채용공고</span><h2>{savedOnly?"저장한 공고":query?`“${query}” 검색 결과`:"최신 채용공고"}</h2><p>{savedOnly?"이 브라우저에 저장한 공고만 모아봤어요.":"사람인 공개 검색 결과에서 확인한 공고를 조건에 맞게 찾아보세요."}</p></div><button className="filter-mobile" type="button" onClick={()=>setFiltersOpen(true)}>필터 <span aria-hidden="true">＋</span></button></div>
      <div className="shell jobs-layout"><aside className={`filters ${filtersOpen?"mobile-open":""}`} aria-label="채용공고 필터"><div className="filter-header"><strong>상세 필터</strong><button type="button" onClick={resetFilters}>전체 초기화</button><button className="filter-close" type="button" aria-label="필터 닫기" onClick={()=>setFiltersOpen(false)}>×</button></div><FilterGroup label="직군" value={role} options={["전체","보건관리자","안전관리자"]} onChange={setRole}/><FilterGroup label="지역" value={region} options={regions} onChange={setRegion}/><FilterGroup label="경력" value={career} options={careers} onChange={setCareer}/><FilterGroup label="고용형태" value={employment} options={employments} onChange={setEmployment}/><button className="apply-filter" type="button" onClick={()=>setFiltersOpen(false)}>선택 조건 적용하기</button></aside>{filtersOpen&&<button className="filter-backdrop" aria-label="필터 닫기" onClick={()=>setFiltersOpen(false)}/>}<div className="job-results"><div className="result-toolbar"><p>조건에 맞는 공고 <strong>{visibleJobs.length}건</strong></p><select aria-label="공고 정렬" value={sort} onChange={(e)=>setSort(e.target.value)}><option>최신순</option><option>마감 임박순</option></select></div><div className="active-filters">{[role,region,career,employment].filter((item)=>item!=="전체").map((item)=><span key={item}>{item}</span>)}{savedOnly&&<span>저장한 공고</span>}</div>
        {visibleJobs.length?<div className="job-list">{visibleJobs.map((job)=><article className="job-card" key={job.id}><div className="job-card-top"><div className="badges"><span className={`role-badge ${job.role}`}>{roleLabel[job.role]}</span>{job.isNew&&<span className="new-badge">NEW</span>}{job.isUrgent&&<span className="urgent-badge">마감 임박</span>}</div><button className={`bookmark ${saved.includes(job.id)?"saved":""}`} type="button" aria-label={saved.includes(job.id)?"저장 해제":"공고 저장"} onClick={()=>toggleSaved(job.id)}>{saved.includes(job.id)?"★":"☆"}</button></div><a className="job-open" href={job.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${job.title} 사람인 원문 열기`}><h3>{job.title}</h3><p className="company">{job.company}</p><div className="job-meta"><span>⌖ {job.location} {job.district}</span><span>{job.career}</span><span>{job.employment}</span><span>{job.workType}</span></div><div className="license-row">{job.licenses.map((license)=><span key={license}>{license}</span>)}</div><div className="job-bottom"><div><strong>{job.salary}</strong><span>{job.source} · {job.posted}</span></div><b className={job.isUrgent?"urgent-date":""}>{job.deadline} ↗</b></div></a></article>)}</div>:<div className="empty-state"><div aria-hidden="true">⌕</div><h3>조건에 맞는 공고가 없어요</h3><p>필터를 조금 줄이거나 다른 검색어를 입력해 보세요.</p><button type="button" onClick={resetFilters}>전체 공고 보기</button></div>}
      </div></div></section>

    <section className="shell source-note" id="about"><div className="source-icon" aria-hidden="true">✓</div><div><span className="eyebrow blue">확인된 채용정보</span><h2>사람인 원문으로 바로 연결합니다.</h2><p>2026년 8월 21일 14:55에 사람인 ‘보건관리자’ 공개 검색 첫 페이지를 확인했습니다. 공고 내용과 마감 여부는 원문에서 최종 확인해 주세요.</p></div><div className="source-points"><p><b>{jobs.length}개</b><span>현재 확인 공고</span></p><p><b>100%</b><span>사람인 원문 링크</span></p></div></section>
    <section className="shell location-section" id="location"><div className="location-heading"><span className="eyebrow blue">찾아오시는 길</span><h2>안전보건공단 충남지역본부</h2><p>천안 지역 산업안전보건 관련 상담과 지원을 받을 수 있는 안전보건공단 지역본부입니다.</p></div><div className="location-map-card"><KakaoMap/><div className="location-map-caption"><div><span>주소</span><address>충남 천안시 서북구 광장로 215<br/>충남경제종합지원센터 3층</address></div><a href="https://place.map.kakao.com/22988003" target="_blank" rel="noreferrer">카카오맵에서 크게 보기 <span aria-hidden="true">↗</span></a></div></div></section>
    <footer><div className="shell footer-grid"><div><a className="brand" href="#top"><span className="brand-mark">S</span><span>세이프잡</span></a><p>보건·안전 전문가의 더 나은 선택을 돕습니다.</p></div><div><strong>서비스</strong><a href="#jobs">채용공고</a><button type="button" onClick={openSaved}>저장한 공고</button></div><div><strong>안내</strong><a href="#about">서비스 소개</a><a href="#about">데이터 출처</a></div><div><strong>고객지원</strong><a href="mailto:hello@safejob.kr">정보 오류 신고</a><a href="mailto:hello@safejob.kr">문의하기</a></div></div><div className="shell footer-bottom"><span>© 2026 SafeJob. All rights reserved.</span><span>공고의 최종 정보는 원문에서 확인해 주세요.</span></div></footer>
    </main>;
}

function KakaoMap() {
  const mapRef=useRef<HTMLDivElement|null>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"fallback">(KAKAO_MAP_KEY?"loading":"fallback");

  useEffect(()=>{
    if(!KAKAO_MAP_KEY)return;

    let cancelled=false;
    const kakaoWindow=window as typeof window&{kakao?:{maps:KakaoMapsApi}};
    const showFallback=()=>{ if(!cancelled)setStatus("fallback"); };
    const initializeMap=()=>{
      const maps=kakaoWindow.kakao?.maps;
      if(!maps||!mapRef.current){ showFallback(); return; }
      maps.load(()=>{
        if(cancelled||!mapRef.current)return;
        const geocoder=new maps.services.Geocoder();
        geocoder.addressSearch(KAKAO_MAP_ADDRESS,(result,geocoderStatus)=>{
          if(cancelled||!mapRef.current)return;
          if(geocoderStatus!==maps.services.Status.OK||!result[0]){ showFallback(); return; }
          const center=new maps.LatLng(Number(result[0].y),Number(result[0].x));
          const map=new maps.Map(mapRef.current,{center,level:3});
          new maps.Marker({map,position:center});
          setStatus("ready");
        });
      });
    };

    if(kakaoWindow.kakao?.maps){ initializeMap(); return()=>{cancelled=true;}; }

    let script=document.getElementById(KAKAO_MAP_SCRIPT_ID) as HTMLScriptElement|null;
    let shouldAppend=false;
    if(!script){
      script=document.createElement("script");
      script.id=KAKAO_MAP_SCRIPT_ID;
      script.async=true;
      script.src=`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KAKAO_MAP_KEY)}&autoload=false&libraries=services`;
      shouldAppend=true;
    }
    script.addEventListener("load",initializeMap,{once:true});
    script.addEventListener("error",showFallback,{once:true});
    if(shouldAppend)document.head.appendChild(script);
    return()=>{
      cancelled=true;
      script?.removeEventListener("load",initializeMap);
      script?.removeEventListener("error",showFallback);
    };
  },[]);

  return <div className={`kakao-map-shell ${status==="ready"?"is-ready":""}`}><div ref={mapRef} className="kakao-map-canvas" aria-label="안전보건공단 충남지역본부 위치 지도"/>{status!=="ready"&&<a className="location-map-image" href="https://place.map.kakao.com/22988003" target="_blank" rel="noreferrer" aria-label="카카오맵에서 안전보건공단 충남지역본부 보기"><img src="https://staticmap.kakao.com/map/mapservice?FORMAT=PNG&SCALE=2.5&MX=524205&MY=916535&S=0&IW=504&IH=310&LANG=0&COORDSTM=WCONGNAMUL&logo=kakao_logo" width="504" height="310" alt="안전보건공단 충남지역본부 카카오맵"/></a>}{status==="loading"&&<span className="map-loading" role="status">지도를 불러오는 중…</span>}</div>;
}

function FilterGroup({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(value:string)=>void}) { return <fieldset className="filter-group"><legend>{label}</legend>{options.map((option)=><label key={option}><input type="radio" name={label} checked={value===option} onChange={()=>onChange(option)}/><span>{option}</span></label>)}</fieldset>; }
