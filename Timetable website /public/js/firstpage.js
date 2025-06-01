document.addEventListener('DOMContentLoaded', () => {
    const agreeBtn    = document.querySelector('.btn2_agree');
    const primaryBtns = Array.from(document.querySelectorAll('.btn1_primary'));
  
    // ① 페이지 로드 직후 왼쪽 버튼 비활성화
    primaryBtns.forEach(btn => btn.disabled = true);
  
    agreeBtn.addEventListener('click', () => {
      // ② 동의 클릭 시 왼쪽 버튼 활성화 + 색 변경
      primaryBtns.forEach(btn => {
        btn.disabled = false;                   // 활성화
        btn.classList.add('active-green');      // 초록색 배경
      });
  
      // ③ 활성화된 버튼에 클릭 핸들러 부여 (이동할 경로 지정)
      //    순서대로: [0] 회원가입, [1] 로그인
      primaryBtns[0].addEventListener('click', () => {
        window.location.href = '/create_account';     // 실제 회원가입 URL로 변경
      });
      primaryBtns[1].addEventListener('click', () => {
        window.location.href = '/login';      // 실제 로그인 URL로 변경
      });
  
      // ④ 동의 버튼 → 하트 이미지로 교체
      const heart = document.createElement('img');
      heart.src       = '/img/Heart.png';
      heart.alt       = '❤️';
      heart.className = 'heart-image';
      agreeBtn.replaceWith(heart);
    });
  });