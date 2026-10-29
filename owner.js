/* Number lookup only. Published sheet data must contain public work records only. */
(() => {
  const params = new URLSearchParams(location.search);
  if (!params.has('id')) return;
  const id = params.get('id').trim().toUpperCase();
  const esc = x => String(x || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = raw => {try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
  const booking = 'https://booking.naver.com/booking/10/bizes/1766161/items/8168409';
  document.title = '매장 청소 기록 | 세로';
  const robots=document.createElement('meta');robots.name='robots';robots.content='noindex';document.head.append(robots);
  const style=document.createElement('style');style.textContent='.owner{max-width:720px;margin:auto;padding:24px 18px}.owner article{padding:20px;border:1px solid #e6e8ec;border-radius:12px;margin:14px 0;background:white}.owner h1{font-size:28px}.owner h2{font-size:20px}.owner p{margin:10px 0}.owner .muted{color:#5c6470}.owner a{color:#015562}.owner .action{display:inline-block;padding:12px 18px;background:#015562;color:white;border-radius:8px;text-decoration:none;margin:8px 8px 8px 0}.owner .number{font-size:18px;font-weight:bold}.owner .row{display:flex;gap:12px;flex-wrap:wrap}.owner .row a{padding:8px 0}';document.head.append(style);
  document.body.innerHTML='<main class="owner"><a href="/">새것처럼, 세로</a><h1>우리 매장 청소 기록</h1><p class="number">관리번호 '+esc(id)+'</p><div id="owner-status" role="status">청소 기록을 불러오는 중입니다…</div><div id="owner-records"></div><p><a class="action" href="'+booking+'">청소 예약·문의</a><a href="/manage/">다른 번호 조회</a></p><p class="muted">스티커의 번호를 기준으로 확인하는 청소 기록입니다.</p></main>';
  const status=document.getElementById('owner-status');
  if(!/^S\d{3,10}$/.test(id)){status.textContent='관리번호 형식을 확인해 주세요. 예: S001';return}
  const dateValue = s => {const m=String(s||'').match(/(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/);if(!m)return 0;const d=new Date(+m[1],+m[2]-1,+m[3]);return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3]?d.getTime():0};
  const normalized = value => String(value||'').trim().toUpperCase();
  const recordID = r => normalized(r['관리번호']);
  const render = data => {
    if(!data.some(r=>Object.hasOwn(r,'관리번호'))){status.textContent='관리번호 연결을 준비 중입니다. 문의해 주시면 기록을 확인해 드립니다.';return}
    const rows=data.filter(r=>recordID(r)===id).sort((a,b)=>dateValue(b['날짜'])-dateValue(a['날짜']));
    if(!rows.length){status.textContent='등록된 청소 기록이 없습니다. 스티커 번호를 확인하거나 세로에 문의해 주세요.';return}
    const latest=rows[0];
    status.innerHTML='<article><h2>'+esc(latest['가게명'])+'</h2><p>최근 청소일 <strong>'+esc(latest['날짜']||'확인 중')+'</strong></p><p>누적 청소 기록 '+rows.length+'건</p></article><h2>청소 이력</h2>';
    document.getElementById('owner-records').innerHTML=rows.map(r=>{
      const video=safeURL(r['영상링크']); const match=video.match(/(?:shorts\/|v=|youtu\.be\/)([\w-]{11})/); const embed=match?'<iframe title="작업 영상" loading="lazy" style="display:block;width:100%;max-width:320px;aspect-ratio:9/16;border:0;margin-top:12px" src="https://www.youtube.com/embed/'+match[1]+'" allowfullscreen></iframe>':'';
      return '<article><h2>'+esc(r['날짜']||'날짜 확인 중')+'</h2><p>'+esc(r['작업'])+'</p>'+(r['장비명']?'<p class="muted">'+esc(r['장비명'])+'</p>':'')+'<div class="row">'+(video?'<a target="_blank" rel="noopener noreferrer" href="'+esc(video)+'">작업 영상 보기 ↗</a>':'')+'</div>'+embed+'</article>'
    }).join('');
  };
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  fetch(SHEET_CSV_URL+'&t='+Date.now(),{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('load');return r.text()}).then(t=>{if(/^\s*</.test(t))throw Error('not csv');render(parseCSV(t))}).catch(()=>{status.innerHTML='청소 기록을 불러오지 못했습니다. <button type="button" id="retry">다시 시도</button>';document.getElementById('retry').onclick=()=>location.reload()}).finally(()=>clearTimeout(timeout));
})();
