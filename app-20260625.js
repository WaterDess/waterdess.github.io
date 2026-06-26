(function () {
  const data = window.TANG_SITE;
  const app = document.getElementById("app");
  const page = document.body.dataset.page || "home";
  const personSlug = document.body.dataset.person || "";

  const nav = [
    ["about", "About"],
    ["people", "People"],
    ["research", "Research"],
    ["publications", "Publications"],
    ["news", "News"],
    ["join", "How to join?"]
  ];

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function list(items, render) {
    return (items || []).map(render).join("");
  }

  function href(pageName) {
    return pageName === "home" ? "index.html" : `${pageName}.html`;
  }

  function setupChrome() {
    document.documentElement.lang = "en";
    document.querySelector(".brand span").textContent = data.site.name;
    document.querySelector(".brand small").textContent = data.site.unit;
    document.querySelector(".brand").setAttribute("href", "index.html");

    const navEl = document.querySelector(".site-header nav");
    navEl.innerHTML = list(nav, ([key, label]) => `<a class="${key === page ? "active" : ""}" href="${href(key)}">${esc(label)}</a>`);
  }

  function logoMark() {
    return `
      <div class="gch-mark" aria-label="Global Change Hydrology Group">
        <svg viewBox="0 0 92 92" role="presentation">
          <path d="M10 57C29 33 47 64 65 40s22-15 27-6" />
          <path d="M22 70c20-17 39 9 59-12" />
          <circle cx="30" cy="35" r="5" />
          <circle cx="65" cy="40" r="5" />
        </svg>
        <span>GCH</span>
      </div>
    `;
  }

  function pageHero(kicker, title, subtitle, image) {
    return `
      <section class="page-hero">
        <div>
          <span>${esc(kicker)}</span>
          <h1>${esc(title)}</h1>
          ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
        </div>
        ${image ? `<img src="${esc(image)}" alt="" />` : ""}
      </section>
    `;
  }

  function renderHome() {
    return `
      <section class="image-hero home-landing">
        <img src="${esc(data.visuals.hero)}" alt="" />
        <canvas class="image-hero-ambient" aria-hidden="true"></canvas>
        <div class="image-hero-content">
          <h1>${esc(data.site.name)}</h1>
          <strong>${esc(data.site.tagline)}</strong>
        </div>
      </section>
    `;
  }

  function renderFeatureCard(card) {
    return `
      <a class="feature-card" href="${esc(card.url)}">
        <img src="${esc(card.image)}" alt="" />
        <div>
          <h2>${esc(card.title)}</h2>
          <p>${esc(card.text)}</p>
          <span>Learn more</span>
        </div>
      </a>
    `;
  }

  function renderAbout() {
    return `
      ${pageHero("About", "THU Global Change Hydrology Group", "A research group focused on water-cycle change and water security.", data.visuals.research)}
      <section class="section about-layout">
        <article class="large-copy">
          <p>${esc(data.site.summary)}</p>
          <p>The group studies global change hydrology, water-cycle imbalance, water-risk monitoring and prediction, and transboundary water governance through modeling, remote sensing, data integration, and risk assessment.</p>
        </article>
        <div class="mission-list">
          ${list(data.mission, (item, index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <strong>${esc(item)}</strong>
            </article>
          `)}
        </div>
      </section>
    `;
  }

  function renderPeople() {
    return `
      ${pageHero("People", "People", "Members of the Global Change Hydrology Group.", data.visuals.pi)}
      <section class="section people-grid">
        ${list(data.people, renderPersonCard)}
      </section>
    `;
  }

  function renderPersonCard(person) {
    return `
      <a class="person-card" href="person-${esc(person.slug)}.html">
        ${person.photo ? `<img src="${esc(person.photo)}" alt="${esc(person.name)}" />` : `<div class="avatar-placeholder">${esc(person.name.charAt(0))}</div>`}
        <div>
          <h2>${esc(person.name)}</h2>
          <p>${esc(person.position)}</p>
          <span>${esc(person.email)}</span>
        </div>
      </a>
    `;
  }

  function renderPersonDetail() {
    const person = data.people.find((item) => item.slug === personSlug) || data.people[0];
    return `
      ${pageHero("People", person.name, person.position, person.photo || data.visuals.research)}
      <section class="section person-detail">
        <aside>
          ${person.photo ? `<img src="${esc(person.photo)}" alt="${esc(person.name)}" />` : `<div class="avatar-placeholder large">${esc(person.name.charAt(0))}</div>`}
          <p>${esc(person.address)}</p>
          <a href="${person.email.includes("@") ? `mailto:${esc(person.email)}` : "#"}">${esc(person.email)}</a>
        </aside>
        <div class="detail-sections">
          ${renderDetailBlock("Research Interests", person.interests)}
          ${renderDetailBlock("Education", person.education)}
          ${renderDetailBlock("Positions Held", person.positions)}
          ${renderDetailBlock("Publications", person.publications)}
        </div>
      </section>
    `;
  }

  function renderDetailBlock(title, items) {
    return `
      <section>
        <h2>${esc(title)}</h2>
        <ul>${list(items, (item) => `<li>${esc(item)}</li>`)}</ul>
      </section>
    `;
  }

  function renderResearch() {
    return `
      ${pageHero("Research", "Research", "Projects, code, and data for global change hydrology will be updated as the group website develops.", data.visuals.research)}
      <section class="section research-grid">
        ${list(data.research, (item, index) => `
          <article class="visual-card">
            <img src="${esc(item.image || data.visuals.research)}" alt="" />
            <div>
              <span>${String(index + 1).padStart(2, "0")} / ${esc(item.status)}</span>
              <h2>${esc(item.title)}</h2>
              ${item.text ? `<p>${esc(item.text)}</p>` : ""}
            </div>
          </article>
        `)}
      </section>
    `;
  }

  function renderPublications() {
    return `
      ${pageHero("Publications", "Publications", "Only papers affiliated with Department of Earth System Science, Tsinghua University will be listed here.", data.visuals.publications)}
      <section class="section publication-layout">
        <div class="publication-visual">
          <img src="${esc(data.visuals.publications)}" alt="" />
        </div>
        <div class="publication-list">
          ${list(data.publications, renderPublication)}
        </div>
      </section>
    `;
  }

  function renderPublication(paper) {
    return `
      <article class="publication">
        <time>${esc(paper.year)}</time>
        <div>
          <h2>${esc(paper.title)}</h2>
          <p>${esc(paper.authors)}</p>
          <footer>
            <span>${esc(paper.journal)}</span>
            ${paper.url ? `<a href="${esc(paper.url)}" target="_blank" rel="noopener">${esc(paper.doi || "Link")}</a>` : ""}
          </footer>
          <small>${esc(paper.highlight)}</small>
        </div>
      </article>
    `;
  }

  function renderNews() {
    const [first, ...rest] = data.news;
    return `
      ${pageHero("News", "News", "Seminars, announcements, and group updates.", data.visuals.news)}
      <section class="section news-layout">
        ${first ? renderNewsFeature(first) : ""}
        <div class="news-lines">
          ${list(rest, renderNewsLine)}
        </div>
      </section>
    `;
  }

  function renderNewsFeature(item) {
    return `
      <article class="news-feature">
        <img src="${esc(item.image || data.visuals.news)}" alt="" />
        <div>
          <span>${esc(item.type)} / ${esc(item.date)}</span>
          <h2>${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a>` : esc(item.title)}</h2>
          <p>${esc(item.text)}</p>
          <div class="link-row">
            ${item.url ? `<a class="text-link" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.urlLabel || "Learn more")}</a>` : ""}
            ${item.flyerUrl ? `<a class="text-link secondary" href="${esc(item.flyerUrl)}" target="_blank" rel="noopener">Open flyer PDF</a>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function renderNewsLine(item) {
    return `
      <article class="news-line">
        <time>${esc(item.date)}</time>
        <div>
          <span>${esc(item.type)}</span>
          <h3>${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a>` : esc(item.title)}</h3>
        </div>
      </article>
    `;
  }

  function renderJoin() {
    return `
      ${pageHero("How to join?", data.join.title, "Opportunities for students and visiting researchers.", data.visuals.join)}
      <section class="section join-layout">
        <article>
          <h2>${data.join.programUrl ? `<a href="${esc(data.join.programUrl)}" target="_blank" rel="noopener">${esc(data.join.program)}</a>` : esc(data.join.program)}</h2>
          <p>${esc(data.join.text)}</p>
          ${data.join.programUrl ? `<a class="text-link" href="${esc(data.join.programUrl)}" target="_blank" rel="noopener">Open program page</a>` : ""}
        </article>
        <article>
          <h2>PhD admission</h2>
          <p>${esc(data.join.phd)}</p>
          <a class="text-link" href="mailto:${esc(data.site.email)}">${esc(data.site.email)}</a>
        </article>
      </section>
    `;
  }

  const renderers = {
    home: renderHome,
    about: renderAbout,
    people: renderPeople,
    person: renderPersonDetail,
    research: renderResearch,
    publications: renderPublications,
    news: renderNews,
    join: renderJoin
  };

  if (!data) {
    app.innerHTML = '<section class="loading">Site data is missing.</section>';
    return;
  }

  function createRandom(seed) {
    let state = seed >>> 0;
    return function random() {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function initHeroAtmosphere() {
    const canvas = document.querySelector(".image-hero-ambient");
    const hero = document.querySelector(".home-landing");
    const motionOff = new URLSearchParams(window.location.search).get("motion") === "off";

    if (!canvas || !hero || motionOff || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return;
    }

    window.__heroAtmosphere = {
      active: true,
      frames: 0,
      width: 0,
      height: 0,
      lastTime: 0
    };

    const random = createRandom(20260626);
    const clouds = Array.from({ length: 16 }, () => ({
      x: random(),
      y: 0.07 + random() * 0.46,
      r: 0.12 + random() * 0.18,
      speed: 0.0012 + random() * 0.0022,
      phase: random() * Math.PI * 2,
      alpha: 0.018 + random() * 0.028
    }));
    const ripples = Array.from({ length: 18 }, (_, index) => ({
      y: 0.58 + index * 0.018 + random() * 0.018,
      amp: 1.4 + random() * 2.6,
      speed: 0.16 + random() * 0.22,
      alpha: 0.018 + random() * 0.025,
      phase: random() * Math.PI * 2
    }));

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;

    function resize() {
      const rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      window.__heroAtmosphere.width = width;
      window.__heroAtmosphere.height = height;
    }

    function drawClouds(time) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      clouds.forEach((cloud) => {
        const drift = (cloud.x + time * cloud.speed) % 1.28 - 0.14;
        const bob = Math.sin(time * 0.09 + cloud.phase) * 7;
        const x = drift * width;
        const y = cloud.y * height + bob;
        const rx = cloud.r * width;
        const ry = cloud.r * height * 0.36;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);

        gradient.addColorStop(0, `rgba(236, 246, 242, ${cloud.alpha})`);
        gradient.addColorStop(0.45, `rgba(198, 222, 218, ${cloud.alpha * 0.58})`);
        gradient.addColorStop(1, "rgba(236, 246, 242, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    function drawWater(time) {
      const waterTop = height * 0.56;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, waterTop, width, height - waterTop);
      ctx.clip();
      ctx.globalCompositeOperation = "screen";

      ripples.forEach((ripple) => {
        const y = ripple.y * height + Math.sin(time * 0.12 + ripple.phase) * 4;
        const gradient = ctx.createLinearGradient(0, y, width, y);
        gradient.addColorStop(0, "rgba(220, 244, 238, 0)");
        gradient.addColorStop(0.36, `rgba(218, 245, 240, ${ripple.alpha})`);
        gradient.addColorStop(0.54, `rgba(255, 255, 255, ${ripple.alpha * 0.74})`);
        gradient.addColorStop(0.78, `rgba(186, 220, 218, ${ripple.alpha * 0.65})`);
        gradient.addColorStop(1, "rgba(220, 244, 238, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 18) {
          const wave =
            Math.sin(x * 0.013 + time * ripple.speed + ripple.phase) * ripple.amp +
            Math.sin(x * 0.031 - time * ripple.speed * 0.72 + ripple.phase) * ripple.amp * 0.34;
          if (x === 0) {
            ctx.moveTo(x, y + wave);
          } else {
            ctx.lineTo(x, y + wave);
          }
        }
        ctx.stroke();
      });

      const sheenX = (Math.sin(time * 0.055) * 0.5 + 0.5) * width;
      const sheen = ctx.createRadialGradient(sheenX, height * 0.7, 0, sheenX, height * 0.7, width * 0.32);
      sheen.addColorStop(0, "rgba(210, 235, 230, 0.045)");
      sheen.addColorStop(1, "rgba(210, 235, 230, 0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, waterTop, width, height - waterTop);
      ctx.restore();
    }

    function render(timestamp) {
      const time = timestamp / 1000;
      ctx.clearRect(0, 0, width, height);
      drawClouds(time);
      drawWater(time);
      window.__heroAtmosphere.frames += 1;
      window.__heroAtmosphere.lastTime = time;
      canvas.dataset.frames = String(window.__heroAtmosphere.frames);
      canvas.dataset.lastTime = time.toFixed(3);
      frameId = window.requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    frameId = window.requestAnimationFrame(render);

    window.addEventListener("pagehide", () => {
      window.cancelAnimationFrame(frameId);
    }, { once: true });
  }

  setupChrome();
  app.innerHTML = (renderers[page] || renderHome)();
  if (page === "home") {
    initHeroAtmosphere();
  }
})();
