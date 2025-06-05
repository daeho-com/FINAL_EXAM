document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('send-letter-btn');
  if (!sendBtn) return;  // 페이지에 버튼이 없으면 종료

  sendBtn.addEventListener('click', async () => {
    // 1) 로그인 체크 (세션 유효성 검사 등 필요 시)
    // 2) receiverId 가져오기
    const receiverId = sendBtn.dataset.userId;
    
    // 3) POST 요청
    const res = await fetch('/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId })
    });
    const json = await res.json();
    
    // 4) 결과 처리
    if (json.success) {
      alert('📝 편지가 성공적으로 전송되었습니다!');
      // 목록 페이지로 이동
      location.href = '/letters';
    } else {
      alert('⚠️ 편지 전송 실패: ' + (json.error || 'Unknown error'));
    }
  });
});