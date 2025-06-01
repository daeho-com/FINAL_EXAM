document.addEventListener('DOMContentLoaded', () => {
    const cells   = document.querySelectorAll('.mbti-cell');
    const saveBtn = document.querySelector('#save-btn');
    const hidden  = document.querySelector('#mbti-input');
  
    function updateButton() {
      // 선택된 .mbti-cell 요소가 있는지 확인
      const selected = document.querySelector('.mbti-cell.selected');
      hidden.value   = selected ? selected.dataset.type : '';
      
      // hidden.value가 비어 있지 않아야 버튼 활성화
      const ready    = hidden.value !== '';
      saveBtn.disabled = !ready;
      saveBtn.classList.toggle('active', ready);
    }
  
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        // 기존에 선택된 셀은 클래스 제거
        cells.forEach(c => c.classList.remove('selected'));
        // 클릭한 셀에만 selected 클래스 추가
        cell.classList.add('selected');
        updateButton();
      });
    });
  
    // 페이지 로드 시 한 번 실행해서 버튼 상태 초기화
    updateButton();
  });