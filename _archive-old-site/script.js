(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var navContact = document.getElementById("navContact");
  var brand = document.querySelector(".brand");
  var heroEl = document.querySelector(".hero");

  var footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Shrink shadow subtly on scroll (glass reacts to scroll); on the hero
  // page this also flips the nav from light-on-dark to its normal dark-on-
  // light look once it scrolls past the dark hero video and onto the page.
  function updateNavScrolled() {
    var isScrolled = heroEl
      ? heroEl.getBoundingClientRect().bottom <= 80
      : window.scrollY > 8;
    nav.classList.toggle("scrolled", isScrolled);
    if (navContact) navContact.classList.toggle("scrolled", isScrolled);
    if (brand) brand.classList.toggle("scrolled", isScrolled);
  }
  updateNavScrolled();
  window.addEventListener("scroll", updateNavScrolled, { passive: true });

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
  }

  hamburger.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });

  // Close mobile menu when a link is tapped
  mobileMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  /* ---------- Campus photo (sticky scroll-pan reveal) ---------- */
  var campusPhoto = document.getElementById("campusPhoto");
  if (campusPhoto) {
    var campusImg = campusPhoto.querySelector(".campus-photo-img");
    var campusReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    var campusTicking = false;

    function updateCampusPhoto() {
      campusTicking = false;
      var rect = campusPhoto.getBoundingClientRect();
      var windowH = window.innerHeight;
      // 0 when the box first enters the viewport from the bottom,
      // 1 once it has fully exited past the top.
      var total = rect.height + windowH;
      var progress = (windowH - rect.top) / total;
      progress = Math.max(0, Math.min(1, progress));

      var maxShift = campusImg.offsetHeight - rect.height;
      if (maxShift > 0) {
        campusImg.style.transform =
          "translateY(-" + progress * maxShift + "px)";
      }
    }

    function requestCampusUpdate() {
      if (campusTicking) return;
      campusTicking = true;
      requestAnimationFrame(updateCampusPhoto);
    }

    if (campusImg.complete) {
      updateCampusPhoto();
    } else {
      campusImg.addEventListener("load", updateCampusPhoto);
    }

    if (!campusReduced) {
      window.addEventListener("scroll", requestCampusUpdate, {
        passive: true,
      });
      window.addEventListener("resize", requestCampusUpdate);
    }
  }

  /* ---------- Mentorship role tabs ---------- */
  var ocTabs = document.querySelectorAll(".oc-tab");
  var ocPanels = document.querySelectorAll(".oc-panel");
  ocTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var role = tab.getAttribute("data-role");
      ocTabs.forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", String(isActive));
      });
      ocPanels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-role") === role);
      });
    });
  });

  /* ---------- Experience timeline: per-entry description toggle ---------- */
  var tlToggles = document.querySelectorAll(".tl-toggle");
  tlToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var row = toggle.closest(".tl-row");
      var desc = row && row.querySelector(".tl-desc");
      if (!desc) return;
      var isActive = !toggle.classList.contains("active");
      toggle.classList.toggle("active", isActive);
      toggle.setAttribute("aria-expanded", String(isActive));
      desc.classList.toggle("active", isActive);
    });
  });

  /* ---------- Technical Skills: interactive node graph ---------- */
  var graphCanvas = document.getElementById("skillsGraph");
  if (graphCanvas) {
    var gctx = graphCanvas.getContext("2d");
    var gReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var GRAPH_MONO =
      "'IBM Plex Mono', 'Fira Code', ui-monospace, Menlo, monospace";

    var CAT_COLOR = {
      language: "#0066ff",
      framework: "#00d97e",
      domain: "#ff6b35",
      tool: "#8b5cf6",
    };
    var CAT_LABEL = {
      language: "Languages",
      framework: "Frameworks",
      domain: "Domains",
      tool: "Tools",
    };
    // Each category is seeded into its own quadrant so the graph settles
    // into four loose clusters rather than one undifferentiated blob.
    var CAT_ANGLE = {
      language: -Math.PI * 0.75,
      framework: -Math.PI * 0.25,
      domain: Math.PI * 0.25,
      tool: Math.PI * 0.75,
    };

    var SKILL_NODES = [
      ["python", "Python", "language"],
      ["cpp", "C++", "language"],
      ["r", "R", "language"],
      ["matlab", "MATLAB", "language"],
      ["sql", "SQL", "language"],
      ["java", "Java", "language"],
      ["js", "JavaScript", "language"],
      ["ts", "TypeScript", "language"],
      ["cuda", "CUDA", "language"],
      ["pytorch", "PyTorch", "framework"],
      ["tensorflow", "TensorFlow", "framework"],
      ["numpy", "NumPy", "framework"],
      ["pandas", "pandas", "framework"],
      ["sklearn", "scikit-learn", "framework"],
      ["react", "React", "framework"],
      ["scipy", "SciPy", "framework"],
      ["matplotlib", "Matplotlib", "framework"],
      ["jax", "JAX", "framework"],
      ["opencv", "OpenCV", "framework"],
      ["dl", "Deep Learning", "domain"],
      ["cv", "Computer Vision", "domain"],
      ["bayesian", "Bayesian Inference", "domain"],
      ["montecarlo", "Monte Carlo", "domain"],
      ["numerical", "Numerical Methods", "domain"],
      ["causal", "Causal Inference", "domain"],
      ["medical", "Medical Imaging", "domain"],
      ["nlp", "NLP", "domain"],
      ["rl", "Reinforcement Learning", "domain"],
      ["genai", "Generative AI", "domain"],
      ["optimization", "Optimization", "domain"],
      ["stats", "Statistics", "domain"],
      ["git", "Git", "tool"],
      ["linux", "Linux", "tool"],
      ["hpc", "HPC", "tool"],
      ["parallel", "Parallel Prog.", "tool"],
      ["webdev", "Web Dev", "tool"],
      ["bash", "Bash", "tool"],
      ["docker", "Docker", "tool"],
      ["aws", "AWS", "tool"],
      ["latex", "LaTeX", "tool"],
      ["jupyter", "Jupyter", "tool"],
      ["wandb", "W&B", "tool"],
    ].map(function (n) {
      return { id: n[0], label: n[1], category: n[2] };
    });

    var SKILL_LINKS = [
      ["python", "pytorch"], ["python", "tensorflow"], ["python", "numpy"],
      ["python", "pandas"], ["python", "sklearn"], ["python", "scipy"],
      ["python", "matplotlib"], ["python", "jax"],
      ["js", "ts"], ["js", "react"], ["ts", "react"], ["react", "webdev"],
      ["pytorch", "dl"], ["tensorflow", "dl"], ["jax", "dl"],
      ["dl", "cv"], ["dl", "medical"], ["dl", "nlp"], ["dl", "rl"],
      ["dl", "genai"],
      ["sklearn", "bayesian"], ["sklearn", "stats"],
      ["numpy", "numerical"], ["numpy", "montecarlo"],
      ["scipy", "optimization"], ["scipy", "numerical"],
      ["opencv", "cv"],
      ["bayesian", "causal"], ["bayesian", "montecarlo"], ["bayesian", "stats"],
      ["cv", "medical"], ["numerical", "montecarlo"], ["nlp", "genai"],
      ["optimization", "numerical"], ["stats", "causal"],
      ["rl", "optimization"],
      ["r", "bayesian"], ["r", "causal"], ["r", "stats"],
      ["matlab", "numerical"], ["matlab", "optimization"],
      ["cpp", "parallel"], ["cpp", "hpc"], ["cpp", "cuda"],
      ["cuda", "parallel"], ["cuda", "dl"],
      ["sql", "pandas"], ["java", "hpc"],
      ["linux", "bash"], ["linux", "hpc"], ["linux", "docker"],
      ["hpc", "parallel"], ["hpc", "aws"], ["git", "linux"],
      ["docker", "aws"],
      ["jupyter", "python"], ["jupyter", "matplotlib"],
      ["wandb", "pytorch"], ["wandb", "dl"], ["latex", "stats"],
    ].map(function (l) {
      return { source: l[0], target: l[1] };
    });

    var gNodes = [];
    var gById = {};
    var gAdj = {};
    var gW = 0;
    var gH = 0;
    var gMouse = { x: 0, y: 0 };
    var gHovered = null;
    var gDragged = null;
    var gSettle = 0;

    function gBuildAdjacency() {
      SKILL_LINKS.forEach(function (l) {
        (gAdj[l.source] || (gAdj[l.source] = [])).push(l.target);
        (gAdj[l.target] || (gAdj[l.target] = [])).push(l.source);
      });
    }

    function gLayout() {
      var cx = gW / 2;
      var cy = gH / 2;
      var base = Math.min(gW, gH) * 0.28;
      gNodes = SKILL_NODES.map(function (n) {
        var angle = CAT_ANGLE[n.category] + (Math.random() - 0.5) * 1.2;
        var dist = base + (Math.random() - 0.5) * base * 0.6;
        return {
          id: n.id,
          label: n.label,
          category: n.category,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          radius: n.label.length > 10 ? 42 : n.label.length > 6 ? 36 : 30,
        };
      });
      gById = {};
      gNodes.forEach(function (n) {
        gById[n.id] = n;
      });
      // With motion reduced the graph still settles, then holds still.
      gSettle = gReduced ? 240 : 0;
    }

    function gResize() {
      var w = graphCanvas.offsetWidth;
      var h = graphCanvas.offsetHeight;
      if (!w || !h) return;
      var dpr = window.devicePixelRatio || 1;
      graphCanvas.width = w * dpr;
      graphCanvas.height = h * dpr;
      gctx.setTransform(1, 0, 0, 1, 0, 0);
      gctx.scale(dpr, dpr);
      gW = w;
      gH = h;
      if (!gNodes.length) gLayout();
    }

    function gStep() {
      var cx = gW / 2;
      var cy = gH / 2;
      var i, j, k, dx, dy, d;

      for (i = 0; i < gNodes.length; i++) {
        var n = gNodes[i];
        if (n.id === gDragged) continue;
        var fx = 0;
        var fy = 0;

        // Inverse-square repulsion, scaled by how much room the pair needs.
        for (j = 0; j < gNodes.length; j++) {
          if (i === j) continue;
          var o = gNodes[j];
          dx = n.x - o.x;
          dy = n.y - o.y;
          d = Math.sqrt(dx * dx + dy * dy) || 1;
          var gap = n.radius + o.radius + 20;
          if (d < gap * 3) {
            var rep = (800 / (d * d)) * (gap / 50);
            fx += (dx / d) * rep;
            fy += (dy / d) * rep;
          }
        }

        // Springs pull linked skills toward a 120px rest length.
        var nbrs = gAdj[n.id];
        if (nbrs) {
          for (k = 0; k < nbrs.length; k++) {
            var t = gById[nbrs[k]];
            if (!t) continue;
            dx = t.x - n.x;
            dy = t.y - n.y;
            d = Math.sqrt(dx * dx + dy * dy) || 1;
            var spring = (d - 120) * 0.003;
            fx += (dx / d) * spring;
            fy += (dy / d) * spring;
          }
        }

        // Gentle pull to centre keeps the cloud from drifting apart.
        fx += (cx - n.x) * 0.0004;
        fy += (cy - n.y) * 0.0004;

        // Hovering nudges the surrounding nodes aside.
        if (gHovered && gHovered !== n.id) {
          dx = n.x - gMouse.x;
          dy = n.y - gMouse.y;
          d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < 120) {
            var push = (120 - d) * 0.008;
            fx += (dx / d) * push;
            fy += (dy / d) * push;
          }
        }

        n.vx = (n.vx + fx) * 0.85;
        n.vy = (n.vy + fy) * 0.85;
        n.x += n.vx;
        n.y += n.vy;

        var pad = n.radius + 10;
        if (n.x < pad) {
          n.x = pad;
          n.vx *= -0.5;
        }
        if (n.x > gW - pad) {
          n.x = gW - pad;
          n.vx *= -0.5;
        }
        if (n.y < pad) {
          n.y = pad;
          n.vy *= -0.5;
        }
        if (n.y > gH - pad) {
          n.y = gH - pad;
          n.vy *= -0.5;
        }
      }
    }

    function gDraw() {
      gctx.clearRect(0, 0, gW, gH);

      var connected = {};
      if (gHovered) {
        SKILL_LINKS.forEach(function (l) {
          if (l.source === gHovered) connected[l.target] = true;
          if (l.target === gHovered) connected[l.source] = true;
        });
      }

      var pulse = (Date.now() % 2000) / 2000;

      SKILL_LINKS.forEach(function (l) {
        var a = gById[l.source];
        var b = gById[l.target];
        if (!a || !b) return;
        var active =
          gHovered && (l.source === gHovered || l.target === gHovered);

        gctx.beginPath();
        gctx.moveTo(a.x, a.y);
        gctx.lineTo(b.x, b.y);
        gctx.strokeStyle = active
          ? CAT_COLOR[a.category] + "80"
          : gHovered
          ? "rgba(200,200,210,0.08)"
          : "rgba(200,200,210,0.2)";
        gctx.lineWidth = active ? 2 : 1;
        gctx.stroke();

        // A dot travels along each active edge to show the connection.
        if (active && !gReduced) {
          gctx.beginPath();
          gctx.arc(
            a.x + (b.x - a.x) * pulse,
            a.y + (b.y - a.y) * pulse,
            3,
            0,
            Math.PI * 2
          );
          gctx.fillStyle = CAT_COLOR[a.category] + "aa";
          gctx.fill();
        }
      });

      gNodes.forEach(function (n) {
        var isHot = n.id === gHovered;
        var isNear = !!connected[n.id];
        var isDim = gHovered && !isHot && !isNear;
        var color = CAT_COLOR[n.category];
        var r = isHot ? n.radius + 6 : n.radius;

        if (isHot) {
          var grad = gctx.createRadialGradient(
            n.x, n.y, r * 0.5,
            n.x, n.y, r * 2
          );
          grad.addColorStop(0, color + "30");
          grad.addColorStop(1, "transparent");
          gctx.beginPath();
          gctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
          gctx.fillStyle = grad;
          gctx.fill();
        }

        gctx.beginPath();
        gctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        gctx.fillStyle = isDim ? "#1a1a24" : "#13131d";
        gctx.fill();
        gctx.strokeStyle = isDim
          ? "rgba(200,200,210,0.1)"
          : isHot
          ? color
          : isNear
          ? color + "88"
          : "rgba(200,200,210,0.25)";
        gctx.lineWidth = isHot ? 2.5 : isNear ? 2 : 1;
        gctx.stroke();

        gctx.font =
          (isHot ? "600 12px " : "500 10px ") + GRAPH_MONO;
        gctx.textAlign = "center";
        gctx.textBaseline = "middle";
        gctx.fillStyle = isDim
          ? "rgba(200,200,210,0.2)"
          : isHot
          ? "#f0f0f5"
          : isNear
          ? "#d0d0dd"
          : "rgba(200,200,210,0.65)";
        gctx.fillText(n.label, n.x, n.y);

        if (isHot) {
          gctx.font = "500 9px " + GRAPH_MONO;
          gctx.fillStyle = color;
          gctx.fillText(
            CAT_LABEL[n.category].toUpperCase(),
            n.x,
            n.y + r + 14
          );
        }
      });
    }

    function gLoop() {
      if (!gReduced || gSettle > 0) {
        gStep();
        if (gSettle > 0) gSettle -= 1;
      }
      if (gDragged) {
        var d = gById[gDragged];
        if (d) {
          d.x += (gMouse.x - d.x) * 0.3;
          d.y += (gMouse.y - d.y) * 0.3;
          d.vx = 0;
          d.vy = 0;
        }
      }
      gDraw();
      requestAnimationFrame(gLoop);
    }

    function gPos(e) {
      var rect = graphCanvas.getBoundingClientRect();
      var pt = e.touches && e.touches[0] ? e.touches[0] : e;
      return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
    }

    function gHit(x, y) {
      for (var i = gNodes.length - 1; i >= 0; i--) {
        var n = gNodes[i];
        var dx = x - n.x;
        var dy = y - n.y;
        var reach = n.radius + 8;
        if (dx * dx + dy * dy < reach * reach) return n.id;
      }
      return null;
    }

    graphCanvas.addEventListener("mousemove", function (e) {
      gMouse = gPos(e);
      if (gDragged) return;
      gHovered = gHit(gMouse.x, gMouse.y);
    });
    graphCanvas.addEventListener("mousedown", function (e) {
      gMouse = gPos(e);
      var id = gHit(gMouse.x, gMouse.y);
      if (id) {
        gDragged = id;
        e.preventDefault();
      }
    });
    window.addEventListener("mouseup", function () {
      gDragged = null;
    });
    graphCanvas.addEventListener("mouseleave", function () {
      gHovered = null;
      gDragged = null;
    });

    graphCanvas.addEventListener(
      "touchstart",
      function (e) {
        gMouse = gPos(e);
        var id = gHit(gMouse.x, gMouse.y);
        gHovered = id;
        if (id) gDragged = id;
      },
      { passive: true }
    );
    graphCanvas.addEventListener(
      "touchmove",
      function (e) {
        gMouse = gPos(e);
      },
      { passive: true }
    );
    graphCanvas.addEventListener("touchend", function () {
      gDragged = null;
    });

    gBuildAdjacency();
    window.addEventListener("resize", gResize);
    gResize();
    requestAnimationFrame(gLoop);
  }

  /* ---------- Contact form (mailto, no backend) ---------- */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var details = document.getElementById("cf-details").value.trim();

      var subject = "Portfolio inquiry from " + (name || "website visitor");
      var bodyLines = [
        "Name: " + name,
        "Email: " + email,
        "",
        "Message:",
        details || "—",
      ];
      var mailto =
        "mailto:vondiessl@alumni.stanford.edu" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;
    });
  }

  /* ---------- Ventures & initiatives switcher ---------- */
  var ventItems = document.querySelectorAll(".vent-item");
  var ventPanels = document.querySelectorAll(".vent-panel");
  ventItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var idx = item.getAttribute("data-index");
      ventItems.forEach(function (it) {
        var isActive = it === item;
        it.classList.toggle("active", isActive);
        it.setAttribute("aria-selected", String(isActive));
      });
      ventPanels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-index") === idx);
      });
    });
  });

  /* ---------- Banner carousel (Teaching & Mentorship) ---------- */
  var bannerCarousel = document.getElementById("bannerCarousel");
  if (bannerCarousel) {
    var bannerSlides = bannerCarousel.querySelectorAll(".banner-carousel-img");
    var bannerDots = bannerCarousel.querySelectorAll(".banner-carousel-dot");
    var bannerReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    var bannerIndex = 0;
    var bannerTimer = null;

    function bannerShow(index) {
      bannerIndex = (index + bannerSlides.length) % bannerSlides.length;
      bannerSlides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === bannerIndex);
      });
      bannerDots.forEach(function (dot, i) {
        var isActive = i === bannerIndex;
        dot.classList.toggle("active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });
    }

    function bannerStart() {
      if (bannerReduced) return;
      bannerTimer = window.setInterval(function () {
        bannerShow(bannerIndex + 1);
      }, 4500);
    }

    function bannerRestart() {
      if (bannerTimer) window.clearInterval(bannerTimer);
      bannerStart();
    }

    bannerDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        bannerShow(Number(dot.getAttribute("data-index")));
        bannerRestart();
      });
    });

    bannerStart();
  }
})();
