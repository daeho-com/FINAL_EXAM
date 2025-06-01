console.log('create_account.js 로드됨');
// public/js/create_account.js
document.addEventListener('DOMContentLoaded', () => {
    const form         = document.querySelector('form.main_column');
    const textInputs   = form.querySelectorAll('.input');
    const genderRadios = form.querySelectorAll('input[name="gender"]');
    const nextBtn      = document.getElementById('nextBtn');
  
    function validateForm() {
      console.log('validateForm 호출됨');
      const allTextFilled = Array.from(textInputs)
        .every(input => input.value.trim() !== '');
      const genderSelected = Array.from(genderRadios)
        .some(radio => radio.checked);
      console.log({
        allTextFilled,
        genderSelected,
        disabledBefore: nextBtn.disabled
          });

      nextBtn.disabled = !(allTextFilled && genderSelected);
      console.log(' -> disabledAfter:', nextBtn.disabled);
    }
  
    textInputs.forEach(i => i.addEventListener('input', validateForm));
    genderRadios.forEach(r => r.addEventListener('change', validateForm));
    validateForm();
  
    nextBtn.addEventListener('click', event => {
      if (!nextBtn.disabled) {
        event.preventDefault();
        alert('완료되었습니다.');
        form.submit();
      }
    });
  });

