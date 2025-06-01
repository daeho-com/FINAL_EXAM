// 스크립트가 <head>나 <body> 상단에 있어도, DOM이 준비된 뒤에야 로직이 실행되도록 보장합니다.
    // 체크박스가 있는 .cell-header 셀만 선택
    /*
    querySelectorAll 은 NodeList(유사 배열)를 반환하기 때문에,
    Array.from(...) 으로 일반 배열(Array)로 바꿔줍니다.

    그 뒤 .filter(...) 로 내부에 <input type="checkbox"> 가 있는 셀만 걸러낸 거예요.
    → 헤더(요일·시간) 셀은 체크박스가 없으니 제외됩니다.
    */ 
document.addEventListener('DOMContentLoaded', () => {
    const cells = Array.from(
      document.querySelectorAll('.timetable .cell-header')
    ).filter(cell => cell.querySelector('input[type="checkbox"]'));

    const saveBtn = document.querySelector('#save-btn');
      // 버튼 활성화 상태를 업데이트하는 함수
    function updateSaveButton() {
      // 선택된 셀(checkbox.checked === true) 이 하나라도 있으면
      const anySelected = cells.some(cell => {
        const cb = cell.querySelector('input[type="checkbox"]');
        return cb && cb.checked;
      });

      if (anySelected) {
        saveBtn.classList.add('active');
      } else {
        saveBtn.classList.remove('active');
      }
    }

    cells.forEach(cell => {
      // 클릭 시 selected 클래스 토글
      cell.addEventListener('click', () => {
        cell.classList.toggle('selected');
        // (선택 사항) 내부 checkbox 상태도 동기화
        const cb = cell.querySelector('input[type="checkbox"]');
        cb.checked = cell.classList.contains('selected');
      });
      cell.style.cursor = 'pointer';
    });

    // 1) 각 셀 클릭 시 버튼 상태도 업데이트하도록 이벤트 추가
    cells.forEach(cell => {
      cell.addEventListener('click', updateSaveButton);
    });

    // 2) 페이지 로드 직후에도 버튼 상태 초기화
    updateSaveButton();

    // 4) "계속" 버튼 클릭 시 이동할 주소 지정
    saveBtn.addEventListener('click', event => {
        event.preventDefault();
        if (!saveBtn.classList.contains('active')) return;
        // 선택된 슬롯 id들을 comma-separated로 추출
        const slots = cells
          .filter(cell => cell.classList.contains('selected'))
          .map(cell => {
            const cb = cell.querySelector('input[type="checkbox"]');
            return cb.id.replace('slot-', ''); // "1-1", "2-3" 등
          })
          .join(',');
        document.getElementById('slots-input').value = slots;
        document.getElementById('timetable-form').submit();
      });
  });

  /*
  이렇게 하면 나중에 폼 전송이나 JS로 값 읽을 때
  cb.checked 만 검사해도 “셀 클릭 여부”를 알 수 있어요.
  */ 