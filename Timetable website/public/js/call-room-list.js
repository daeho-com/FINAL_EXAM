// public/js/call-room_list.js
document.addEventListener('DOMContentLoaded', () => {
  // ■ 1) DOM 가져오기
  const listEl       = document.querySelector('.room-list');
  const joinModal    = document.getElementById('join-modal');
  const createModal  = document.getElementById('create-modal');
  const btnCreate    = document.getElementById('btn-create-room');
  const btnYes       = document.getElementById('modal-yes');
  const btnNo        = document.getElementById('modal-no');
  const btnCreateYes = document.getElementById('modal-create-yes');
  const btnCreateNo  = document.getElementById('modal-create-no');
  let   targetRoom   = null;

  // ■ 2) “방 만들기” 버튼 클릭 → 생성 모달 열기
  btnCreate.addEventListener('click', () => {
    createModal.classList.remove('hidden');
  });

  // ■ 3) 생성 모달 “생성” 클릭 → API 호출 → 목록에 LI 추가 → 모달 닫기
  btnCreateYes.addEventListener('click', async () => {
    const name = document.getElementById('new-room-name').value.trim();
    const cap  = document.getElementById('new-room-cap').value.trim();
    if (!name || !cap) {
      return alert('방 제목과 최대 인원을 모두 입력하세요.');
    }

    try {
      const res  = await fetch('/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: name, maxParticipants: cap })
      });
      const json = await res.json();

      if (json.success) {
        // 새 LI 생성
        const li = document.createElement('li');
        li.className        = 'room-item';
        li.dataset.roomId   = json.room.room_id;
        li.dataset.max      = json.room.max_participants;
        li.textContent      = `${json.room.room_name} (최대 ${json.room.max_participants}명)`;
        listEl.prepend(li);

        // 새로 추가된 LI 클릭 핸들러도 붙여 줍니다
        li.addEventListener('click', () => {
          targetRoom = li.dataset.roomId;
          joinModal.classList.remove('hidden');
        });

        createModal.classList.add('hidden');
      } else {
        alert('방 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('네트워크 오류로 방 생성에 실패했습니다.');
    }
  });

  // ■ 4) 생성 모달 “취소” 클릭 → 모달 닫기
  btnCreateNo.addEventListener('click', () => {
    createModal.classList.add('hidden');
  });

  // ■ 5) 이벤트 위임: “방 목록” 클릭 → 입장 확인 모달 열기
  listEl.addEventListener('click', e => {
    const item = e.target.closest('.room-item');
    if (!item) return;  // 목록 외부 클릭 무시
    targetRoom = item.dataset.roomId;
    joinModal.classList.remove('hidden');
  });

  // ■ 6) 입장 모달 “예” 클릭 → 해당 방 페이지로 이동
  btnYes.addEventListener('click', () => {
    if (targetRoom) {
      window.location.href = `/video/${targetRoom}`;
    }
  });

  // ■ 7) 입장 모달 “아니오” 클릭 → 모달 닫기
  btnNo.addEventListener('click', () => {
    joinModal.classList.add('hidden');
    targetRoom = null;
  });
});