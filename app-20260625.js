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

  function pageTitle(kicker, title, subtitle) {
    return `
      <section class="page-title">
        <div class="section-header">
          <span>${esc(kicker)}</span>
          <h1>${esc(title)}</h1>
          ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
        </div>
      </section>
    `;
  }

  function renderHydroImage() {
    return `
      <div class="hydro-hero-image" aria-hidden="true">
        <svg viewBox="0 0 920 520" role="presentation">
          <defs>
            <linearGradient id="waterGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stop-color="#e9f6f3" />
              <stop offset="1" stop-color="#f8fbfa" />
            </linearGradient>
          </defs>
          <rect width="920" height="520" rx="18" fill="url(#waterGrad)" />
          <path class="basin" d="M74 318 C185 240 280 266 386 188 C482 118 594 136 708 76 C790 34 846 60 890 42" />
          <path d="M222 250 C260 286 286 327 310 402" />
          <path d="M470 144 C512 198 550 236 614 270" />
          <path d="M700 78 C734 130 776 168 850 196" />
          <path class="contour" d="M92 392 C220 334 320 368 438 286 C546 210 666 232 848 160" />
          <path class="contour" d="M64 224 C192 164 304 194 412 118 C520 42 628 74 792 20" />
          <circle cx="386" cy="188" r="8" />
          <circle cx="708" cy="76" r="8" />
          <circle cx="614" cy="270" r="8" />
        </svg>
      </div>
    `;
  }

  function renderLogoMark() {
    return `
      <div class="gch-logo" aria-label="Global Change Hydrology Group logo">
        <svg viewBox="0 0 90 90" role="presentation">
          <path d="M12 56 C30 34 47 64 64 41 S78 28 84 36" />
          <path d="M22 68 C40 54 58 77 76 58" />
          <circle cx="29" cy="36" r="5" />
          <circle cx="63" cy="41" r="5" />
        </svg>
        <div>
          <strong>GCH</strong>
          <span>Global Change Hydrology</span>
        </div>
      </div>
    `;
  }

  function renderHome() {
    return `
      <section class="hero hero-home">
        <div class="hero-copy">
          ${renderLogoMark()}
          <p class="eyebrow">${esc(data.site.unit)}</p>
          <h1>${esc(data.site.name)}</h1>
          <p class="lead">${esc(data.site.tagline)}</p>
          <p class="lead-en">${esc(data.site.summary)}</p>
        </div>
        ${renderHydroImage()}
      </section>
      <section class="home-strip">
        <a class="home-link-card" href="about.html"><span>About</span><strong>Mission and priorities</strong></a>
        <a class="home-link-card" href="people.html"><span>People</span><strong>Members and profiles</strong></a>
        <a class="home-link-card" href="research.html"><span>Research</span><strong>Projects, code, and data</strong></a>
      </section>
      <section class="section home-preview">
        <div class="section-header">
          <span>News</span>
          <h1>Recent updates</h1>
        </div>
        <div class="news-list compact-news">
          ${list(data.news.slice(0, 4), renderNewsItem)}
        </div>
      </section>
    `;
  }

  function renderAbout() {
    return `
      ${pageTitle("About", "THU Global Change Hydrology Group", "A research group focused on water-cycle change and water security.")}
      <section class="section no-top-border about-page">
        <article class="intro-card">
          <p>${esc(data.site.summary)}</p>
          <p>Our mission is to advance water sciences for planetary health and sustainable development. To deliver on this mission and achieve our core objectives, we commit to the following priorities:</p>
        </article>
        <div class="mission-grid">
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
      ${pageTitle("People", "People", "Members of the Global Change Hydrology Group.")}
      <section class="section no-top-border">
        <div class="people-list">
          ${list(data.people, renderPersonCard)}
        </div>
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
      ${pageTitle("People", person.name, person.position)}
      <section class="section no-top-border person-detail">
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
      ${pageTitle("Research", "Research", "Research projects, code, and data will be updated as the group website develops.")}
      <section class="section no-top-border">
        <div class="research-hub">
          ${list(data.research, (item, index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h2>${esc(item.title)}</h2>
              <p>${esc(item.text)}</p>
              <small>${esc(item.status)}</small>
            </article>
          `)}
        </div>
      </section>
    `;
  }

  function renderPublications() {
    return `
      ${pageTitle("Publications", "Publications", "Only papers affiliated with Department of Earth System Science, Tsinghua University will be listed here.")}
      <section class="section no-top-border">
        <div class="publication-list">
          ${list(data.publications, renderPublication)}
        </div>
      </section>
    `;
  }

  function renderPublication(paper) {
    return `
      <article class="publication">
        <div class="pub-year">${esc(paper.year)}</div>
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
    return `
      ${pageTitle("News", "News", "Seminars, announcements, and group updates.")}
      <section class="section no-top-border">
        <div class="news-list">
          ${list(data.news, renderNewsItem)}
        </div>
      </section>
    `;
  }

  function renderNewsItem(item) {
    return `
      <article class="news-row">
        <time>${esc(item.date)}</time>
        <div>
          <span>${esc(item.type)}</span>
          <h2>${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a>` : esc(item.title)}</h2>
          <p>${esc(item.text)}</p>
        </div>
      </article>
    `;
  }

  function renderJoin() {
    return `
      ${pageTitle("How to join?", data.join.title, "Opportunities for students and visiting researchers.")}
      <section class="section no-top-border join-page">
        <article>
          <h2>${esc(data.join.program)}</h2>
          <p>${esc(data.join.text)}</p>
        </article>
        <article>
          <h2>PhD admission</h2>
          <p>${esc(data.join.phd)}</p>
          <a href="mailto:${esc(data.site.email)}">${esc(data.site.email)}</a>
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

  setupChrome();
  app.innerHTML = (renderers[page] || renderHome)();
})();
