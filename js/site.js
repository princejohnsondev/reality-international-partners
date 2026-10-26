(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
    }
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  document.querySelectorAll("[data-slides]").forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll(".slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-dot]"));
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.classList.toggle("is-on", i === index); });
      dots.forEach(function (dot, i) { dot.classList.toggle("is-on", i === index); });
    }
    function play() {
      clearInterval(timer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timer = setInterval(function () { show(index + 1); }, 5200);
    }
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { show(index - 1); play(); });
    if (next) next.addEventListener("click", function () { show(index + 1); play(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); play(); });
    });
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
    root.addEventListener("mouseleave", play);
    var touchX = 0;
    root.addEventListener("touchstart", function (event) {
      touchX = event.changedTouches[0].clientX;
    }, { passive: true });
    root.addEventListener("touchend", function (event) {
      var delta = event.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) < 40) return;
      show(delta < 0 ? index + 1 : index - 1);
      play();
    }, { passive: true });
    show(0);
    play();
  });

  var dialog = document.querySelector("[data-resume]");
  if (dialog) {
    var photo = dialog.querySelector("[data-resume-photo]");
    var nameEl = dialog.querySelector("[data-resume-name]");
    var roleEl = dialog.querySelector("[data-resume-role]");
    var body = dialog.querySelector("[data-resume-body]");
    function openResume(id) {
      var source = document.getElementById("resume-" + id);
      var card = document.querySelector('[data-open-resume="' + id + '"]');
      if (!source || !card) return;
      photo.src = card.getAttribute("data-photo");
      photo.alt = card.getAttribute("data-name");
      nameEl.textContent = card.getAttribute("data-name");
      roleEl.textContent = card.getAttribute("data-role");
      body.innerHTML = source.innerHTML;
      if (!dialog.open) dialog.showModal();
    }
    document.querySelectorAll("[data-open-resume]").forEach(function (card) {
      card.addEventListener("click", function () {
        openResume(card.getAttribute("data-open-resume"));
      });
    });
    dialog.querySelector("[data-resume-close]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    var hash = location.hash.replace("#", "");
    if (hash) openResume(hash);
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if ("IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { seen.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  var thankCopy = document.querySelector("[data-thank-copy]");
  if (thankCopy) {
    var savedMail = "";
    try { savedMail = sessionStorage.getItem("rip-mail") || ""; } catch (err) {}
    if (savedMail) {
      thankCopy.textContent = "Thank you. Open the note so it reaches info@realityinternationalandpartners.com. If your email app does not open, write to that address and the firm will take it from there.";
      var mailLink = document.querySelector("[data-mail-link]");
      if (mailLink) {
        mailLink.href = savedMail;
        mailLink.hidden = false;
      }
      try { sessionStorage.removeItem("rip-mail"); } catch (err2) {}
    }
  }

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var message = String(data.get("message") || "").trim();
    var subject = String(data.get("subject") || "").trim();
    var error = form.querySelector("[data-form-error]");
    var note = form.querySelector("[data-form-note]");
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (name.length < 2 || !validEmail || !subject || message.length < 10) {
      error.hidden = false;
      error.textContent = "Add your name, a valid email, a subject, and a short message.";
      return;
    }
    error.hidden = true;
    note.hidden = true;

    var button = form.querySelector("button[type=submit]");
    button.disabled = true;

    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    })
      .then(function (response) { return response.json(); })
      .then(function (payload) {
        if (payload && payload.ok) {
          try { sessionStorage.removeItem("rip-mail"); } catch (err) {}
          window.location.href = "thank.html";
          return;
        }
        throw new Error("unavailable");
      })
      .catch(function () {
        var lines = [
          name,
          email,
          data.get("organisation") || "",
          data.get("phone") || "",
          subject,
          "",
          message
        ];
        var mail = "mailto:info@realityinternationalandpartners.com?subject=" +
          encodeURIComponent("Enquiry from " + name) +
          "&body=" +
          encodeURIComponent(lines.join("\n"));
        try { sessionStorage.setItem("rip-mail", mail); } catch (err) {}
        window.location.href = "thank.html";
      });
  });
})();
