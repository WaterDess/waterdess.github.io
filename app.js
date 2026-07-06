(function () {
  const data = window.TANG_SITE;
  const app = document.getElementById("app");
  const page = document.body.dataset.page || "home";
  const personSlug = document.body.dataset.person || "";
  const IS_FILE_PREVIEW = window.location.protocol === "file:";
  const PUBLIC_BASE = (() => {
    if (IS_FILE_PREVIEW) return "";
    const marker = "/hydrosphere/";
    const path = window.location.pathname;
    const index = path.indexOf(marker);
    return index >= 0 ? path.slice(0, index + marker.length) : "/";
  })();

  const nav = [
    ["news", "News"],
    ["people", "People"],
    ["publications", "Publications"],
    ["research", "Research"],
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
    if (IS_FILE_PREVIEW) {
      return pageName === "home" ? "index.html" : `${pageName}.html`;
    }

    return `${PUBLIC_BASE}${pageName === "home" ? "" : `${pageName}/`}`;
  }

  function personHref(slug) {
    return IS_FILE_PREVIEW ? `person-${slug}.html` : `${PUBLIC_BASE}person-${slug}/`;
  }

  function assetUrl(url) {
    if (!url || IS_FILE_PREVIEW || /^(https?:|#)/.test(url)) return url;
    return url.startsWith("./") ? `${PUBLIC_BASE}${url.slice(2)}` : url;
  }


  function displayEmail(email) {
    return String(email || "");
  }

  function setupChrome() {
    document.documentElement.lang = "en";
    const brandLogo = document.querySelector(".brand-logo");
    brandLogo.src = assetUrl(data.visuals.logo);
    brandLogo.alt = data.site.shortName || data.site.name;
    document.querySelector(".brand").setAttribute("href", href("home"));

    const navEl = document.querySelector(".site-header nav");
    navEl.innerHTML = list(nav, ([key, label]) => {
      const active = key === page || (page === "person" && key === "people");
      return `<a class="${active ? "active" : ""}" href="${href(key)}">${esc(label)}</a>`;
    });
  }

  function pageHero(kicker, title, subtitle, alignedWithToc = false) {
    const className = alignedWithToc ? "page-hero page-hero-with-toc" : "page-hero";

    return `
      <section class="${className}">
        <div>
          <span>${esc(kicker)}</span>
          <h1>${esc(title)}</h1>
          ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
        </div>
      </section>
    `;
  }

  function pageIntro(title, kicker, summary = "") {
    return `
      <header class="section page-intro">
        <span>${esc(kicker)}</span>
        <h1>${esc(title)}</h1>
        ${summary ? `<p>${esc(summary)}</p>` : ""}
      </header>
    `;
  }
  function renderToc(items) {
    return `
      <aside class="toc-sidebar" aria-label="Section navigation">
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
        <img src="${esc(assetUrl(data.visuals.hero))}" alt="" />
        <div class="image-hero-content">
          <h1>${esc(data.site.name)}</h1>
          <strong>${esc(data.site.tagline)}</strong>
        </div>
      </section>
    `;
  }

  function renderAbout() {
    return `
      ${pageIntro("About", "Group", "THU Global Change Hydrology Group")}
      <section class="section about-layout">
        <article class="large-copy">
          <p>${esc(data.site.summary)}</p>
          <p>${esc(data.site.missionIntro)}</p>
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
    const postdoctoralFellows = members.filter((person) => (person.group || "").toLowerCase() === "postdoctoral-fellow");
    const researchAssociates = members.filter((person) => (person.group || "").toLowerCase() === "research-associate");
    const tocItems = [
      lead ? { id: "faculty", label: "Faculty" } : null,
      postdoctoralFellows.length ? { id: "postdoctoral-fellow", label: "Postdoctoral Fellow" } : null,
      researchAssociates.length ? { id: "research-associate", label: "Research Associate" } : null,
      { id: "graduate-student", label: "Graduate Student" }
    ].filter(Boolean);

    return `
      ${pageIntro("People", "Directory", "Faculty, postdoctoral fellows, research associates, and students")}
      <section class="section people-layout">
        ${renderToc(tocItems)}
        <div class="people-content">
        ${lead ? `
          <section class="people-block people-block-feature" id="faculty">
            ${renderPeopleBlockHeading("01", "Faculty")}
            ${renderLeadPerson(lead)}
          </section>
        ` : ""}
        ${postdoctoralFellows.length ? `
          <section class="people-block" id="postdoctoral-fellow">
            ${renderPeopleBlockHeading("02", "Postdoctoral Fellow")}
            <div class="member-grid compact-member-list" aria-label="Postdoctoral Fellow">
              ${list(postdoctoralFellows, renderMemberRow)}
            </div>
          </section>
        ` : ""}
        ${researchAssociates.length ? `
          <section class="people-block" id="research-associate">
            ${renderPeopleBlockHeading("03", "Research Associate")}
            <div class="member-grid compact-member-list" aria-label="Research Associate">
              ${list(researchAssociates, renderMemberRow)}
            </div>
          </section>
        ` : ""}
        <section class="people-block" id="graduate-student">
          ${renderPeopleBlockHeading(researchAssociates.length ? "04" : "03", "Graduate Student")}
          <p class="empty-note">To be updated.</p>
        </section>
        </div>
      </section>
    `;
  }

  function renderPeopleBlockHeading(index, title) {
    return `
      <header class="people-block-heading" aria-label="${esc(title)}">
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
      <article class="lead-person text-only-person compact-person-row">
        <h2><a href="${esc(personHref(person.slug))}">${esc(person.name)}</a></h2>
        <small class="plain-email">${esc(displayEmail(person.email))}</small>
      </article>
    `;
  }

  function renderMemberRow(person) {
    return `
      <article class="member-row compact-person-row">
        <h2><a href="${esc(personHref(person.slug))}">${esc(person.name)}</a></h2>
        <small class="plain-email">${esc(displayEmail(person.email))}</small>
      </article>
    `;
  }

  function renderPersonDetail() {
    const person = data.people.find((item) => item.slug === personSlug) || data.people[0];
    return `
      ${pageIntro(person.name, "People", person.position || "")}
      <section class="section person-detail">
        <aside class="profile-summary">
          ${person.photo ? `<img src="${esc(assetUrl(person.photo))}" alt="${esc(person.name)}" />` : `<div class="avatar-placeholder large">${esc(person.name.charAt(0))}</div>`}
          <p class="profile-department">${esc(person.address)}</p>
          ${renderProfileTitles(person.position)}
          <p class="profile-email plain-email">${esc(displayEmail(person.email))}</p>
          ${renderProfileLinks(person.links)}
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

  function renderProfileLinks(links) {
    if (!links || !links.length) return "";
    return `<div class="profile-links">${list(links, (link) => `<a href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label)}</a>`)}</div>`;
  }

  function renderProfileTitles(position) {
    const titles = String(position || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!titles.length) return "";
    return `<ul class="profile-titles">${list(titles, (title) => `<li>${esc(title)}</li>`)}</ul>`;
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
      ${pageIntro("Research", "Work", "Projects, code, and shared hydrologic datasets")}
      ${renderTocLayout(tocItems, list(data.research, (item) => `
        <section class="content-section research-section" id="${esc(sectionId("research", item.title))}">
          <span class="research-kicker">${esc(item.title)}</span>
          <div>
            ${item.url
              ? `<h2 class="research-link-title"><a href="${esc(item.url)}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.text || item.title)}</a></h2>`
              : `<h2>${esc(item.title)}</h2>${item.text ? `<p>${esc(item.text)}</p>` : ""}`}
          </div>
        </section>
      `))}
    `;
  }

  function renderPublications() {
    const years = [...new Set(data.publications.map((paper) => paper.year))].sort((a, b) => Number(b) - Number(a));
    const tocItems = years.map((year) => ({ id: `year-${year}`, label: String(year) }));

    return `
      ${pageIntro("Publications", "Archive", "A curated list will be updated manually")}
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
    const items = [...(data.news || [])].sort((a, b) => newsDateValue(b.date) - newsDateValue(a.date));
    return `
      ${pageIntro("News", "Updates", "Seminars, calls, and group announcements")}
      <section class="section news-layout compact-news-layout">
        <div class="news-lines">
          ${list(items, renderNewsLine)}
        </div>
      </section>
    `;
  }

  function newsDateValue(date) {
    const source = String(date || "");
    const full = source.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (full) return Date.parse(`${full[1]}-${full[2]}-${full[3]}T00:00:00Z`);
    const year = source.match(/^(\d{4})$/);
    if (year) return Date.parse(`${year[1]}-01-01T00:00:00Z`);
    return 0;
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
            ${item.flyerUrl ? `<a class="text-link secondary" href="${esc(assetUrl(item.flyerUrl))}" target="_blank" rel="noopener">PDF</a>` : ""}
          </div>
        </div>
        <img src="${esc(assetUrl(item.image || data.visuals.news))}" alt="" />
      </article>
    `;
  }

  function renderNewsLine(item) {
    return `
      <article class="news-line compact-news-line">
        <div>
          <span>${esc(item.type)}${item.date ? ` / ${esc(item.date)}` : ""}${item.forum ? ` / ${esc(item.forum)}` : ""}</span>
          <h3>${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.title)}</a>` : esc(item.title)}</h3>
        </div>
      </article>
    `;
  }

  function renderJoin() {
    const tocItems = [
      { id: "global-research-program", label: "Research Program" },
      { id: "phd-admission", label: "PhD Admission" },
      { id: "postdoctoral-fellow", label: "Postdoctoral Fellow" },
      { id: "visiting-scholar-domestic", label: "Visiting Scholar" }
    ];

    return `
      ${pageIntro("How to join?", "Openings", "Research programs, admission, and visitor opportunities")}
      ${renderTocLayout(tocItems, `
        <article class="content-section join-section" id="global-research-program">
          <h2>${data.join.programUrl ? `<a href="${esc(data.join.programUrl)}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(data.join.program)}</a>` : esc(data.join.program)}</h2>
          <p>${esc(data.join.text)}</p>
        </article>
        <article class="content-section join-section" id="phd-admission">
          <h2>PhD admission</h2>
          <p>${esc(data.join.phd)}</p>
          <p class="plain-email">${esc(displayEmail(data.site.email))}</p>
        </article>
        <article class="content-section join-section" id="postdoctoral-fellow">
          <h2>Postdoctoral Fellow</h2>
          <p>${renderInlineLink(data.join.postdoc, "here", data.join.postdocUrl)}</p>
        </article>
        <article class="content-section join-section" id="visiting-scholar-domestic">
          <h2>${data.join.visitingScholarUrl ? `<a href="${esc(data.join.visitingScholarUrl)}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(data.join.visitingScholar)}</a>` : esc(data.join.visitingScholar)}</h2>
        </article>
      `)}
    `;
  }

  function renderInlineLink(text, label, url) {
    const source = String(text || "");
    const index = source.lastIndexOf(label);
    if (!url || index < 0) return esc(source);

    return `${esc(source.slice(0, index))}<a href="${esc(assetUrl(url))}" target="_blank" rel="noopener">${esc(label)}</a>${esc(source.slice(index + label.length))}`;
  }

  function renderContact() {
    return `
      <section class="section join-layout">
        <article>
          <h2>Email</h2>
          <p>For academic communication and admission inquiries, please contact the group through Prof. Qiuhong Tang.</p>
          <p class="plain-email">${esc(displayEmail(data.site.email))}</p>
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
