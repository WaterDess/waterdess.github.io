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
    ["education", "Education"],
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
      const active = key === page
        || (page === "person" && key === "people")
        || (["srt", "summer-training"].includes(page) && key === "education")
        || (page === "genuine-earth-hydrosphere" && key === "research");
      return `<a class="${active ? "active" : ""}" href="${href(key)}">${esc(label)}</a>`;
    });
  }

  function pageIntro(title) {
    return `
      <header class="section page-intro">
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

  function renderDetailAction(url, label = "see details", external = true, variant = "") {
    if (!url) return "";
    const externalAttrs = external ? ' target="_blank" rel="noopener"' : "";
    const variantClass = variant ? ` ${esc(variant)}` : "";
    return `
      <p class="detail-action">
        <a class="inline-detail-link${variantClass}" href="${esc(url)}"${externalAttrs}>
          <span class="link-icon" aria-hidden="true">&#128279;</span>${esc(label)}
        </a>
      </p>
    `;
  }

  function renderHome() {
    return `
      <section class="image-hero home-landing">
        <img class="home-earth-image" src="${esc(assetUrl(data.visuals.hero))}" alt="" fetchpriority="high" decoding="async" />
        <div class="image-hero-content">
          <div class="home-hero-copy">
            <h1>${esc(data.site.name)}</h1>
            <strong>${esc(data.site.tagline)}</strong>
          </div>
        </div>
      </section>
    `;
  }

  function renderAbout() {
    return `
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
    const graduateStudents = members.filter((person) => (person.group || "").toLowerCase() === "graduate-student");

    return `
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
          ${graduateStudents.length ? `
            <div class="member-grid compact-member-list" aria-label="Graduate Student">
              ${list(graduateStudents, renderMemberRow)}
            </div>
          ` : `<p class="empty-note">To be updated.</p>`}
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
      ${pageIntro(person.name)}
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
          ${(person.group || "").toLowerCase() !== "graduate-student" ? renderDetailBlock("Positions Held", person.positions) : ""}
          ${renderDetailBlock("Research Interests", person.interests)}
          ${person.publications?.length ? renderDetailBlock("Publications", person.publications) : ""}
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
  const groups = new Map();
  for (const item of data.research) {
    if (!groups.has(item.title)) groups.set(item.title, []);
    groups.get(item.title).push(item);
  }
  const sections = [...groups].map(([title, items]) => {
    const content = items.filter(item => item.route || item.url || item.text);
    return { title, items: content.length ? content : [items[0]] };
  });
  const tocItems = sections.map(item => ({ id: sectionId('research', item.title), label: item.title }));
  const renderResearchItem = item => {
    if (item.route) {
      return `<article class="research-data-row compact-person-row"><h2><a href="${href(item.route)}"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.text || item.title)}</a></h2></article>`;
    }
    if (item.url) {
      return `<article class="research-data-row compact-person-row"><h2><a href="${esc(assetUrl(item.url))}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.text || item.title)}</a></h2></article>`;
    }
    return `<p class="empty-note">${esc(item.text || 'To be updated.')}</p>`;
  };
  return renderTocLayout(tocItems, list(sections, (section, index) => `
    <section class="content-section research-section" id="${esc(sectionId('research', section.title))}">
      ${renderPeopleBlockHeading(String(index + 1).padStart(2, '0'), section.title)}
      ${list(section.items, renderResearchItem)}
    </section>
  `));
}

  function renderGenuineEarthHydrosphere() {
    return `
      <section class="project-preview" aria-labelledby="genuine-earth-title">
        <img class="project-preview-art" src="${esc(assetUrl("./public/assets/genuine-earth-horizon.png"))}" alt="" fetchpriority="high" decoding="async" />
        <div class="project-preview-copy">
          <h1 id="genuine-earth-title">Genuine Earth: Hydrosphere</h1>
          <p>Coming soon</p>
        </div>
      </section>
    `;
  }

function renderSrt() {
  const srt = data.srt;
  const projectKey = document.body.dataset.project;
  if (!projectKey) return `<section class="srt-section"><h1>Undergraduate Research &middot; SRT 2026&ndash;2027</h1><p>Explore two independent one-year research projects supervised by Prof. Qiuhong Tang.</p><div class="publication-list">${list(data.education.filter(item => item.route?.startsWith("srt-")), item => `<article class="publication"><h2><a href="${href(item.route)}">${esc(item.title)}</a></h2></article>`)}</div></section>`;
  const projectIndex = projectKey === "sandbox" ? 0 : 1;
  const selectedProject = srt.projects[projectIndex];
  return `<section id="education-srt" class="srt-section indexed-section" lang="en">
    <header class="srt-intro"><p class="srt-eyebrow">UNDERGRADUATE RESEARCH &middot; SRT 2026&ndash;2027</p>
      <p class="srt-back"><a href="${href("education")}">&larr; Education</a></p><h1>${esc(selectedProject.title)}</h1><p>${esc(selectedProject.question)}</p><p>A Student Research Training (SRT) opportunity for Tsinghua undergraduates in the 2026&ndash;2027 academic year.</p>
      <p>Supervisor: Prof. Qiuhong Tang &middot; Department of Earth System Science, Tsinghua University</p>
      <div class="srt-facts"><span>For undergraduates</span><span>Up to 5 students</span><span>3 credits</span><span>1 year</span></div>
      <div class="srt-callout"><strong>Student applications: 15&ndash;25 October 2026</strong><p>Interested in joining? Explore the project below and contact the supervisor. Please check the SRT system for the final application dates and entry requirements.</p><a href="#srt-apply">How to apply &darr;</a></div>
    </header>
    ${list([selectedProject], (project) => `<article class="srt-project"><h2>Explore the project</h2>
      ${projectIndex === 0 ? renderSrtMedia() : ""}
      <figure class="srt-figure"><ol>${list(project.steps, (step, i) => `<li><span aria-hidden="true">0${i + 1}</span><strong>${esc(step)}</strong></li>`)}</ol><figcaption>Illustrative research workflow; not completed research results.</figcaption></figure>
      <p>${esc(project.text)}</p><div class="srt-outcomes"><div><h3>What you will learn</h3><p>${esc(project.learning)}</p></div><div><h3>What we will build together</h3><p>${esc(project.outcome)}</p></div></div>
      <section class="srt-schedule"><h3>Your research journey</h3><ul>${list(project.plan, item => `<li>${esc(item)}</li>`)}</ul></section>
    </article>`)}
    <section id="srt-apply" class="srt-apply indexed-section"><h2>How to apply</h2><p>SRT is Tsinghua University's Student Research Training program. Contact the supervisor to discuss your interests and learn more about this project. From 15 to 25 October 2026, log in to the Tsinghua information portal, find this project in the SRT system, review its entry requirements, and submit your application.</p>
      <div class="srt-actions"><a href="https://info2021.tsinghua.edu.cn/" target="_blank" rel="noopener">Open the Tsinghua portal &nearr;</a><a href="mailto:tangqh@tsinghua.edu.cn">Contact the supervisor</a></div><p>Project enquiries: tangqh (at) tsinghua.edu.cn</p>
      <p>Applications are submitted through the university SRT system. Please confirm the final dates and requirements there before applying.</p>
    </section></section>`;
}

function renderSrtMedia() {
  return `<figure class="srt-media"><img src="${esc(assetUrl('./public/assets/srt/magic-sand-setup.jpg'))}" width="2560" height="1920" alt="MagicSand example: elevation colors projected onto a physical sand surface" loading="lazy" /><figcaption>External example, not a photograph of our group's equipment. Image: <a href="https://github.com/thomwolf/Magic-Sand" target="_blank" rel="noopener">Thomas Wolf / Magic-Sand</a> (repository GPL-2.0 license; <a href="${esc(assetUrl('./public/assets/srt/Magic-Sand-COPYING.txt'))}">license text</a>).</figcaption></figure>
  <figure class="srt-media"><video controls playsinline preload="metadata" aria-label="UC Davis augmented reality sandbox: terrain interaction and water flow"><source src="${esc(assetUrl('./public/assets/srt/ar-sandbox-demo.mp4'))}" type="video/mp4" />Your browser does not support embedded video. <a href="${esc(assetUrl('./public/assets/srt/ar-sandbox-demo.mp4'))}">Download the demonstration</a>.</video><figcaption>Terrain interaction and water-flow demonstration by UC Davis / Oliver Kreylos. <a href="https://www.youtube.com/watch?v=j9JXtTj0mzE" target="_blank" rel="noopener">Original video</a>.</figcaption></figure>
  <p class="srt-source">External demonstration from <a href="https://web.cs.ucdavis.edu/~okreylos/ResDev/SARndbox/Movies.html" target="_blank" rel="noopener">UC Davis / Oliver Kreylos</a>. This illustrates a related AR Sandbox implementation, not the current capabilities of our group's equipment.</p>`;
}

function renderEducation() {
  const items = data.education || [];
  const years = [...new Set(items.map(item => item.year))].sort((a, b) => b - a);
  return renderTocLayout(years.map(year => ({ id: `year-${year}`, label: String(year) })), list(years, year => `
    <section class="content-section publication-year" id="year-${esc(year)}"><div class="publication-list">
      ${list(items.filter(item => item.year === year), item => `<article class="publication"><h2><a href="${esc(item.route ? href(item.route) : assetUrl(item.url))}"${item.route ? "" : ' target="_blank" rel="noopener"'}><strong class="publication-title">${esc(item.title)}</strong></a></h2></article>`)}
    </div></section>`));
}

  function renderSummerTraining() {
    const st = data.summerTraining || {};
    const tocItems = [
      { id: "overview", label: "Program Theme" },
      { id: "registration", label: "Registration" },
      { id: "objectives", label: "Objectives" },
      { id: "sponsors", label: "Sponsors" },
      { id: "faculty", label: "Faculty" },
      { id: "participants", label: "Participants" },
      { id: "schedule", label: "Schedule" }
    ];

    const logosHtml = (st.sponsorLogos || []).length
      ? `<div class="summer-training-logos" aria-label="Sponsoring institutions">${list(st.sponsorLogos, (logo) => `<img src="${esc(assetUrl(logo))}" alt="" loading="lazy" />`)}</div>`
      : "";

    const objectivesHtml = (st.objectives || []).length
      ? `<ul>${list(st.objectives, (item) => `<li>${esc(item)}</li>`)}</ul>`
      : "";

    const scheduleHtml = list(st.schedule || [], (entry) => {
      const meta = [entry.day, entry.venue ? `Venue: ${entry.venue}` : ""].filter(Boolean).join(" / ");
      const itemsHtml = (entry.items || []).length
        ? `<ul>${list(entry.items, (item) => `<li>${esc(item)}</li>`)}</ul>`
        : "";

      return `
        <article class="summer-training-day">
          <p class="summer-training-day-meta">${esc(meta)}</p>
          <h3 class="summer-training-day-title">${esc(entry.title)}</h3>
          ${itemsHtml}
        </article>
      `;
    });

    const countdownHtml = st.registration?.closesAt
      ? `
        <div class="registration-countdown" data-registration-deadline="${esc(st.registration.closesAt)}">
          <span>Registration closes in</span>
          <strong data-registration-countdown>Calculating...</strong>
        </div>
      `
      : "";

    const registrationHtml = st.registration && st.registration.url
      ? `
        ${countdownHtml}
        <p class="registration-deadline">${esc(st.registration.deadline || "")}</p>
      `
      : (st.registration ? `<p>${esc(st.registration.deadline || "")}</p>` : "");

    const content = `
      <section class="content-section program-section" id="overview">
        <h2>Program Theme</h2>
        <p class="summer-training-lead">${esc(st.theme || "")}</p>
      </section>
      <section class="content-section program-section program-registration" id="registration">
        <h2>Registration</h2>
        ${registrationHtml}
      </section>
      <section class="content-section program-section" id="objectives">
        <h2>Program Objectives</h2>
        ${objectivesHtml}
      </section>
      <section class="content-section program-section" id="sponsors">
        <h2>Sponsors and Acknowledgements</h2>
        <p>${esc(st.sponsors || "")}</p>
      </section>
      <section class="content-section program-section" id="faculty">
        <h2>Faculty &amp; Lecturers</h2>
        <p>${esc(st.faculty || "")}</p>
      </section>
      <section class="content-section program-section" id="participants">
        <h2>Eligible Participants</h2>
        <p>${esc(st.eligibility || "")}</p>
      </section>
      <section class="content-section program-section" id="schedule">
        <h2>Detailed Daily Schedule</h2>
        ${scheduleHtml}
      </section>
    `;

    return `
      ${renderTocLayout(tocItems, `
      <header class="summer-training-intro">
        <h1>${esc(st.title || "")}</h1>
        <p class="summer-training-when">${esc(st.subtitle || "")}</p>
        ${logosHtml}
      </header>
      ${content}
      `)}
    `;
  }

  function renderPublications() {
    const papers = [...(data.publications || [])].sort((a, b) => newsDateValue(b.date || b.year) - newsDateValue(a.date || a.year));
    const years = [...new Set(papers.map((paper) => paper.year))].sort((a, b) => Number(b) - Number(a));
    const tocItems = years.map((year) => ({ id: `year-${year}`, label: String(year) }));

    return `
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
    if (item.route) return href(item.route);
    if (item.url) return assetUrl(item.url);
    if (item.image) return assetUrl(item.image);
    return "";
  }

  function renderNewsLine(item) {
    const target = newsLinkTarget(item);
    const isExternal = !item.route;
    return `
      <article class="news-line compact-news-line">
        <div>
          <span>${esc(renderNewsMeta(item))}</span>
          <h3>${target ? `<a href="${esc(target)}"${isExternal ? ' target="_blank" rel="noopener"' : ""}><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.title)}</a>` : esc(item.title)}</h3>
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
        url: assetUrl(data.join.phdUrl)
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
      ${renderTocLayout(tocItems, list(joinItems, (item, index) => `
        <article class="content-section indexed-section join-section" id="${esc(item.id)}">
          ${renderPeopleBlockHeading(String(index + 1).padStart(2, "0"), item.title)}
          ${item.text ? `<p>${esc(item.text)}</p>` : ""}
          ${renderDetailAction(item.url)}
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

  function setupRegistrationCountdown() {
    const countdown = document.querySelector("[data-registration-deadline]");
    const value = countdown?.querySelector("[data-registration-countdown]");
    if (!countdown || !value) return;

    const deadline = Date.parse(countdown.dataset.registrationDeadline || "");
    if (!Number.isFinite(deadline)) {
      countdown.hidden = true;
      return;
    }

    let timer = 0;
    const update = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        value.textContent = "Registration has closed";
        if (timer) window.clearInterval(timer);
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (part) => String(part).padStart(2, "0");
      value.textContent = `${days} days ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    update();
    timer = window.setInterval(update, 1000);
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
    education: renderEducation,
    srt: () => `<div class="section srt-page">${renderSrt()}</div>`,
    "summer-training": renderSummerTraining,
    "genuine-earth-hydrosphere": renderGenuineEarthHydrosphere
  };

  if (!data) {
    app.innerHTML = '<section class="loading">Site data is missing.</section>';
    return;
  }

  setupChrome();
  app.innerHTML = (renderers[page] || renderHome)();
  setupResponsiveEmailFit();
  setupRegistrationCountdown();
})();
