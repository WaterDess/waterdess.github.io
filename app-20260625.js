(function () {
  const data = window.TANG_SITE;
  const app = document.getElementById("app");
  const page = document.body.dataset.page || "home";
  const labels = {
    zh: {
      langName: "中文",
      otherLang: "EN",
      nav: {
        about: "简介",
        research: "研究",
        people: "团队",
        publications: "论文",
        news: "动态",
        contact: "联系"
      },
      pages: {
        about: ["课题组简介", "聚焦水循环变化与水资源安全的研究团队。"],
        research: ["研究方向", "围绕水文过程、气候变化、观测模拟与决策支持展开研究。"],
        people: ["团队成员", "课题组负责人及学术经历。"],
        publications: ["近期论文", "公开学术记录中的代表性近期成果。"],
        news: ["团队动态", "基于公开主页和论文记录整理的近期信息。"],
        contact: ["联系信息", "欢迎开展学术交流与合作。"]
      },
      home: {
        eyebrow: "清华大学地球系统科学系",
        quick: [
          ["研究", "四个相互关联的水文与全球变化研究方向"],
          ["论文", "近期代表论文与 DOI 链接"],
          ["团队", "课题组负责人简介与学术经历"]
        ],
        profileTitle: "研究概览",
        profileKicker: "概览",
        latestTitle: "近期动态",
        latestKicker: "更新",
        featureTitle: "全球变化水文学",
        featureMeta: "观测 · 模型 · 风险预警",
        piLabel: "负责人",
        selectedPubsTitle: "代表论文",
        selectedPubsKicker: "成果"
      },
      people: {
        role: "课题组负责人",
        experience: "工作经历",
        education: "教育经历"
      },
      publications: {
        doi: "DOI",
        originalTitle: "原文标题"
      },
      contact: {
        email: "邮箱",
        phone: "电话",
        website: "教师主页"
      },
      sources: {}
    },
    en: {
      langName: "EN",
      otherLang: "中文",
      nav: {
        about: "About",
        research: "Research",
        people: "People",
        publications: "Publications",
        news: "News",
        contact: "Contact"
      },
      pages: {
        about: ["About", "A research group focused on water-cycle change and water security."],
        research: ["Research", "Four pillars connecting hydrology, climate change, observations, and decision support."],
        people: ["People", "Principal investigator profile and academic background."],
        publications: ["Publications", "Selected recent work from public scholarly records."],
        news: ["News", "Updates assembled from public profile and publication records."],
        contact: ["Contact", "For academic communication and collaboration."]
      },
      home: {
        eyebrow: "Department of Earth System Science, Tsinghua University",
        quick: [
          ["Research", "Four connected themes in hydrology and global change"],
          ["Publications", "Selected recent papers and DOI links"],
          ["People", "Principal investigator profile and background"]
        ],
        profileTitle: "Research Profile",
        profileKicker: "At a glance",
        latestTitle: "Recent Updates",
        latestKicker: "Latest",
        featureTitle: "Global Change Hydrology",
        featureMeta: "Observation · Modeling · Risk prediction",
        piLabel: "Principal Investigator",
        selectedPubsTitle: "Selected Publications",
        selectedPubsKicker: "Work"
      },
      people: {
        role: "Principal Investigator",
        experience: "Experience",
        education: "Education"
      },
      publications: {
        doi: "DOI",
        originalTitle: "Title"
      },
      contact: {
        email: "Email",
        phone: "Phone",
        website: "Website"
      },
      sources: {}
    }
  };

  function currentLang() {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("lang");
    if (fromUrl === "zh" || fromUrl === "en") {
      localStorage.setItem("tang-site-lang", fromUrl);
      return fromUrl;
    }
    return localStorage.getItem("tang-site-lang") || "zh";
  }

  const lang = currentLang();
  const copy = labels[lang];

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function pick(item, key) {
    return lang === "zh" && item[`${key}Zh`] ? item[`${key}Zh`] : item[key];
  }

  function list(items, render) {
    return (items || []).map(render).join("");
  }

  function pageFile(targetPage = page) {
    return targetPage === "home" ? "index.html" : `${targetPage}.html`;
  }

  function withLang(href, targetLang = lang) {
    return `${href}?lang=${targetLang}`;
  }

  function sectionHeader(kicker, title, subtitle) {
    return `
      <div class="section-header">
        <span>${esc(kicker)}</span>
        <h1>${esc(title)}</h1>
        ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
      </div>
    `;
  }

  function setupChrome() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelector(".brand span").textContent = lang === "zh" ? data.profile.nameZh : data.profile.nameEn;
    document.querySelector(".brand small").textContent = lang === "zh" ? "清华大学地球系统科学系" : "Tang Research Group";
    document.querySelector(".brand").setAttribute("href", withLang("index.html"));

    document.querySelectorAll(".site-header nav a").forEach((link) => {
      const key = link.dataset.nav || (link.getAttribute("href") || "").replace(".html", "");
      if (!key) return;
      link.textContent = copy.nav[key];
      link.setAttribute("href", withLang(`${key}.html`));
      link.classList.toggle("active", key === page);
    });

    if (page === "home") {
      document.querySelectorAll(".site-header nav a").forEach((link) => link.classList.remove("active"));
    }

    const other = lang === "zh" ? "en" : "zh";
    const switcher = document.createElement("a");
    switcher.className = "language-switch";
    switcher.href = withLang(pageFile(), other);
    switcher.textContent = copy.otherLang;
    switcher.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
    document.querySelector(".site-header").appendChild(switcher);
  }

  function renderHero() {
    const profile = data.profile;
    const title = lang === "zh" ? profile.nameZh : profile.nameEn;
    const lead = lang === "zh" ? profile.taglineZh : profile.taglineEn;
    const intro = lang === "zh" ? profile.introZh : profile.introEn;
    const keywords = lang === "zh" ? profile.keywordsZh : profile.keywords;
    return `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">${esc(copy.home.eyebrow)}</p>
          <h1>${esc(title)}</h1>
          <p class="lead">${esc(lead)}</p>
          <p class="lead-en">${esc(intro)}</p>
          <div class="keyword-row">
            ${list(keywords, (item) => `<span>${esc(item)}</span>`)}
          </div>
        </div>
        ${renderHeroFeature()}
      </section>
    `;
  }

  function renderHeroFeature() {
    const profile = data.profile;
    return `
      <aside class="hero-feature" aria-label="${esc(copy.home.profileTitle)}">
        <div class="basin-visual" aria-hidden="true">
          <svg viewBox="0 0 520 260" role="presentation">
            <path class="river-main" d="M14 159 C86 118 144 129 209 89 C269 52 322 67 382 42 C435 19 472 42 506 24" />
            <path d="M101 124 C132 137 151 153 179 188" />
            <path d="M248 70 C274 98 288 116 317 140" />
            <path d="M369 48 C389 86 416 104 463 124" />
            <circle cx="210" cy="89" r="5" />
            <circle cx="383" cy="42" r="5" />
            <circle cx="318" cy="140" r="5" />
          </svg>
          <div class="feature-caption">
            <strong>${esc(copy.home.featureTitle)}</strong>
            <span>${esc(copy.home.featureMeta)}</span>
          </div>
        </div>
        <div class="pi-mini">
          <img src="${esc(profile.portrait)}" alt="${esc(lang === "zh" ? profile.piNameZh : profile.piNameEn)}" />
          <div>
            <span>${esc(copy.home.piLabel)}</span>
            <strong>${esc(lang === "zh" ? profile.piNameZh : profile.piNameEn)}</strong>
            <small>${esc(lang === "zh" ? profile.unitZh : profile.unitEn)}</small>
          </div>
        </div>
        <div class="hero-metrics">
          ${list(data.metrics, (metric) => `
            <div>
              <strong>${esc(metric.value)}</strong>
              <span>${esc(pick(metric, "label"))}</span>
            </div>
          `)}
        </div>
      </aside>
    `;
  }

  function renderHome() {
    const quickLinks = ["research", "publications", "people"];
    return `
      ${renderHero()}
      <section class="home-strip">
        ${list(copy.home.quick, (item, index) => `
          <a class="home-link-card" href="${withLang(`${quickLinks[index]}.html`)}">
            <span>${esc(item[0])}</span>
            <strong>${esc(item[1])}</strong>
          </a>
        `)}
      </section>
      <section class="section home-preview">
        ${sectionHeader(copy.home.profileKicker, copy.home.profileTitle, lang === "zh" ? data.profile.introZh : data.profile.introEn)}
        <div class="theme-grid compact">
          ${list(data.researchThemes, renderTheme)}
        </div>
      </section>
      <section class="section home-preview">
        ${sectionHeader(copy.home.selectedPubsKicker, copy.home.selectedPubsTitle, "")}
        <div class="publication-feature-grid">
          ${list(data.publications.slice(0, 3), renderPublication)}
        </div>
      </section>
      <section class="section home-preview">
        ${sectionHeader(copy.home.latestKicker, copy.home.latestTitle, "")}
        <div class="news-grid">
          ${list(data.news.slice(0, 3), renderNewsCard)}
        </div>
      </section>
    `;
  }

  function renderAbout() {
    const profile = data.profile;
    return `
      <section class="page-title">
        ${sectionHeader(copy.nav.about, copy.pages.about[0], copy.pages.about[1])}
      </section>
      <section class="section no-top-border">
        <div class="about-grid">
          <article class="quiet-card intro-card">
            <p>${esc(lang === "zh" ? profile.introZh : profile.introEn)}</p>
          </article>
          <div class="metric-grid">
            ${list(data.metrics, (metric) => `
              <article class="metric">
                <strong>${esc(metric.value)}</strong>
                <span>${esc(pick(metric, "label"))}</span>
              </article>
            `)}
          </div>
        </div>
      </section>
    `;
  }

  function renderResearch() {
    return `
      <section class="page-title">
        ${sectionHeader(copy.nav.research, copy.pages.research[0], copy.pages.research[1])}
      </section>
      <section class="section no-top-border">
        <div class="theme-grid">
          ${list(data.researchThemes, renderTheme)}
        </div>
      </section>
    `;
  }

  function renderTheme(theme, index) {
    return `
      <article class="theme-card">
        ${renderThemeGraphic(index)}
        <div class="theme-index">${String(index + 1).padStart(2, "0")}</div>
        <h2>${esc(pick(theme, "title"))}</h2>
        <p>${esc(pick(theme, "text"))}</p>
      </article>
    `;
  }

  function renderThemeGraphic(index) {
    const graphics = [
      '<path d="M12 58 C44 21 77 80 110 42 S154 20 188 58" /><path d="M28 87 C68 63 103 105 157 76" />',
      '<path d="M100 14 L54 90 H91 L76 146 L143 62 H105 Z" /><path d="M38 154 H162" />',
      '<circle cx="96" cy="86" r="54" /><path d="M42 104 C68 80 101 124 151 68" /><path d="M96 32 V16 M96 156 V140 M150 86 H172 M20 86 H42" />',
      '<rect x="38" y="28" width="124" height="96" rx="8" /><path d="M38 62 H162 M74 28 V124 M116 28 V124" /><path d="M52 150 C82 133 119 166 151 142" />'
    ];
    return `<svg class="theme-graphic" viewBox="0 0 200 170" aria-hidden="true">${graphics[index % graphics.length]}</svg>`;
  }

  function renderPeople() {
    const profile = data.profile;
    return `
      <section class="page-title">
        ${sectionHeader(copy.nav.people, copy.pages.people[0], copy.pages.people[1])}
      </section>
      <section class="section no-top-border">
        <div class="people-layout">
          <figure class="portrait-card">
            <img src="${esc(profile.portrait)}" alt="${esc(lang === "zh" ? profile.piNameZh : profile.piNameEn)}" />
            <figcaption>${esc(lang === "zh" ? profile.portraitSourceZh : profile.portraitSource)}</figcaption>
          </figure>
          <div class="pi-content">
            <span class="eyebrow">${esc(copy.people.role)}</span>
            <h2>${esc(lang === "zh" ? profile.piNameZh : profile.piNameEn)}</h2>
            <p>${esc(lang === "zh" ? profile.unitZh : profile.unitEn)}</p>
            <div class="timeline-columns">
              <div>
                <h3>${esc(copy.people.experience)}</h3>
                ${list(data.experience, renderTimelineItem)}
              </div>
              <div>
                <h3>${esc(copy.people.education)}</h3>
                ${list(data.education, renderTimelineItem)}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderTimelineItem(item) {
    return `
      <article class="timeline-item">
        <time>${esc(item.period)}</time>
        <strong>${esc(pick(item, "title"))}</strong>
        <span>${esc(pick(item, "organization"))}</span>
      </article>
    `;
  }

  function renderPublications() {
    return `
      <section class="page-title">
        ${sectionHeader(copy.nav.publications, copy.pages.publications[0], copy.pages.publications[1])}
      </section>
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
          <span class="pub-label">${esc(copy.publications.originalTitle)}</span>
          <h2>${esc(paper.title)}</h2>
          <p>${esc(paper.authors)}</p>
          <footer>
            <span>${esc(paper.journal)}</span>
            <a href="${esc(paper.url)}" target="_blank" rel="noopener">${esc(copy.publications.doi)} ${esc(paper.doi)}</a>
          </footer>
          <small>${esc(pick(paper, "highlight"))}</small>
        </div>
      </article>
    `;
  }

  function renderNews() {
    return `
      <section class="page-title">
        ${sectionHeader(copy.nav.news, copy.pages.news[0], copy.pages.news[1])}
      </section>
      <section class="section no-top-border">
        <div class="news-grid">
          ${list(data.news, renderNewsCard)}
        </div>
      </section>
    `;
  }

  function renderNewsCard(item) {
    return `
      <article class="news-card">
        <div>
          <time>${esc(item.date)}</time>
          <span>${esc(pick(item, "type"))}</span>
        </div>
        <h2>${esc(pick(item, "title"))}</h2>
        <p>${esc(pick(item, "text"))}</p>
      </article>
    `;
  }

  function renderContact() {
    const profile = data.profile;
    return `
      <section class="page-title">
        ${sectionHeader(copy.nav.contact, copy.pages.contact[0], copy.pages.contact[1])}
      </section>
      <section class="section no-top-border">
        <div class="contact-panel">
          <div>
            <h2>${esc(lang === "zh" ? profile.nameZh : profile.nameEn)}</h2>
            <p>${esc(lang === "zh" ? profile.unitZh : profile.unitEn)}</p>
          </div>
          <ul>
            <li><span>${esc(copy.contact.email)}</span><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>
            <li><span>${esc(copy.contact.phone)}</span><a href="tel:${esc(profile.phone.replaceAll(" ", ""))}">${esc(profile.phone)}</a></li>
            <li><span>${esc(copy.contact.website)}</span><a href="${esc(profile.website)}" target="_blank" rel="noopener">${esc(copy.contact.website)}</a></li>
          </ul>
        </div>
      </section>
    `;
  }

  const renderers = {
    home: renderHome,
    about: renderAbout,
    research: renderResearch,
    people: renderPeople,
    publications: renderPublications,
    news: renderNews,
    contact: renderContact
  };

  if (!data) {
    app.innerHTML = '<section class="loading">Site data is missing.</section>';
    return;
  }

  setupChrome();
  app.innerHTML = `${(renderers[page] || renderHome)()}`;
})();
