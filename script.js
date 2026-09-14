// Hero entrance: reveal the masthead once the page has painted. Kept as the
// very first thing that runs so a later error can't leave the hero stuck
// at opacity:0.
(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => hero.classList.add("is-loaded"));
  });
})();

// Mobile navigation: hamburger toggle with a full-screen link overlay.
(() => {
  const button = document.getElementById("hamburger");
  const menu = document.getElementById("mobile-menu");
  if (!button || !menu) return;

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("nav-open", open);
  };

  button.addEventListener("click", () => {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
})();

// Spotlight hover: a soft glow that tracks the cursor across cards.
(() => {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.querySelectorAll(".spotlight").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
      el.classList.add("spotlight-active");
    });
    el.addEventListener("mouseleave", () => {
      el.classList.remove("spotlight-active");
    });
  });
})();

// Magnetic buttons: small circular controls pull gently toward the cursor.
(() => {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const strength = 0.35;
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transition = "transform 0.05s linear";
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
      el.style.transform = "translate(0, 0)";
    });
  });
})();

document.querySelectorAll(".cv-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest(".cv-row");
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    row.classList.toggle("is-open", !isOpen);
  });
});

document.querySelectorAll(".flip-btn").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".flip-card").classList.toggle("is-flipped");
  });
});

// Project detail popups: click a card to open its modal, close via the
// close button, backdrop click, or Escape.
(() => {
  let openModal = null;

  const closeModal = () => {
    if (!openModal) return;
    openModal.classList.remove("is-open");
    openModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    openModal = null;
  };

  document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modal = document.getElementById(trigger.dataset.modalOpen);
      if (!modal) return;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      openModal = modal;
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
})();

// Scroll-spy: highlight the nav link for the last tracked section whose
// top has been scrolled past. Robust to gaps (sections not in the nav,
// like Education or Ventures, sitting between tracked sections) since it
// doesn't depend on a section currently intersecting a narrow band.
(() => {
  const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
  // Sort by actual document position, not nav link order: the nav lists
  // "Projects" before "About", but the About (Experience) section sits
  // higher on the page than Projects (Engineering).
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  if (!sections.length) return;

  const NAV_OFFSET = 110;
  let ticking = false;

  const updateActive = () => {
    const scrollPos = window.scrollY + NAV_OFFSET;
    let current = sections[0];
    for (const section of sections) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= scrollPos) current = section;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActive);
    },
    { passive: true }
  );

  updateActive();
})();

// Scroll reveal: fade + rise elements into place as they enter the viewport.
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const selector = [
    ".section-heading",
    ".research-card",
    ".eng-card",
    ".flip-card",
    ".cv-row",
    ".skills-panel",
    ".degree-plain",
    ".teaching-banner",
    ".venture-intro",
    ".business-card",
  ].join(", ");

  const targets = Array.from(document.querySelectorAll(selector));
  if (!targets.length) return;

  const stagger = new Map();
  targets.forEach((el) => {
    el.classList.add("reveal");
    const parent = el.parentElement;
    const index = stagger.get(parent) || 0;
    el.style.transitionDelay = `${Math.min(index, 4) * 70}ms`;
    stagger.set(parent, index + 1);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
})();

// Technical skills: interactive force-directed node graph (canvas), ported
// from the main site's Technical Skills & Background section. Colors are
// remapped from that page's dark-panel palette to this page's light one --
// everything else (node/link data, physics, drag/hover) is unchanged.
(() => {
  const graphCanvas = document.getElementById("skillsGraph");
  if (!graphCanvas) return;

  const gctx = graphCanvas.getContext("2d");
  const gReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GRAPH_MONO = "'IBM Plex Mono', 'Fira Code', ui-monospace, Menlo, monospace";

  // Matches the three research-card palettes (orange/green/blue), plus a
  // purple mixed to sit in the same family for the fourth category.
  const CAT_COLOR = {
    language: "#FFA45B",
    framework: "#91B58A",
    domain: "#8AB6FF",
    tool: "#B79AE0",
  };
  const CAT_LABEL = {
    language: "Languages",
    framework: "Frameworks",
    domain: "Domains",
    tool: "Tools & Practice",
  };
  // Each category is seeded into its own quadrant so the graph settles
  // into four loose clusters rather than one undifferentiated blob.
  const CAT_ANGLE = {
    language: -Math.PI * 0.75,
    framework: -Math.PI * 0.25,
    domain: Math.PI * 0.25,
    tool: Math.PI * 0.75,
  };

  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgba = (hex, alpha) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const SKILL_NODES = [
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
  ].map((n) => ({ id: n[0], label: n[1], category: n[2] }));

  const SKILL_LINKS = [
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
  ].map((l) => ({ source: l[0], target: l[1] }));

  let gNodes = [];
  let gById = {};
  const gAdj = {};
  let gW = 0;
  let gH = 0;
  let gMouse = { x: 0, y: 0 };
  let gHovered = null;
  let gDragged = null;
  let gSettle = 0;

  const gBuildAdjacency = () => {
    SKILL_LINKS.forEach((l) => {
      (gAdj[l.source] || (gAdj[l.source] = [])).push(l.target);
      (gAdj[l.target] || (gAdj[l.target] = [])).push(l.source);
    });
  };

  const gLayout = () => {
    const cx = gW / 2;
    const cy = gH / 2;
    const base = Math.min(gW, gH) * 0.28;
    gNodes = SKILL_NODES.map((n) => {
      const angle = CAT_ANGLE[n.category] + (Math.random() - 0.5) * 1.2;
      const dist = base + (Math.random() - 0.5) * base * 0.6;
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
    gNodes.forEach((n) => {
      gById[n.id] = n;
    });
    // With motion reduced the graph still settles, then holds still.
    gSettle = gReduced ? 240 : 0;
  };

  const gResize = () => {
    const w = graphCanvas.offsetWidth;
    const h = graphCanvas.offsetHeight;
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    graphCanvas.width = w * dpr;
    graphCanvas.height = h * dpr;
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.scale(dpr, dpr);
    gW = w;
    gH = h;
    if (!gNodes.length) gLayout();
  };

  const gStep = () => {
    const cx = gW / 2;
    const cy = gH / 2;

    for (let i = 0; i < gNodes.length; i++) {
      const n = gNodes[i];
      if (n.id === gDragged) continue;
      let fx = 0;
      let fy = 0;

      // Inverse-square repulsion, scaled by how much room the pair needs.
      for (let j = 0; j < gNodes.length; j++) {
        if (i === j) continue;
        const o = gNodes[j];
        const dx0 = n.x - o.x;
        const dy0 = n.y - o.y;
        const d0 = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
        const gap = n.radius + o.radius + 20;
        if (d0 < gap * 3) {
          const rep = (800 / (d0 * d0)) * (gap / 50);
          fx += (dx0 / d0) * rep;
          fy += (dy0 / d0) * rep;
        }
      }

      // Springs pull linked skills toward a 120px rest length.
      const nbrs = gAdj[n.id];
      if (nbrs) {
        for (let k = 0; k < nbrs.length; k++) {
          const t = gById[nbrs[k]];
          if (!t) continue;
          const dx1 = t.x - n.x;
          const dy1 = t.y - n.y;
          const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
          const spring = (d1 - 120) * 0.003;
          fx += (dx1 / d1) * spring;
          fy += (dy1 / d1) * spring;
        }
      }

      // Gentle pull to centre keeps the cloud from drifting apart.
      fx += (cx - n.x) * 0.0004;
      fy += (cy - n.y) * 0.0004;

      // Hovering nudges the surrounding nodes aside.
      if (gHovered && gHovered !== n.id) {
        const dx2 = n.x - gMouse.x;
        const dy2 = n.y - gMouse.y;
        const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
        if (d2 < 120) {
          const push = (120 - d2) * 0.008;
          fx += (dx2 / d2) * push;
          fy += (dy2 / d2) * push;
        }
      }

      n.vx = (n.vx + fx) * 0.85;
      n.vy = (n.vy + fy) * 0.85;
      n.x += n.vx;
      n.y += n.vy;

      const pad = n.radius + 10;
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
  };

  const gDraw = () => {
    gctx.clearRect(0, 0, gW, gH);

    const connected = {};
    if (gHovered) {
      SKILL_LINKS.forEach((l) => {
        if (l.source === gHovered) connected[l.target] = true;
        if (l.target === gHovered) connected[l.source] = true;
      });
    }

    const pulse = (Date.now() % 2000) / 2000;

    SKILL_LINKS.forEach((l) => {
      const a = gById[l.source];
      const b = gById[l.target];
      if (!a || !b) return;
      const active = gHovered && (l.source === gHovered || l.target === gHovered);

      gctx.beginPath();
      gctx.moveTo(a.x, a.y);
      gctx.lineTo(b.x, b.y);
      gctx.strokeStyle = active
        ? rgba(CAT_COLOR[a.category], 0.5)
        : gHovered
        ? "rgba(18,18,18,0.05)"
        : "rgba(18,18,18,0.14)";
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
        gctx.fillStyle = rgba(CAT_COLOR[a.category], 0.67);
        gctx.fill();
      }
    });

    gNodes.forEach((n) => {
      const isHot = n.id === gHovered;
      const isNear = !!connected[n.id];
      const isDim = gHovered && !isHot && !isNear;
      const color = CAT_COLOR[n.category];
      const r = isHot ? n.radius + 6 : n.radius;

      if (isHot) {
        const grad = gctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, r * 2);
        grad.addColorStop(0, rgba(color, 0.18));
        grad.addColorStop(1, "transparent");
        gctx.beginPath();
        gctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
        gctx.fillStyle = grad;
        gctx.fill();
      }

      // Solid white body for every node -- category shows up in the
      // border/glow/edges instead of tinting the whole circle.
      gctx.beginPath();
      gctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      gctx.fillStyle = isDim ? "rgba(255,255,255,0.6)" : "#ffffff";
      gctx.fill();
      gctx.strokeStyle = isDim
        ? "rgba(18,18,18,0.12)"
        : isHot
        ? color
        : isNear
        ? rgba(color, 0.85)
        : "rgba(18,18,18,0.3)";
      gctx.lineWidth = isHot ? 2.5 : isNear ? 2 : 1.3;
      gctx.stroke();

      gctx.textAlign = "center";
      gctx.textBaseline = "middle";
      gctx.fillStyle = isDim ? "rgba(18,18,18,0.3)" : "#121212";

      // Two-word labels (e.g. "Medical Imaging") stack as two lines
      // instead of overflowing the circle on one.
      const words = n.label.split(" ");
      if (words.length > 1) {
        gctx.font = (isHot ? "600 11px " : "500 9px ") + GRAPH_MONO;
        const lineHeight = isHot ? 13 : 11;
        const offset = ((words.length - 1) * lineHeight) / 2;
        words.forEach((word, i) => {
          gctx.fillText(word, n.x, n.y - offset + i * lineHeight);
        });
      } else {
        gctx.font = (isHot ? "600 12px " : "500 10px ") + GRAPH_MONO;
        gctx.fillText(n.label, n.x, n.y);
      }

      if (isHot) {
        gctx.font = "500 9px " + GRAPH_MONO;
        gctx.fillStyle = color;
        gctx.fillText(CAT_LABEL[n.category].toUpperCase(), n.x, n.y + r + 14);
      }
    });
  };

  const gLoop = () => {
    if (!gReduced || gSettle > 0) {
      gStep();
      if (gSettle > 0) gSettle -= 1;
    }
    if (gDragged) {
      const d = gById[gDragged];
      if (d) {
        d.x += (gMouse.x - d.x) * 0.3;
        d.y += (gMouse.y - d.y) * 0.3;
        d.vx = 0;
        d.vy = 0;
      }
    }
    gDraw();
    requestAnimationFrame(gLoop);
  };

  const gPos = (e) => {
    const rect = graphCanvas.getBoundingClientRect();
    const pt = e.touches && e.touches[0] ? e.touches[0] : e;
    return { x: pt.clientX - rect.left, y: pt.clientY - rect.top };
  };

  const gHit = (x, y) => {
    for (let i = gNodes.length - 1; i >= 0; i--) {
      const n = gNodes[i];
      const dx = x - n.x;
      const dy = y - n.y;
      const reach = n.radius + 8;
      if (dx * dx + dy * dy < reach * reach) return n.id;
    }
    return null;
  };

  graphCanvas.addEventListener("mousemove", (e) => {
    gMouse = gPos(e);
    if (gDragged) return;
    gHovered = gHit(gMouse.x, gMouse.y);
  });
  graphCanvas.addEventListener("mousedown", (e) => {
    gMouse = gPos(e);
    const id = gHit(gMouse.x, gMouse.y);
    if (id) {
      gDragged = id;
      e.preventDefault();
    }
  });
  window.addEventListener("mouseup", () => {
    gDragged = null;
  });
  graphCanvas.addEventListener("mouseleave", () => {
    gHovered = null;
    gDragged = null;
  });

  graphCanvas.addEventListener(
    "touchstart",
    (e) => {
      gMouse = gPos(e);
      const id = gHit(gMouse.x, gMouse.y);
      gHovered = id;
      if (id) gDragged = id;
    },
    { passive: true }
  );
  graphCanvas.addEventListener(
    "touchmove",
    (e) => {
      gMouse = gPos(e);
    },
    { passive: true }
  );
  graphCanvas.addEventListener("touchend", () => {
    gDragged = null;
  });

  gBuildAdjacency();
  window.addEventListener("resize", gResize);
  gResize();
  requestAnimationFrame(gLoop);
})();

// Contact form: submit via FormSubmit's AJAX endpoint so a real email lands
// in Anya's inbox without a page navigation or any backend of our own.
(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const status = form.querySelector(".cf-status");
  const submitBtn = form.querySelector(".cf-submit");
  const submitLabel = submitBtn.querySelector("span");
  const defaultLabel = submitLabel.textContent;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Honeypot: bots fill every field, real visitors never see this one.
    if (form._honeypot.value) return;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) return;

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending…";
    status.textContent = "";
    status.classList.remove("cf-status-success", "cf-status-error");

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/vondiessl@alumni.stanford.edu",
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        }
      );
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      status.textContent = "Thanks — your message is on its way. I’ll get back to you soon.";
      status.classList.add("cf-status-success");
    } catch (err) {
      status.textContent = "Something went wrong sending that — please email me directly instead.";
      status.classList.add("cf-status-error");
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = defaultLabel;
    }
  });
})();
