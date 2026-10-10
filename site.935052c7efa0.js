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
        || (page === "phd-admission-2027" && key === "join")
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
    const description = item.description
      ? `<p class="research-description">${esc(item.description)}</p>`
      : "";
    if (item.route) {
      return `<article class="research-data-row compact-person-row"><h2><a href="${href(item.route)}"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.text || item.title)}</a></h2>${description}</article>`;
    }
    if (item.url) {
      return `<article class="research-data-row compact-person-row"><h2><a href="${esc(assetUrl(item.url))}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.text || item.title)}</a></h2>${description}</article>`;
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
      <h1>${esc(selectedProject.title)}</h1><p>${esc(selectedProject.question)}</p><p>A Student Research Training (SRT) opportunity for Tsinghua undergraduates in the 2026&ndash;2027 academic year.</p>
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
      <div class="srt-actions"><a href="https://info2021.tsinghua.edu.cn/" target="_blank" rel="noopener">Open the Tsinghua portal &nearr;</a></div><p>Project enquiries: <span class="publication-title">tangqh (at) tsinghua.edu.cn</span></p>
      <p>Applications are submitted through the university SRT system. Please confirm the final dates and requirements there before applying.</p>
    </section></section>`;
}

function renderSrtMedia() {
  return `<figure class="srt-media"><img src="${esc(assetUrl('./public/assets/srt/magic-sand-setup.jpg'))}" width="2560" height="1920" alt="MagicSand example: elevation colors projected onto a physical sand surface" loading="lazy" /><figcaption>External example &middot; <a class="video-source-link" href="https://github.com/thomwolf/Magic-Sand" target="_blank" rel="noopener" aria-label="Thomas Wolf / Magic-Sand on GitHub (opens in a new tab)"><svg class="source-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.09 1.15a10.76 10.76 0 0 1 5.62 0c2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.69.12 2.98.72.79 1.15 1.79 1.15 3.02 0 4.32-2.64 5.28-5.15 5.56.41.35.77 1.03.77 2.08v3.09c0 .3.21.65.78.54A11.25 11.25 0 0 0 12 .75Z" /></svg>Thomas Wolf / Magic-Sand</a></figcaption></figure>
  <figure class="srt-media"><video controls playsinline preload="metadata" aria-label="UC Davis augmented reality sandbox: terrain interaction and water flow"><source src="${esc(assetUrl('./public/assets/srt/ar-sandbox-demo.mp4'))}" type="video/mp4" />Your browser does not support embedded video. <a href="${esc(assetUrl('./public/assets/srt/ar-sandbox-demo.mp4'))}">Download the demonstration</a>.</video><figcaption>External example &middot; <a class="video-source-link" href="https://www.youtube.com/watch?v=j9JXtTj0mzE" target="_blank" rel="noopener" aria-label="UC Davis / Oliver Kreylos on YouTube (opens in a new tab)"><svg class="youtube-icon" viewBox="0 0 24 17" width="24" height="17" aria-hidden="true" focusable="false"><rect width="24" height="17" rx="4" fill="#ff0000" /><path d="M9.5 4.5 16 8.5 9.5 12.5Z" fill="#fff" /></svg>UC Davis / Oliver Kreylos</a></figcaption></figure>
`;
}

function renderEducation() {
  return renderOpportunityGroups(data.education, {
    numberedHeadings: true,
    emptyOngoing: "No current courses or programs.",
    emptyArchive: "No archived courses or programs yet."
  });
}

  function renderSummerTraining() {
    const st = data.summerTraining || {};
    const photos = st.photos || [];
    const slides = (st.carousel || []).map(id => photos.find(photo => photo.id === id)).filter(Boolean);
    const arrow = (direction) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction === 'left' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;
    return `
      <article class="event-retrospective">
        <header class="event-intro event-shell">
          <div class="event-eyebrow"><span>Program retrospective</span><span>Beijing / 2026</span></div>
          <div class="event-title-grid">
            <h1>${esc(st.title)}</h1>
            <a href="#handbook" class="event-text-link">Explore the program handbook <span aria-hidden="true">↗</span></a>
          </div>
          <div class="event-facts"><span>${esc(st.dates)}</span><span>Tsinghua University &amp; IGSNRR, CAS</span><span class="event-completed">Successfully concluded</span></div>
        </header>

        <section class="event-carousel event-shell" aria-label="Program highlights" aria-roledescription="carousel" data-event-carousel>
          <div class="event-carousel-stage">
          <div class="event-slides" id="event-slides">
            ${list(slides, (photo, i) => {
              const offset = i > slides.length / 2 ? i - slides.length : i;
              const carouselImage = photo.carouselImage || photo;
              return `
              <figure class="event-slide ${i === 0 ? 'is-current' : ''} ${Math.abs(offset) === 1 ? 'is-adjacent' : ''}" data-event-slide style="--slide-offset: ${offset}" aria-hidden="${i !== 0}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}">
                <button type="button" class="event-photo-open" data-event-photo="${photo.id}" tabindex="${i === 0 ? '0' : '-1'}" aria-label="View photograph ${i + 1}: ${esc(photo.alt)}">
                  <img src="${esc(assetUrl(carouselImage.src))}" width="${carouselImage.width}" height="${carouselImage.height}" alt="${esc(photo.alt)}"${photo.objectPosition ? ` style="object-position: ${esc(photo.objectPosition)}"` : ''} ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async" />
                </button>
              </figure>`; })}
          </div>
          <button type="button" class="event-icon-button event-stage-prev" data-event-prev aria-label="Previous slide" aria-controls="event-slides">${arrow('left')}</button>
          <button type="button" class="event-icon-button event-stage-next" data-event-next aria-label="Next slide" aria-controls="event-slides">${arrow('right')}</button>
          </div>
          <div class="event-carousel-footer">
            <span class="event-screen-reader" role="status" aria-live="polite" aria-atomic="true" data-event-announcement></span>
            <div class="event-carousel-dots" role="group" aria-label="Choose a photograph">${list(slides, (photo, i) => `<button type="button" data-event-dot="${i}" aria-label="Go to slide ${i + 1}" aria-current="${i === 0}" aria-controls="event-slides"><span></span></button>`)}</div>
            <div class="event-carousel-controls">
              <button type="button" class="event-play-control" data-event-play aria-label="Pause slideshow"><span data-event-play-icon aria-hidden="true">Ⅱ</span><span data-event-play-label>Pause</span></button>
            </div>
          </div>
        </section>

        <nav class="event-section-nav event-shell" aria-label="On this page"><a href="#recap">The program</a><a href="#journey">The journey</a><a href="#photographs">Photographs</a><a href="#handbook">Handbook</a></nav>

        <section class="event-overview event-shell" id="recap">
          <div class="event-section-heading"><p class="event-kicker">01 / The program</p><h2>Program overview</h2><p class="event-section-copy">${esc(st.overview)}</p></div>
          <div class="event-themes">${list(st.themes, (theme, i) => `<section><span class="event-small-number">${['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</span><div><h3>${esc(theme.title)}</h3><p>${esc(theme.text)}</p></div></section>`)}</div>
        </section>

        <section class="event-journey" id="journey"><div class="event-shell event-journey-grid">
          <div class="event-section-heading"><p class="event-kicker">02 / The journey</p><h2>Program schedule</h2><p class="event-section-copy">${esc(st.journeyIntroduction)}</p></div>
          <div class="event-timeline">${list(st.journey, entry => `<article><p class="event-timeline-date">${esc(entry.date)}<span>2026</span></p><div><p class="event-venue">${esc(entry.venue)}</p><h3>${esc(entry.title)}</h3><p>${esc(entry.text)}</p></div></article>`)}</div>
        </div></section>

        <section class="event-gallery event-shell" id="photographs">
          <h2 class="event-kicker">03 / Photographs</h2>
          <div class="event-gallery-toolbar"><div class="event-gallery-filters" role="group" aria-label="Photo collection">${list(st.galleryCategories, (category, i) => `<button type="button" data-event-filter="${category.id}" aria-pressed="${i === 0}">${esc(category.label)} <span>${photos.filter(p => p.category === category.id).length}</span></button>`)}</div></div>
          <div class="event-photo-grid">${list(photos, (photo, i) => `<figure data-event-category="${esc(photo.category)}" ${photo.category !== st.galleryCategories[0].id ? 'hidden' : ''}><button type="button" class="event-photo-open" data-event-photo="${photo.id}" aria-label="View photograph ${i + 1}: ${esc(photo.alt)}"><img src="${esc(assetUrl(photo.thumb))}" width="${photo.width}" height="${photo.height}" alt="${esc(photo.alt)}" loading="lazy" decoding="async" /></button></figure>`)}</div>
        </section>

        <section class="event-handbook event-shell" id="handbook">
          <div class="event-handbook-cover"><a href="${esc(assetUrl(st.handbook?.url))}" target="_blank" rel="noopener" aria-label="Open the program handbook PDF"><img src="${esc(assetUrl(st.handbook?.cover))}" alt="Cover of the 2026 Global Change Hydrology program handbook" width="720" height="1018" loading="lazy" /></a></div>
          <div class="event-handbook-copy"><p class="event-kicker">04 / The handbook</p><h2>Program handbook</h2><a class="event-download" href="${esc(assetUrl(st.handbook?.url))}" download="APPLAUD-Beijing-Workshop-Handbook-2026.pdf">Download handbook <span aria-hidden="true">↓</span></a><p class="event-document-meta">PDF · 11 pages · 0.9 MB</p></div>
        </section>

        <footer class="event-credits event-shell"><p>${esc(st.acknowledgement)}</p><div class="event-partners">${list(st.partners, partner => `<img src="${esc(assetUrl(partner.logo))}" alt="${esc(partner.name)}" loading="lazy" />`)}</div></footer>
      </article>
      <dialog class="event-lightbox" aria-label="Program photograph viewer" data-event-lightbox>
        <div class="event-lightbox-top"><span data-event-photo-count aria-live="polite"></span><button type="button" data-event-close aria-label="Close photograph viewer">Close <span aria-hidden="true">×</span></button></div>
        <figure><img data-event-full-photo alt="" /></figure>
        <div class="event-lightbox-controls"><button type="button" class="event-icon-button" data-event-photo-prev aria-label="Previous photograph">${arrow('left')}</button><button type="button" class="event-icon-button" data-event-photo-next aria-label="Next photograph">${arrow('right')}</button></div>
      </dialog>
    `;
  }

  function setupSummerGallery() {
    const carousel = document.querySelector('[data-event-carousel]');
    if (!carousel) return;
    document.documentElement.classList.add('event-smooth-scroll');
    const st = data.summerTraining;
    const photos = st.photos;
    const slides = Array.from(carousel.querySelectorAll('[data-event-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-event-dot]'));
    const slidePhotos = st.carousel.map(id => photos.find(photo => photo.id === id)).filter(Boolean);
    const play = carousel.querySelector('[data-event-play]');
    const dialog = document.querySelector('[data-event-lightbox]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let selectedPhoto = 0;
    let paused = reducedMotion.matches;
    let hovered = false;
    let focusSuspended = false;
    let timer = 0;
    let opener;
    let swipeStart;
    let suppressPhotoClick = false;

    function syncPlayback() {
      window.clearInterval(timer);
      play.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      play.querySelector('[data-event-play-label]').textContent = paused ? 'Play' : 'Pause';
      play.querySelector('[data-event-play-icon]').textContent = paused ? '▷' : 'Ⅱ';
      if (!paused && !hovered && !focusSuspended && !document.hidden && !dialog.open && slides.length > 1) {
        timer = window.setInterval(() => showSlide(current + 1), 6500);
      }
    }

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        let offset = (i - current + slides.length) % slides.length;
        if (offset > slides.length / 2) offset -= slides.length;
        slide.style.setProperty('--slide-offset', offset);
        slide.classList.toggle('is-current', offset === 0);
        slide.classList.toggle('is-adjacent', Math.abs(offset) === 1);
        slide.setAttribute('aria-hidden', String(offset !== 0));
        slide.querySelector('button').tabIndex = offset === 0 ? 0 : -1;
        // Load the two visible previews and the next arrival before they rotate in.
        if (Math.abs(offset) <= 2) slide.querySelector('img').loading = 'eager';
        dots[i].setAttribute('aria-current', String(offset === 0));
      });
    }

    function selectSlide(index) {
      const focusOnPhoto = document.activeElement?.closest('[data-event-slide]');
      paused = true;
      showSlide(index);
      if (focusOnPhoto) slides[current].querySelector('button').focus({ preventScroll: true });
      syncPlayback();
      carousel.querySelector('[data-event-announcement]').textContent = `Slide ${current + 1} of ${slides.length}. ${slidePhotos[current].alt}`;
    }

    function stepSlide(direction) { selectSlide(current + direction); }

    carousel.querySelector('[data-event-prev]').addEventListener('click', () => stepSlide(-1));
    carousel.querySelector('[data-event-next]').addEventListener('click', () => stepSlide(1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => selectSlide(i)));
    play.addEventListener('click', () => {
      paused = !paused;
      if (!paused) { hovered = false; focusSuspended = false; }
      syncPlayback();
    });
    carousel.addEventListener('mouseenter', () => { hovered = true; syncPlayback(); });
    carousel.addEventListener('mouseleave', () => { hovered = false; syncPlayback(); });
    carousel.addEventListener('focusin', () => { focusSuspended = true; syncPlayback(); });
    carousel.addEventListener('focusout', event => {
      if (!carousel.contains(event.relatedTarget)) {
        focusSuspended = false;
        syncPlayback();
      }
    });
    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        stepSlide(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', event => { if (event.matches) paused = true; syncPlayback(); });
    const stage = carousel.querySelector('.event-slides');
    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') swipeStart = { x: event.clientX, y: event.clientY };
    });
    stage.addEventListener('pointerup', event => {
      if (!swipeStart) return;
      const dx = event.clientX - swipeStart.x;
      const dy = event.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        suppressPhotoClick = true;
        stepSlide(dx < 0 ? 1 : -1);
        window.setTimeout(() => { suppressPhotoClick = false; }, 350);
      }
    });
    stage.addEventListener('pointercancel', () => { swipeStart = null; });

    document.querySelectorAll('[data-event-filter]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-event-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
        document.querySelectorAll('[data-event-category]').forEach(figure => { figure.hidden = figure.dataset.eventCategory !== button.dataset.eventFilter; });
      });
    });

    function showPhoto(index) {
      selectedPhoto = (index + photos.length) % photos.length;
      const photo = photos[selectedPhoto];
      const source = opener?.closest('[data-event-slide]') ? photo.carouselImage || photo : photo;
      const image = dialog.querySelector('[data-event-full-photo]');
      image.src = assetUrl(source.src);
      image.alt = photo.alt;
      dialog.querySelector('[data-event-photo-count]').textContent = `${String(selectedPhoto + 1).padStart(2, '0')} / ${photos.length}`;
    }
    document.querySelectorAll('[data-event-photo]').forEach(button => {
      button.addEventListener('click', () => {
        if (suppressPhotoClick) return;
        const slide = button.closest('[data-event-slide]');
        if (slide && !slide.classList.contains('is-current')) {
          selectSlide(slides.indexOf(slide));
          return;
        }
        opener = button;
        showPhoto(photos.findIndex(photo => photo.id === Number(button.dataset.eventPhoto)));
        dialog.showModal();
        document.body.classList.add('event-viewer-open');
        syncPlayback();
      });
    });
    dialog.querySelector('[data-event-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-event-photo-prev]').addEventListener('click', () => showPhoto(selectedPhoto - 1));
    dialog.querySelector('[data-event-photo-next]').addEventListener('click', () => showPhoto(selectedPhoto + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(selectedPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('event-viewer-open');
      opener?.focus({ preventScroll: true });
      syncPlayback();
    });
    showSlide(0);
    syncPlayback();
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
          ${list(items, item => renderNewsLine(item))}
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

  function renderNewsLine(item, { showSummary = true } = {}) {
    const target = newsLinkTarget(item);
    const isExternal = !item.route;
    return `
      <article class="news-line compact-news-line">
        <div>
          <span>${esc(renderNewsMeta(item))}</span>
          <h3>${target ? `<a href="${esc(target)}"${isExternal ? ' target="_blank" rel="noopener"' : ""}><span class="link-icon" aria-hidden="true">&#128279;</span>${esc(item.title)}</a>` : esc(item.title)}</h3>
          ${showSummary && item.text ? `<p class="news-summary">${esc(item.text)}</p>` : ""}
        </div>
      </article>
    `;
  }

  function renderPhdRecruitment() {
    const recruitment = data.phdRecruitment;
    const tocItems = [
      { id: "overview", label: "Overview" },
      { id: "research-areas", label: "Research Areas" },
      { id: "eligibility", label: "Eligibility" },
      { id: "application-materials", label: "Materials" },
      { id: "how-to-apply", label: "How to Apply" },
      { id: "supervisor-and-group", label: "Supervisor & Group" }
    ];
    const renderLabeledItems = (items) => list(items, item => `<li><strong>${esc(item.title)}.</strong> ${esc(item.text)}</li>`);
    return `<div class="recruitment-page">${renderTocLayout(tocItems, `
      <header class="program-intro program-section" id="overview">
        <h1>${esc(recruitment.title)}</h1>
        <p><strong>${esc(recruitment.subtitle)}</strong></p>
        <p>${esc(recruitment.introduction)}</p>
        <p><strong>Deadline for submitting materials to the research group: <time datetime="2026-10-31">${esc(recruitment.deadline)}</time>.</strong></p>
      </header>
      <section class="content-section program-section" id="research-areas">
        <h2>Research Areas</h2>
        <ol>${renderLabeledItems(recruitment.researchAreas)}</ol>
        <p>${esc(recruitment.researchNote)}</p>
      </section>
      <section class="content-section program-section" id="eligibility">
        <h2>Eligibility</h2>
        <ul>${list(recruitment.eligibility, item => `<li>${esc(item)}</li>`)}</ul>
      </section>
      <section class="content-section program-section" id="application-materials">
        <h2>Application Materials</h2>
        <p>${esc(recruitment.materialsIntroduction)}</p>
        <ol>${renderLabeledItems(recruitment.materials)}</ol>
      </section>
      <section class="content-section program-section" id="how-to-apply">
        <h2>How to Apply</h2>
        <p><strong>Send your materials to:</strong> <span class="publication-title">${esc(recruitment.email)}</span></p>
        <p><strong>Email subject:</strong> ${esc(recruitment.emailSubject)}</p>
        <p>${esc(recruitment.applicationInstructions)}</p>
        <p><strong>PDF filename:</strong> ${esc(recruitment.fileName)}</p>
        <p><strong>Deadline for submitting materials to the group:</strong> ${esc(recruitment.deadline)}.</p>
        <p>${esc(recruitment.followUp)}</p>
        <p>${esc(recruitment.admissionsNotice)}</p>
        <p><a class="detail-link" href="${esc(recruitment.admissionsUrl)}" target="_blank" rel="noopener"><span class="link-icon" aria-hidden="true">&#128279;</span>Departmental admissions information</a></p>
      </section>
      <section class="content-section program-section" id="supervisor-and-group">
        <h2>Supervisor &amp; Research Group</h2>
        <p>${esc(recruitment.supervisor)}</p>
        <p>${esc(recruitment.group)}</p>
        <p><a class="detail-link" href="${personHref("qiuhong-tang")}"><span class="link-icon" aria-hidden="true">&#128279;</span>Prof. Qiuhong Tang</a></p>
      </section>
    `)}</div>`;
  }

  function renderJoin() {
    return renderOpportunityGroups(data.join, { numberedHeadings: true });
  }

  function renderOpportunityGroups(entries, {
    numberedHeadings = false,
    emptyOngoing = "No current opportunities.",
    emptyArchive = "No archived opportunities yet."
  } = {}) {
    const now = Date.now();
    const items = [...(entries || [])].sort((a, b) => newsDateValue(b.date) - newsDateValue(a.date));
    const isArchived = item => item.status === "archive" || (item.closesAt && now > Date.parse(item.closesAt));
    const groups = [
      { id: "ongoing", label: "Ongoing", items: items.filter(item => !isArchived(item)), empty: emptyOngoing },
      { id: "archive", label: "Archive", items: items.filter(isArchived), empty: emptyArchive }
    ];
    return renderTocLayout(groups, list(groups, (group, index) => `
      <section class="content-section opportunity-group" id="${group.id}" aria-label="${group.label}">
        ${numberedHeadings ? renderPeopleBlockHeading(String(index + 1).padStart(2, "0"), group.label) : `<h2 id="${group.id}-heading">${group.label}</h2>`}
        ${group.items.length ? `<div class="news-lines">${list(group.items, item => renderNewsLine(item, { showSummary: false }))}</div>` : `<p class="empty-note">${group.empty}</p>`}
      </section>
    `));
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
    "phd-admission-2027": renderPhdRecruitment,
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
  setupSummerGallery();
})();
