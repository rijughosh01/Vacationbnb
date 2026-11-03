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

// 4. Luxury Floating Toast Notification
window.showToast = function (message, type = "success") {
  let toastContainer = document.getElementById("luxury-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "luxury-toast-container";
    toastContainer.className = "luxury-toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `luxury-toast-item toast-${type} shadow-lg`;

  let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  if (type === "warning") iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
  if (type === "danger") iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
  if (type === "info") iconHtml = '<i class="fa-solid fa-heart-crack text-danger"></i>';

  toast.innerHTML = `${iconHtml} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 2600);
};

// 5. Persistent Wishlist / Favorites Toggle System
window.toggleWishlist = async function (event, listingId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const btn = event ? event.currentTarget : null;

  try {
    const res = await fetch(`/listings/${listingId}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      if (res.status === 401 && data.redirect) {
        showToast("Please log in to save to your wishlist", "warning");
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 1200);
        return;
      }
      showToast(data.message || "Failed to update wishlist", "danger");
      return;
    }

    // Success response: data = { success: true, inWishlist: Boolean, count: Number, message: String }
    if (btn) {
      // Case A: Index/Wishlist Card Heart Button
      if (btn.classList.contains("card-heart-btn")) {
        const icon = btn.querySelector("i");
        if (data.inWishlist) {
          btn.classList.add("active");
          btn.title = "Remove from wishlist";
          if (icon) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
          }
        } else {
          btn.classList.remove("active");
          btn.title = "Save to wishlist";
          if (icon) {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
          }
        }
      }

      // Case B: Show Page Save Button
      if (btn.id === "saveListingBtn" || btn.classList.contains("show-save-btn")) {
        const icon = btn.querySelector("i");
        const label = btn.querySelector(".btn-label");
        if (data.inWishlist) {
          btn.classList.add("btn-danger");
          btn.classList.remove("btn-outline-dark");
          if (icon) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
          }
          if (label) label.textContent = "Saved";
        } else {
          btn.classList.remove("btn-danger");
          btn.classList.add("btn-outline-dark");
          if (icon) {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
          }
          if (label) label.textContent = "Save";
        }
      }
    }

    // Case C: Smooth Card Removal on /wishlist page
    const cardCol = document.getElementById(`wishlist-card-${listingId}`);
    if (cardCol && !data.inWishlist) {
      cardCol.style.transition = "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      cardCol.style.opacity = "0";
      cardCol.style.transform = "scale(0.88)";
      setTimeout(() => {
        cardCol.remove();
        const remainingCards = document.querySelectorAll(".wishlist-item-card");
        const countBadge = document.getElementById("wishlistCountBadge");
        if (countBadge) {
          const count = remainingCards.length;
          countBadge.textContent = `${count} ${count === 1 ? 'stay' : 'stays'} saved`;
        }
        if (remainingCards.length === 0) {
          const emptyState = document.getElementById("wishlistEmptyState");
          if (emptyState) emptyState.classList.remove("d-none");
          const grid = document.getElementById("wishlistGrid");
          if (grid) grid.classList.add("d-none");
        }
      }, 350);
    }

    showToast(data.message, data.inWishlist ? "success" : "info");
  } catch (err) {
    console.error("Wishlist request error:", err);
    showToast("Network error. Please try again.", "danger");
  }
};
