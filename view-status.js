(() => {
  'use strict';
  const endpoint = 'https://script.google.com/macros/s/AKfycbySe9CJP2TkwUUobdc5ooUMafX14HNPIJZWH3Fwf5LmY7E0hx3ltZkmj0cVxndwqsQ/exec';
  const sent = new Set();

  // 매장 기록을 화면에 정상 표시한 뒤에만 호출합니다.
  window.recordSeroStoreView = function (storeId) {
    const id = String(storeId ?? '').trim().toUpperCase();
    if (!/^S\d{3,10}$/.test(id) || sent.has(id)) return;
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) return;

    sent.add(id);
    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      keepalive: true,
      body: JSON.stringify({ id })
    }).catch(() => sent.delete(id));
  };
})();
