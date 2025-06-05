document.addEventListener('DOMContentLoaded', () => {
  const cells   = document.querySelectorAll('.mbti-cell');
  const saveBtn = document.querySelector('#save-btn');
  const hidden  = document.querySelector('#mbti-input');

  function updateButton() {
    const selected = document.querySelector('.mbti-cell.selected');
    hidden.value   = selected ? selected.dataset.type : '';
    const ready    = hidden.value !== '';
    saveBtn.disabled = !ready;
    saveBtn.classList.toggle('active', ready);
  }

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      cells.forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      updateButton();
    });
  });

  // 페이지 로드시 한 번 실행
  updateButton();
});
  