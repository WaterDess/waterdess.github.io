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
    document.documentElement.lang = page === "srt" ? "zh-CN" : "en";
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
  return `<section id="education-srt" class="srt-section indexed-section" lang="zh-CN">
    <header class="srt-intro"><p class="srt-eyebrow">UNDERGRADUATE RESEARCH · SRT 2026–2027</p>
      <h1>${esc(srt.title)}</h1><p>${esc(srt.intro)}</p>
      <p>指导教师：汤秋鸿｜清华大学地球系统科学系长聘教授</p>
      <div class="srt-facts"><span>本科生研究训练</span><span>每项拟招 5 人</span><span>每项 3 学分</span><span>周期 1 年</span></div>
      <div class="srt-callout"><strong>学生报名参考时间：2026 年 10 月 15—25 日</strong><p>9 月 14—27 日为立项申请阶段。项目获批情况、名额及实际时间以 SRT 系统和教务处实践办通知为准。</p><a href="#srt-apply">查看参与方式 ↓</a></div>
    </header>
    ${list(srt.projects, (project, index) => `<article class="srt-project"><h2>${esc(project.title)}</h2><p class="srt-question">${esc(project.question)}</p>
      ${index === 0 ? `<figure class="srt-media"><img src="${esc(assetUrl('./public/assets/srt/magic-sand-setup.jpg'))}" width="2560" height="1920" alt="MagicSand 原项目示例：真实沙面上投影出不同高程的地形色彩" loading="lazy" /><figcaption>外部案例，非课题组实拍。图片来源：<a href="https://github.com/thomwolf/Magic-Sand" target="_blank" rel="noopener">Thomas Wolf / Magic-Sand</a>（仓库 GPL-2.0 许可，<a href="${esc(assetUrl('./public/assets/srt/Magic-Sand-COPYING.txt'))}">许可文本</a>）。</figcaption></figure><p class="srt-demo"><a href="https://www.youtube.com/watch?v=j9JXtTj0mzE" target="_blank" rel="noopener">▶ 观看 UC Davis 地形交互与水流演示</a> · <a href="https://www.youtube.com/watch?v=d_ZHsgKjNNk" target="_blank" rel="noopener">溃坝与堤防漫溢演示</a></p><p class="srt-source">演示来自 <a href="https://web.cs.ucdavis.edu/~okreylos/ResDev/SARndbox/Movies.html" target="_blank" rel="noopener">UC Davis / Oliver Kreylos 的 AR Sandbox 项目</a>，用于展示同类技术的可能性，并非本组当前设备效果。视频托管于 YouTube。</p>` : ""}
      <figure class="srt-figure"><ol>${list(project.steps, (step, i) => `<li><span aria-hidden="true">0${i + 1}</span><strong>${esc(step)}</strong></li>`)}</ol><figcaption>研究流程示意，不代表已完成成果</figcaption></figure>
      <p>${esc(project.text)}</p><div class="srt-outcomes"><div><h3>你将学到什么</h3><p>${esc(project.learning)}</p></div><div><h3>一起完成什么</h3><p>${esc(project.outcome)}</p></div></div>
      <details><summary>研究进度与经费安排</summary><ul>${list(project.plan, item => `<li>${esc(item)}</li>`)}</ul><p>${esc(project.budget)}</p><p>经费为项目申请预算，非学生个人补助，最终以审批为准。</p></details>
    </article>`)}
    <section id="srt-apply" class="srt-apply indexed-section"><h2>如何参与</h2><p>SRT 是清华大学大学生研究训练计划。感兴趣的本科生可先联系指导教师咨询研究内容；学生报名阶段请登录清华大学信息门户，在 SRT 系统查询获批项目及具体接纳要求后报名。</p>
      <div class="srt-actions"><a href="https://info2021.tsinghua.edu.cn/" target="_blank" rel="noopener">进入清华大学信息门户 ↗</a><a href="mailto:tangqh@tsinghua.edu.cn">联系指导教师</a></div><p>咨询邮箱：tangqh (at) tsinghua.edu.cn</p>
      <h3>2026 年秋季学期参考时间表</h3><table><thead><tr><th scope="col">环节</th><th scope="col">参考时间（2026 年）</th></tr></thead><tbody>${list(srt.dates, ([label, date]) => `<tr${label === "学生报名" ? ' class="srt-registration-row"' : ""}><th scope="row">${esc(label)}</th><td>${esc(date)}</td></tr>`)}</tbody></table>
      <details><summary>立项、经费与成绩说明</summary><p>本学期仅 1 个立项批次，每位教师立项不超过 2 项，每位学生立项不超过 1 项，每个项目最多接收 5 名学生。学生立项提交后，须由指导教师及时审核。</p><p>项目经费不超过 5,000 元／项；不申请经费的项目不支持经费；经费不得用于发放勤工助学费。2026—2027 学年启动项目的经费于该学年春季学期下拨。</p><p>指导教师可根据实际结题情况提交成绩，提交后原则上不得更改。成绩通常于春、秋学期的学期中和学期末同步至成绩单，无需师生操作。请及时核查成绩；如有异议，须在规定复议期内向指导教师所在院系提出申请，按学校成绩管理流程办理。</p></details>
      <p class="srt-source">通知来源：教务处实践教学办公室，2026 年 9 月 14 日。实际节点以教务处实践办通知为准。教务咨询：010-62785589；jwcsjk (at) mailoa.tsinghua.edu.cn。</p>
    </section></section>`;
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
