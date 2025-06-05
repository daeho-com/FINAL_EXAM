document.addEventListener('DOMContentLoaded', () => {
    // 1) 각 요소 가져오기
    const ageInput    = document.querySelector('#age');
    const gradeInput  = document.querySelector('#grade');
    const kakaoInput  = document.querySelector('#kakao');
  
    const confirmAge   = document.querySelector('#confirm-age');
    const confirmGrade = document.querySelector('#confirm-grade');
    const confirmKakao = document.querySelector('#confirm-kakao');
  
    const msgAge   = document.querySelector('#msg-age');
    const msgGrade = document.querySelector('#msg-grade');
    const msgKakao = document.querySelector('#msg-kakao');
  
    const smokeBtns = [document.querySelector('#smoke-no'), document.querySelector('#smoke-yes')];
    const meetBtns  = [document.querySelector('#meet-offline'), document.querySelector('#meet-online')];
  
    const smokingStatusInput = document.getElementById('smokingStatus');
    const meetPrefInput      = document.getElementById('meetPref');

    const saveBtn = document.querySelector('#save-btn');
  
    // 2) 입력 완료 여부 플래그
    let ageDone = false, gradeDone = false, kakaoDone = false;
    let smokeDone = false, meetDone = false;
  
    // 3) "계속" 버튼 활성화 체크 함수
    function updateSaveButton() {
      const allDone = ageDone && gradeDone && kakaoDone && smokeDone && meetDone;
      saveBtn.disabled = !allDone;
      saveBtn.classList.toggle('active', allDone);
    }
  
    // 4) "확인" 버튼 로직
    confirmAge.addEventListener('click', () => {
      if (ageInput.value.trim()) {
        ageDone = true;
        msgAge.textContent = '나이가 입력되었습니다';
      } else {
        ageDone = false;
        msgAge.textContent = '';
      }
      updateSaveButton();
    });
  
    confirmGrade.addEventListener('click', () => {
      if (gradeInput.value.trim()) {
        gradeDone = true;
        msgGrade.textContent = '학년이 입력되었습니다';
      } else {
        gradeDone = false;
        msgGrade.textContent = '';
      }
      updateSaveButton();
    });
  
    confirmKakao.addEventListener('click', () => {
      if (kakaoInput.value.trim()) {
        kakaoDone = true;
        msgKakao.textContent = '카카오톡 아이디가 입력되었습니다';
      } else {
        kakaoDone = false;
        msgKakao.textContent = '';
      }
      updateSaveButton();
    });

    confirmKakao.addEventListener('click', () => {
      if (kakaoInput.value.trim()) {
        kakaoDone = true;
        msgKakao.textContent = '기본 프로필 사진이 등록되었습니다';
      } else {
        kakaoDone = false;
        msgKakao.textContent = '';
      }
      updateSaveButton();
    });
  
    // 5) 토글 그룹 로직 (한 개만 선택)
    function setupToggle(buttons, hiddenInput, setterFlag) {
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active'); 
          hiddenInput.value = btn.dataset.value;
          // 실제로는 btn.id === 'smoke-yes' ? 'yes' : 'no'
          setterFlag(true);
          updateSaveButton();
        });
      });
    }
    setupToggle(smokeBtns, smokingStatusInput, v => smokeDone = v);
    setupToggle(meetBtns,  meetPrefInput,      v => meetDone  = v);
  
    // 6) 초기 상태 반영
    updateSaveButton();
  
  });
  