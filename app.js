(function () {
  const data = window.TANG_SITE;
  const app = document.getElementById("app");
  const page = document.body.dataset.page || "home";
  const personSlug = document.body.dataset.person || "";
  const SITE_VERSION = "people-compact-1";

  const nav = [
    ["news", "News"],
    ["research", "Research"],
    ["publications", "Publications"],
    ["people", "People"],
    ["about", "About"],
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
    const fileName = pageName === "home" ? "index.html" : `${pageName}.html`;
    return versioned(fileName);
  }

  function versioned(url) {
    return `${url}${url.includes("?") ? "&" : "?"}v=${SITE_VERSION}`;
  }

  function setupChrome() {
    document.documentElement.lang = "en";
    document.querySelector(".brand span").textContent = data.site.name;
    document.querySelector(".brand small").textContent = data.site.unit;
    document.querySelector(".brand").setAttribute("href", href("home"));

    const navEl = document.querySelector(".site-header nav");
    navEl.innerHTML = list(nav, ([key, label]) => {
      const active = key === page || (page === "person" && key === "people");
      return `<a class="${active ? "active" : ""}" href="${href(key)}">${esc(label)}</a>`;
    });
  }

  function pageHero(kicker, title, subtitle) {
    return `
      <section class="page-hero">
        <div>
          <span>${esc(kicker)}</span>
          <h1>${esc(title)}</h1>
          ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
        </div>
      </section>
    `;
  }

  function renderToc(items) {
    return `
      <aside class="toc-sidebar" aria-label="On this page">
        <h2>On this page</h2>
        <nav>
          ${list(items, (item) => `<a href="#${esc(item.id)}">${esc(item.label)}</a>`)}
        </nav>
      </aside>
    `;
  }

  function renderTocLayout(items, content) {
    return `
      <section class="section toc-layout">
        ${renderToc(items)}
        <div class="toc-content">
          ${content}
        </div>
      </section>
    `;
  }

  function sectionId(prefix, value) {
    return `${prefix}-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  }

  function renderHome() {
    return `
      <section class="image-hero home-landing">
        <img src="${esc(data.visuals.hero)}" alt="" />
        <div class="image-hero-content">
          <h1>${esc(data.site.name)}</h1>
          <strong>${esc(data.site.tagline)}</strong>
        </div>
      </section>
    `;
  }

  function renderAbout() {
    return `
      ${pageHero("About", "THU Global Change Hydrology Group", "A research group focused on water-cycle change and water security.")}
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
    const lead = data.people.find(isPrincipalInvestigator);
    const members = data.people.filter((person) => person !== lead);
    const scholars = members.filter((person) => /scholar/i.test(person.position || ""));
    const generalMembers = members.filter((person) => !scholars.includes(person));
    const tocItems = [
      lead ? { id: "principal-investigator", label: "Principal Investigator" } : null,
      scholars.length ? { id: "scholars", label: "Scholars" } : null,
      generalMembers.length ? { id: "members", label: "Members" } : null
    ].filter(Boolean);

    return `
      ${pageHero("People", "People", "Members of the Global Change Hydrology Group.")}
      <section class="section people-layout">
        ${renderToc(tocItems)}
        <div class="people-content">
        ${lead ? `
          <section class="people-block people-block-feature" id="principal-investigator">
            ${renderPeopleBlockHeading("01", "Principal Investigator")}
            ${renderLeadPerson(lead)}
          </section>
        ` : ""}
        ${scholars.length ? `
          <section class="people-block" id="scholars">
            ${renderPeopleBlockHeading("02", "Scholars")}
            <div class="member-index" aria-label="Scholars">
              ${list(scholars, renderMemberRow)}
            </div>
          </section>
        ` : ""}
        ${generalMembers.length ? `
          <section class="people-block" id="members">
            ${renderPeopleBlockHeading("03", "Members")}
            <div class="member-index" aria-label="Group members">
              ${list(generalMembers, renderMemberRow)}
            </div>
          </section>
        ` : ""}
        </div>
      </section>
    `;
  }

  function renderPeopleBlockHeading(index, title) {
    return `
      <header class="people-block-heading">
        <span>${esc(index)}</span>
        <h2>${esc(title)}</h2>
      </header>
    `;
  }

  function isPrincipalInvestigator(person) {
    return person.slug === "qiuhong-tang" || /principal investigator/i.test(person.position || "");
  }

  function renderLeadPerson(person) {
    return `
      <a class="lead-person" href="${esc(versioned(`person-${person.slug}.html`))}">
        ${person.photo ? `<img src="${esc(person.photo)}" alt="${esc(person.name)}" />` : `<div class="avatar-placeholder">${esc(person.name.charAt(0))}</div>`}
        <div>
          <span>Principal Investigator</span>
          <h2>${esc(person.name)}</h2>
          <p>${esc(person.position)}</p>
          <small>${esc(person.email)}</small>
        </div>
      </a>
    `;
  }

  function renderMemberRow(person) {
    const hasEmail = person.email.includes("@");

    return `
      <a class="member-row" href="${esc(versioned(`person-${person.slug}.html`))}">
        <div>
          <h2>${esc(person.name)}</h2>
          <p>${esc(person.position)}</p>
        </div>
        <span>${hasEmail ? esc(person.email) : ""}</span>
        <small>Profile</small>
      </a>
    `;
  }

  function renderPersonDetail() {
    const person = data.people.find((item) => item.slug === personSlug) || data.people[0];
    return `
      ${pageHero("People", person.name, person.position)}
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
    const tocItems = data.research.map((item) => ({
      id: sectionId("research", item.title),
      label: item.title
    }));

    return `
      ${pageHero("Research", "Research", "Projects, code, and data for global change hydrology will be updated as the group website develops.")}
      ${renderTocLayout(tocItems, list(data.research, (item) => `
        <section class="content-section research-section" id="${esc(sectionId("research", item.title))}">
          <div>
            <span>${esc(item.status)}</span>
            <h2>${esc(item.title)}</h2>
            ${item.text ? `<p>${esc(item.text)}</p>` : `<p>Content will be updated as the group website develops.</p>`}
          </div>
          <figure>
            <img src="${esc(item.image || data.visuals.research)}" alt="" />
          </figure>
        </section>
      `))}
    `;
  }

  function renderPublications() {
    const years = [...new Set(data.publications.map((paper) => paper.year))].sort((a, b) => Number(b) - Number(a));
    const tocItems = years.map((year) => ({ id: `year-${year}`, label: String(year) }));

    return `
      ${pageHero("Publications", "Publications", "Only papers affiliated with Department of Earth System Science, Tsinghua University will be listed here.")}
      ${renderTocLayout(tocItems, list(years, (year) => `
        <section class="content-section publication-year" id="year-${esc(year)}">
          <h2>${esc(year)}</h2>
          <div class="publication-list">
            ${list(data.publications.filter((paper) => paper.year === year), renderPublication)}
          </div>
        </section>
      `))}
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
      ${pageHero("News", "News", "Seminars, announcements, and group updates.")}
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
        <div>
          <span>${esc(item.type)} / ${esc(item.date)}</span>
          <h2>${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a>` : esc(item.title)}</h2>
          <p>${esc(item.text)}</p>
          <div class="link-row">
            ${item.url ? `<a class="text-link" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.urlLabel || "Learn more")}</a>` : ""}
            ${item.flyerUrl ? `<a class="text-link secondary" href="${esc(item.flyerUrl)}" target="_blank" rel="noopener">Open flyer PDF</a>` : ""}
          </div>
        </div>
        <img src="${esc(item.image || data.visuals.news)}" alt="" />
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
    const tocItems = [
      { id: "global-research-program", label: "Global Research Program" },
      { id: "phd-admission", label: "PhD Admission" }
    ];

    return `
      ${pageHero("How to join?", data.join.title, "Opportunities for students and visiting researchers.")}
      ${renderTocLayout(tocItems, `
        <article class="content-section join-section" id="global-research-program">
          <h2>${data.join.programUrl ? `<a href="${esc(data.join.programUrl)}" target="_blank" rel="noopener">${esc(data.join.program)}</a>` : esc(data.join.program)}</h2>
          <p>${esc(data.join.text)}</p>
        </article>
        <article class="content-section join-section" id="phd-admission">
          <h2>PhD admission</h2>
          <p>${esc(data.join.phd)}</p>
          <a class="text-link" href="mailto:${esc(data.site.email)}">${esc(data.site.email)}</a>
        </article>
      `)}
    `;
  }

  function renderContact() {
    return `
      ${pageHero("Contact", "Contact", data.site.unit)}
      <section class="section join-layout">
        <article>
          <h2>Email</h2>
          <p>For academic communication and admission inquiries, please contact the group through Prof. Qiuhong Tang.</p>
          <a class="text-link" href="mailto:${esc(data.site.email)}">${esc(data.site.email)}</a>
        </article>
        <article>
          <h2>Faculty profile</h2>
          <p>Additional faculty information is available from the official Tsinghua University profile page.</p>
          <a class="text-link" href="${esc(data.site.website)}" target="_blank" rel="noopener">Open faculty profile</a>
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
    join: renderJoin,
    contact: renderContact
  };

  if (!data) {
    app.innerHTML = '<section class="loading">Site data is missing.</section>';
    return;
  }

  setupChrome();
  app.innerHTML = (renderers[page] || renderHome)();
})();
