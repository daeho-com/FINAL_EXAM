document.addEventListener('DOMContentLoaded', () => {
    const purposeGroup = document.getElementById('study-purpose-group'); // 스터디 목적 버튼 그룹
    const atmosphereGroup = document.getElementById('study-atmosphere-group'); // 스터디 분위기 버튼 그룹

    const purposeHidden    = document.getElementById('hidden-purpose');
    const atmosphereHidden = document.getElementById('hidden-atmosphere');
    
    // user_style_prefs.ejs에 해당하는 ID로 변경해야 합니다.
    // 아래는 user_style_prefs.ejs에 맞춘 ID 예시입니다. 실제 EJS 파일의 ID를 확인해주세요.
    const speakingStyleGroup = document.getElementById('speaking-style-group'); 
    const envSensitivityGroup = document.getElementById('env-sensitivity-group');
    const charmPointInput = document.getElementById('charm-point');
    const strengthPointInput = document.getElementById('strength-point');

    // continueBtn ID도 일치시켜야 합니다.
    // study_prefs.ejs의 경우 'continue-btn'
    // user_style_prefs.ejs의 경우 'submit-style-prefs-btn'
    const continueBtn = document.getElementById('continue-btn');

    let purposeSelected = false; // study_prefs.ejs 용
    let atmosphereSelected = false; // study_prefs.ejs 용
    
    let speakingStyleSelected = false; // user_style_prefs.ejs 용
    let envSensitivitySelected = false; // user_style_prefs.ejs 용
    let charmPointEntered = false; // user_style_prefs.ejs 용
    let strengthPointEntered = false; // user_style_prefs.ejs 용

    function updateContinueButton() {
        // study_prefs 전용 로직: 목적과 분위기 둘 다 선택됐어야 활성화
        const allDone = purposeSelected && atmosphereSelected;

        if (continueBtn) {
            continueBtn.disabled = !allDone;
            continueBtn.classList.toggle('active', allDone);
        }
    }

    // 토글 그룹 셋업: 버튼 클릭 시 hidden input에 data-value 채워주고 플래그 설정
    function setupButtonGroup(groupElement, hiddenInput, flagUpdater) {
        if (!groupElement) return;
        const buttons = groupElement.querySelectorAll('.sel-btn');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // 1) 비활성화 해제
                buttons.forEach(btn => btn.classList.remove('active'));
                // 2) 현재 버튼만 활성
                button.classList.add('active');
                // 3) 히든 input에 data-value 저장
                hiddenInput.value = button.dataset.value;
                // 4) 플래그 true
                flagUpdater(true);

                updateContinueButton(); // "계속" 버튼 상태 업데이트
            });
        });
    }

    setupButtonGroup(
            purposeGroup,
            purposeHidden,
            v => purposeSelected = v
        );
    setupButtonGroup(
            atmosphereGroup,
            atmosphereHidden,
            v => atmosphereSelected = v
        );

    // user_style_prefs.ejs 관련 그룹 설정
    if (speakingStyleGroup) {
        setupButtonGroup(speakingStyleGroup, (value) => speakingStyleSelected = value);
    }
    if (envSensitivityGroup) {
        setupButtonGroup(envSensitivityGroup, (value) => envSensitivitySelected = value);
    }
    
    // user_style_prefs.ejs 텍스트 입력 필드 이벤트 리스너
    if (charmPointInput) {
        charmPointInput.addEventListener('input', () => {
            charmPointEntered = charmPointInput.value.trim() !== '';
            updateContinueButton();
        });
    }
    if (strengthPointInput) {
        strengthPointInput.addEventListener('input', () => {
            strengthPointEntered = strengthPointInput.value.trim() !== '';
            updateContinueButton();
        });
    }
    
    // 페이지 로드 시 "계속" 버튼 상태를 초기화 (아무것도 선택/입력되지 않았으므로 비활성화)
    updateContinueButton(); 

});