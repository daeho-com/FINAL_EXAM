document.addEventListener('DOMContentLoaded', () => {
  const modal    = document.getElementById('join-modal');
  const btnYes   = document.getElementById('modal-yes');
  const btnNo    = document.getElementById('modal-no');
  let targetRoom = null;

  // ① 방 항목 클릭 → 모달 띄우기
  document.querySelectorAll('.room-item').forEach(item => {
    item.addEventListener('click', () => {
      targetRoom = item.dataset.roomId;
      modal.classList.remove('hidden');
    });
  });

  // ② “예” 누르면 방으로 이동
  btnYes.addEventListener('click', () => {
    if (targetRoom) {
      window.location.href = `/video/${targetRoom}`;
    }
  });

  // ③ “아니오” 누르면 모달 닫기
  btnNo.addEventListener('click', () => {
    modal.classList.add('hidden');
    targetRoom = null;
  });
});