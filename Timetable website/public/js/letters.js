document.addEventListener('DOMContentLoaded', () => {
  const detailEl = document.querySelector('.letter-detail');

  // ① .letter-item 모두 가져와서 각각 클릭 리스너 달기
  document.querySelectorAll('.letter-item').forEach(item => {
    item.addEventListener('click', async e => {
      // ★ 보낸 편지(out) + 대기중(pending)이면 무시
      const dir    = item.dataset.dir;    // 'in'| 'out'
      const status = item.dataset.status; // 'pending'|'accepted'|'rejected'
      if (dir === 'out' && status === 'pending') return;

      // ② 상세 불러오기
      const id = item.dataset.id;
      const res  = await fetch(`/letters/${id}`);
      const html = await res.text();
      detailEl.innerHTML = html;

      // ③ 아이콘 토글
      const icon    = detailEl.querySelector('.letter-icon');
      const content = detailEl.querySelector('.letter-content');
      icon.addEventListener('click', () => content.classList.toggle('hidden'));

      // ④ 수락/거절 버튼 바인딩
      detailEl.querySelector('.btn-accept')
        .addEventListener('click', () => handleAction(id, 'accept'));
      detailEl.querySelector('.btn-reject')
        .addEventListener('click', () => handleAction(id, 'reject'));
    });
  });

  async function handleAction(id, action) {
    const res  = await fetch(`/api/letters/${id}/${action}`, { method:'POST' });
    const json = await res.json();
    if (!json.success) return alert('오류 발생');

    // ⑤ 리스트 상태 업데이트
    const item = document.querySelector(`.letter-item[data-id="${id}"]`);
    item.dataset.status = json.status;
    const tag = document.createElement('span');
    tag.className = 'status-tag';
    tag.textContent = json.status==='accepted'
      ? '✅ 수락됨'
      : '❌ 거절됨';
    item.querySelector('.meta').appendChild(tag);

    // ⑥ 상세 영역에 결과 메시지 삽입 & 버튼 제거
    const actionsEl = detailEl.querySelector('.actions');
    const resultEl  = document.createElement('div');
    resultEl.className = `result-message ${action}`;
    resultEl.innerHTML = action==='accept'
      ? `<div class="result-accept"><p>🤝 수락되었습니다!</p></div>`
      : `<div class="result-reject"><p>😔 거절되었습니다.</p></div>`;
    detailEl.insertBefore(resultEl, actionsEl);
    actionsEl.remove();
  }
});