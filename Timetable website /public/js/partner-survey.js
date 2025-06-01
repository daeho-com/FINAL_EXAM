// public/js/partner-survey.js
document.addEventListener('DOMContentLoaded', () => {
    // 1) 그룹 엘리먼트와 히든 필드 가져오기
    const groups = [
      { container: 'partner-smoking',      hidden: 'hidden-partner-smoking'      },
      { container: 'partner-meetPref',     hidden: 'hidden-partner-meetPref'     },
      { container: 'partner-study-purpose-group', hidden: 'hidden-partner-study-purpose' },
      { container: 'partner-study-atmosphere-group', hidden: 'hidden-partner-vibe_pref'  },
      { container: 'partner-speaking-style-group',  hidden: 'hidden-partner-speaking_style' },
      { container: 'partner-env-sensitivity-group', hidden: 'hidden-partner-noise_sensitivity' }
    ];
  
    // 2) 상태 플래그
    const state = {
      smoking: false,
      meetPref: false,
      studyGoal: false,
      vibePref: false,
      speakingStyle: false,
      noiseSensitivity: false
    };
  
    const continueBtn = document.getElementById('continue-btn');
  
    // 3) 버튼 활성화 체크
    function updateContinue() {
      const allDone = Object.values(state).every(v => v);
      continueBtn.disabled = !allDone;
      continueBtn.classList.toggle('active', allDone);
    }
  
    // 4) 토글 그룹 세팅 함수
    function setupGroup({ container, hidden }) {
      const wrap = document.getElementById(container);
      const input = document.getElementById(hidden);
      if (!wrap || !input) return;
  
      const buttons = wrap.querySelectorAll('.sel-btn');
      buttons.forEach(btn => {
        btn.type = 'button';           // 명시적으로 button
        btn.addEventListener('click', () => {
          // ① 모두 비활성화
          buttons.forEach(b => b.classList.remove('active'));
          // ② 클릭된 것만 활성
          btn.classList.add('active');
          // ③ 히든 필드에 값 채우기
          input.value = btn.dataset.value;
          // ④ state 플래그 on
          switch (container) {
            case 'partner-smoking':            state.smoking          = true; break;
            case 'partner-meetPref':           state.meetPref         = true; break;
            case 'partner-study-purpose-group':state.studyGoal        = true; break;
            case 'partner-study-atmosphere-group':state.vibePref      = true; break;
            case 'partner-speaking-style-group': state.speakingStyle   = true; break;
            case 'partner-env-sensitivity-group':state.noiseSensitivity = true; break;
          }
          // ⑤ 버튼 활성화 상태 갱신
          updateContinue();
        });
      });
    }
  
    // 5) 모든 그룹 연결
    groups.forEach(setupGroup);
  
    // 6) 초기 버튼 상태
    updateContinue();
  });