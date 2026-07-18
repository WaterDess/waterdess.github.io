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

  function pageIntro(title, kicker, summary = "") {
    return `
      <header class="section page-intro">
        <span>${esc(kicker)}</span>
        <h1>${esc(title)}</h1>
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

    return `
      ${pageIntro("People", "Directory", "Faculty, postdoctoral fellows, research associates, and students")}
      <section class="section people-layout">
        ${renderToc([
          { id: "faculty", label: "Faculty" },
          { id: "postdoctoral-fellow", label: "Postdoctoral Fellow" },
          { id: "research-associate", label: "Research Associate" },
          { id: "graduate-student", label: "Graduate Student" },
        ])}
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
          ${renderDetailBlock("Education", person.education)}
          ${renderDetailBlock("Positions Held", person.positions)}
          ${renderDetailBlock("Research Interests", person.interests)}
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
        <ul>${list(items, renderDetailItem)}</ul>
      </section>
    `;
  }

  function renderDetailItem(item) {
    if (item && typeof item === "object") {
      const text = item.text || item.title || "";
      const content = item.url
        ? `<a class="detail-link" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(text)}</a>`
        : esc(text);
      return `<li>${content}</li>`;
    }

    return `<li>${esc(item)}</li>`;
  }

  function renderResearch() {
    const tocItems = data.research.map((item) => ({
      id: sectionId("research", item.title),
      label: item.title
    }));

    return `
      ${pageIntro("Research", "Work", "Projects, code, and shared hydrologic datasets")}
      ${renderTocLayout(tocItems, list(data.research, (item, index) => `
        <section class="content-section research-section" id="${esc(sectionId("research", item.title))}">
          ${renderPeopleBlockHeading(String(index + 1).padStart(2, "0"), item.title)}
          ${item.url
            ? `<article class="research-data-row compact-person-row"><h2><a href="${esc(item.url)}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.text || item.title)}</a></h2></article>`
            : `<p class="empty-note">${esc(item.text || "To be updated.")}</p>`}
        </section>
      `))}
    `;
  }

  function renderPublications() {
    const papers = [...(data.publications || [])].sort((a, b) => newsDateValue(b.date || b.year) - newsDateValue(a.date || a.year));
    const years = [...new Set(papers.map((paper) => paper.year))].sort((a, b) => Number(b) - Number(a));
    const tocItems = years.map((year) => ({ id: `year-${year}`, label: String(year) }));

    return `
      ${pageIntro("Publications", "Archive", "A curated list will be updated manually")}
      ${renderTocLayout(tocItems, list(years, (year) => `
        <section class="content-section publication-year" id="year-${esc(year)}">
          <div class="publication-list">
            ${list(papers.filter((paper) => paper.year === year), renderPublication)}
          </div>
        </section>
      `))}
    `;
  }

  function renderPublication(paper) {
    const citation = renderPublicationCitation(paper);
    const content = paper.url
      ? `<a href="${esc(paper.url)}" target="_blank" rel="noopener">${citation}</a>`
      : citation;
    return `
      <article class="publication">
        <h2>${content}</h2>
      </article>
    `;
  }

  function renderPublicationCitation(paper) {
    const year = paper.year || String(paper.date || "").slice(0, 4);
    const authors = String(paper.authors || "").trim();
    const title = String(paper.title || "").trim();
    const journal = String(paper.journal || "").trim();
    const details = String(paper.details || "").trim();
    const firstAuthor = firstCitationAuthor(authors);
    const remainingAuthors = firstAuthor ? authors.slice(firstAuthor.length) : authors;
    const authorText = authors
      ? `<strong class="publication-first-author">${esc(firstAuthor)}</strong><span class="publication-muted">${esc(remainingAuthors)}${year ? ` (${esc(year)}).` : "."}</span>`
      : year
        ? `<span class="publication-muted">(${esc(year)}).</span>`
        : "";
    return [
      authorText,
      title ? `<strong class="publication-title">${esc(title)}.</strong>` : "",
      journal ? `<span class="publication-muted">${esc(journal)}${details ? `, ${esc(details)}` : ""}.</span>` : "",
    ].filter(Boolean).join(" ");
  }

  function firstCitationAuthor(authors) {
    const parts = String(authors || "").split(", ");
    return parts.length > 1 ? parts.slice(0, 2).join(", ") : String(authors || "");
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

  function displayNewsDate(date) {
    return String(date || "").replace(/\s+\d{1,2}:\d{2}.*$/, "");
  }

  function renderNewsMeta(item) {
    const parts = [item.type, item.date ? displayNewsDate(item.date) : "", item.speaker || ""].filter(Boolean);
    return parts.join(" / ");
  }
  function newsDateValue(date) {
    const source = String(date || "");
    const full = source.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (full) return Date.parse(`${full[1]}-${full[2]}-${full[3]}T00:00:00Z`);
    const year = source.match(/^(\d{4})$/);
    if (year) return Date.parse(`${year[1]}-01-01T00:00:00Z`);
    return 0;
  }

  function newsLinkTarget(item) {
    if (item.url) return item.url;
    if (item.image) return assetUrl(item.image);
    if (item.flyerUrl) return assetUrl(item.flyerUrl);
    return "";
  }
  function renderNewsLine(item) {
    return `
      <article class="news-line compact-news-line">
        <div>
          <span>${esc(renderNewsMeta(item))}</span>
          <h3>${newsLinkTarget(item) ? `<a href="${esc(newsLinkTarget(item))}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.title)}</a>` : esc(item.title)}</h3>
        </div>
      </article>
    `;
  }

  function renderJoin() {
    const joinItems = [
      {
        id: "global-research-program",
        label: "Research Program",
        title: data.join.program,
        text: data.join.text,
        url: data.join.programUrl
      },
      {
        id: "phd-admission",
        label: "PhD Admission",
        title: "PhD admission",
        text: data.join.phd,
        email: displayEmail(data.site.email)
      },
      {
        id: "postdoctoral-fellow",
        label: "Postdoctoral Fellow",
        title: "Postdoctoral Fellow",
        text: data.join.postdoc,
        url: assetUrl(data.join.postdocUrl)
      },
      {
        id: "visiting-scholar-domestic",
        label: "Visiting Scholar",
        title: data.join.visitingScholar,
        url: data.join.visitingScholarUrl
      }
    ];
    const tocItems = joinItems.map((item) => ({ id: item.id, label: item.label }));

    return `
      ${pageIntro("How to join?", "Openings", "Research programs, admission, and visitor opportunities")}
      ${renderTocLayout(tocItems, list(joinItems, (item, index) => `
        <article class="content-section join-section" id="${esc(item.id)}">
          ${renderPeopleBlockHeading(String(index + 1).padStart(2, "0"), item.title)}
          ${item.text ? `<p>${esc(item.text)}</p>` : ""}
          ${item.url ? `<p><a class="inline-detail-link" href="${esc(item.url)}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>see details</a></p>` : ""}
          ${item.email ? `<p class="plain-email join-email">${esc(item.email)}</p>` : ""}
        </article>
      `))}
    `;
  }

  function fitPlainEmails() {
    document.querySelectorAll(".plain-email").forEach((email) => {
      email.style.fontSize = "";
      const baseSize = parseFloat(window.getComputedStyle(email).fontSize);
      if (!baseSize || email.scrollWidth <= email.clientWidth) return;

      const minSize = 7.5;
      let nextSize = baseSize;
      while (nextSize > minSize && email.scrollWidth > email.clientWidth) {
        nextSize -= 0.5;
        email.style.fontSize = `${nextSize}px`;
      }
    });
  }

  function setupResponsiveEmailFit() {
    fitPlainEmails();
    window.addEventListener("resize", () => {
      window.clearTimeout(window.__plainEmailFitTimer);
      window.__plainEmailFitTimer = window.setTimeout(fitPlainEmails, 90);
    });
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
  setupResponsiveEmailFit();
})();
