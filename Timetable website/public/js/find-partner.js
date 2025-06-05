document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;     // "mbti" 등
        const value  = btn.dataset.value;      // "INFP" 등
        const params = new URLSearchParams(window.location.search);
  
        if (params.get(filter) === value) {
          params.delete(filter);
        } else {
          params.set(filter, value);
        }
        params.set('minOverlap', params.get('minOverlap') || '1');
        window.location.search = params.toString();
      });
    });
  });