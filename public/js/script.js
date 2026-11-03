(() => {
  'use strict';

  // 1. Bootstrap 5 Form Validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      'submit',
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      },
      false
    );
  });

  // 2. Tax Toggle Switch on Homepage
  const taxSwitch = document.getElementById('taxSwitch');
  if (taxSwitch) {
    taxSwitch.addEventListener('change', () => {
      const basePrices = document.querySelectorAll('.base-price');
      const taxPrices = document.querySelectorAll('.tax-price');

      if (taxSwitch.checked) {
        basePrices.forEach((el) => el.classList.add('d-none'));
        taxPrices.forEach((el) => el.classList.remove('d-none'));
      } else {
        basePrices.forEach((el) => el.classList.remove('d-none'));
        taxPrices.forEach((el) => el.classList.add('d-none'));
      }
    });
  }

  // 3. Navbar scroll effect
  const navbar = document.querySelector('.luxury-navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
})();
