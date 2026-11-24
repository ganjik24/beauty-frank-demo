const appScriptUrl = new URL(document.currentScript.src);
const projectRootUrl = new URL("../", appScriptUrl);
const openedAsFile = location.protocol === "file:";

function siteHref(path) {
  if (!openedAsFile) return path;
  const [pathAndQuery, hash = ""] = path.split("#");
  const [pathname, query = ""] = pathAndQuery.split("?");
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  const localPath = clean ? `${clean}/index.html` : "index.html";
  const url = new URL(localPath, projectRootUrl);
  if (query) url.search = query;
  if (hash) url.hash = hash;
  return url.href;
}

function assetHref(path) {
  return openedAsFile ? new URL(path.replace(/^\//, ""), projectRootUrl).href : path;
}

const rootPath = decodeURIComponent(projectRootUrl.pathname);
const pagePath = decodeURIComponent(location.pathname);
const currentPath = openedAsFile
  ? `/${pagePath.slice(rootPath.length).replace(/index\.html$/, "")}`
  : location.pathname.replace(/index\.html$/, "");

const navItems = [
  ["/about/", "Об агентстве"],
  ["/services/", "Услуги"],
  ["/portfolio/", "Портфолио"],
  ["/projects/", "Проекты"],
  ["/team/", "Команда"],
  ["/education/", "Обучение"]
];

function isCurrent(path) {
  if (path === "/") return currentPath === "/";
  return currentPath.startsWith(path);
}

function renderShell() {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");
  if (header) {
    header.innerHTML = `
      <div class="scroll-progress" aria-hidden="true"></div>
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="${siteHref("/")}" aria-label="BEAUTY FRANK — главная">
            <img src="${assetHref("/public/media/branding/bf-monogram-transparent-v2.png")}" alt="" width="52" height="52">
            <span class="brand-copy"><span class="brand-name">BEAUTY FRANK</span><span class="brand-sub">Image • Beauty • Personal Brand</span></span>
          </a>
          <nav class="main-nav" id="main-navigation" aria-label="Основная навигация">
            ${navItems.map(([path, label]) => `<a href="${siteHref(path)}" ${isCurrent(path) ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
          <a class="header-action" href="${siteHref("/contacts/")}">Записаться</a>
          <button class="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded="false" aria-label="Открыть меню"><span></span></button>
        </div>
      </header>`;
  }
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-identity"><img class="footer-lockup" src="${assetHref("/public/media/branding/beauty-frank-lockup-transparent-v2.png")}" alt="BEAUTY FRANK — имиджевое агентство"><p class="footer-tagline">Имиджевое агентство полного цикла в Красноярске. Эстетика, которая говорит без слов.</p></div>
            <div class="footer-col"><h3>Разделы</h3><a href="${siteHref("/about/")}">Об агентстве</a><a href="${siteHref("/services/")}">Услуги</a><a href="${siteHref("/portfolio/")}">Портфолио</a><a href="${siteHref("/education/")}">Обучение</a></div>
            <div class="footer-col"><h3>Связь</h3><a href="${siteHref("/contacts/")}">Оставить заявку</a><a href="https://www.instagram.com/beauty_frank_/" target="_blank" rel="noopener noreferrer">Instagram*</a><a href="${siteHref("/privacy/")}">Политика конфиденциальности</a><a href="${siteHref("/consent/")}">Согласие на обработку данных</a></div>
          </div>
          <div class="footer-bottom"><span>© <span data-year></span> BEAUTY FRANK. Красноярск.</span><span>* Instagram принадлежит Meta, деятельность которой запрещена в РФ.</span></div>
        </div>
      </footer>
      <button class="back-to-top" type="button" aria-label="Вернуться наверх">↑</button>`;
  }
}

renderShell();

function applyTypography() {
  const protectedPhrases = [
    ["Miss & Mrs. Beauty", "Miss\u00A0&\u00A0Mrs.\u00A0Beauty"],
    ["Fashion & beauty", "Fashion\u00A0&\u00A0beauty"],
    ["Passion Fashion", "Passion\u00A0Fashion"],
    ["Fashion Volga", "Fashion\u00A0Volga"],
    ["Bosco Fashion", "Bosco\u00A0Fashion"],
    ["Personal Brand", "Personal\u00A0Brand"],
    ["BEAUTY FRANK", "BEAUTY\u00A0FRANK"],
    ["VK Fest", "VK\u00A0Fest"]
  ];
  const shortWordPattern = /(^|[\s(«„“"—])((?:для|при|без|над|под|во|ко|об|от|по|со|из|за|на|не|но|до|мы|вы|а|в|и|к|о|с|у))\s+(?=[A-Za-zА-Яа-яЁё])/giu;
  const excluded = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION"]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    if (!node.parentElement || excluded.has(node.parentElement.tagName)) return;
    let value = node.nodeValue;
    protectedPhrases.forEach(([plain, protectedText]) => {
      value = value.split(plain).join(protectedText);
    });
    value = value.replace(shortWordPattern, "$1$2\u00A0");
    node.nodeValue = value;
  });
}

applyTypography();

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const progress = document.querySelector(".scroll-progress");
const topButton = document.querySelector(".back-to-top");

function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle("is-scrolled", y > 30);
  topButton?.classList.toggle("is-visible", y > 600);
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}

addEventListener("scroll", onScroll, { passive: true });
onScroll();

menuButton?.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
});

document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => document.body.classList.remove("menu-open")));
topButton?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: .13 })
  : null;
document.querySelectorAll(".reveal").forEach(el => revealObserver ? revealObserver.observe(el) : el.classList.add("is-visible"));

document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  const filter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(b => b.classList.toggle("is-active", b === button));
  document.querySelectorAll("[data-category]").forEach(item => { item.hidden = filter !== "all" && item.dataset.category !== filter; });
}));

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.setAttribute("role", "dialog");
lightbox.setAttribute("aria-modal", "true");
lightbox.setAttribute("aria-label", "Просмотр фотографии");
lightbox.innerHTML = '<button type="button" aria-label="Закрыть">×</button><img alt=""><div class="lightbox-caption"></div>';
document.body.append(lightbox);
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
let lastFocused;

function closeLightbox() {
  lightbox.classList.remove("is-open");
  document.body.style.overflow = "";
  lastFocused?.focus();
}

document.querySelectorAll("[data-lightbox]").forEach(item => {
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  const open = () => {
    const image = item.querySelector("img");
    if (!image) return;
    lastFocused = item;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = item.dataset.caption || image.alt;
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lightbox.querySelector("button").focus();
  };
  item.addEventListener("click", open);
  item.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
});
lightbox.querySelector("button").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.querySelectorAll("form[data-demo-form]").forEach(form => form.addEventListener("submit", event => {
  event.preventDefault();
  const status = form.querySelector(".form-status");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  status.textContent = "Спасибо! Форма подготовлена, но перед публикацией нужно подключить обработчик заявок и контактные реквизиты.";
  form.reset();
}));

