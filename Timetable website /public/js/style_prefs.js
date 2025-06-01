document.addEventListener('DOMContentLoaded', () => {
    const speakingStyleGroup = document.getElementById('speaking-style-group');
    const envSensitivityGroup = document.getElementById('env-sensitivity-group');
    const charmPointInput = document.getElementById('charm-point');
    const strengthPointInput = document.getElementById('strength-point');
    const continueBtn = document.getElementById('submit-style-prefs-btn') || document.getElementById('continue-btn');

    // 새로 추가한 히든 필드들
    const hiddenSpeaking = document.getElementById('hidden-speaking-style');
    const hiddenEnv      = document.getElementById('hidden-env-sensitivity');
    const hiddenCharm    = document.getElementById('hidden-charm-point');
    const hiddenStrength = document.getElementById('hidden-strength-point');

    let speakingStyleSelected = false;
    let envSensitivitySelected = false;
    let charmPointEntered = false;
    let strengthPointEntered = false;

    function checkAllInputs() {
        charmPointEntered = charmPointInput.value.trim() !== '';
        strengthPointEntered = strengthPointInput.value.trim() !== '';
        return speakingStyleSelected && envSensitivitySelected && charmPointEntered && strengthPointEntered;
    }

    function updateContinueButton() {
        if (checkAllInputs()) {
            continueBtn.disabled = false;
            continueBtn.classList.add('active');
        } else {
            continueBtn.disabled = true;
            continueBtn.classList.remove('active');
        }
    }

    function setupButtonGroup(groupElement, hiddenInput, flagUpdater) {
        if (!groupElement) return;
        const buttons = groupElement.querySelectorAll('.sel-btn');
    
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // 1) 모든 버튼에서 active/disabled 해제
                buttons.forEach(b => {
                    b.classList.remove('active');
                });
                // 2) 클릭한 버튼만 active
                button.classList.add('active');
                // 3) 히든 필드에 data-value 저장
                hiddenInput.value = button.dataset.value;
                // 4) 플래그 true
                flagUpdater(true);
    
                // 5) 버튼 활성화 검사
                updateContinueButton();
            });
        });
    }
    
    // 페이지 로드 시 초기 선택 항목을 적용하는 부분을 제거했으므로, 
    // applyInitialSelections(); 호출을 삭제하거나 주석 처리합니다.

    // 각 버튼 그룹 설정
    setupButtonGroup(speakingStyleGroup, hiddenSpeaking,   v => speakingStyleSelected = v);
    setupButtonGroup(envSensitivityGroup, hiddenEnv,       v => envSensitivitySelected = v);

    charmPointInput.addEventListener('input', () => {
        hiddenCharm.value = charmPointInput.value.trim();
        charmPointEntered = hiddenCharm.value !== '';
        updateContinueButton();
    });

    strengthPointInput.addEventListener('input', () => {
        hiddenStrength.value = strengthPointInput.value.trim();
        strengthPointEntered = hiddenStrength.value !== '';
        updateContinueButton();
    });
    
    // 페이지 로드 시 "계속" 버튼 상태를 초기화합니다 (아무것도 선택되지 않았으므로 비활성화).
    updateContinueButton(); 

});