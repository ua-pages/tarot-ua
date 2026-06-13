function onovytyMeta(selector, stvoryty, valueSetter) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = stvoryty();
    document.head.appendChild(element);
  }
  valueSetter(element);
}

function absoliutnyiUrl(pathOrUrl) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function setSeoMeta(input) {
  const title = input.title.trim();
  const description = input.description.trim();
  const canonicalUrl = absoliutnyiUrl(input.canonicalPath || window.location.pathname);
  const image = absoliutnyiUrl(input.image || '/seo/og-default.svg');

  document.title = title;

  onovytyMeta('meta[name="description"]', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    return meta;
  }, (meta) => meta.setAttribute('content', description));

  onovytyMeta('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    return link;
  }, (link) => link.setAttribute('href', canonicalUrl));

  const og = {
    'og:title': title,
    'og:description': description,
    'og:type': input.type || 'website',
    'og:url': canonicalUrl,
    'og:image': image,
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image
  };

  Object.entries(og).forEach(([property, content]) => {
    const selector = property.startsWith('twitter:') ? `meta[name="${property}"]` : `meta[property="${property}"]`;
    onovytyMeta(selector, () => {
      const meta = document.createElement('meta');
      if (property.startsWith('twitter:')) meta.setAttribute('name', property);
      else meta.setAttribute('property', property);
      return meta;
    }, (meta) => meta.setAttribute('content', content));
  });
}

export function setJsonLd(id, data) {
  const scriptId = `jsonld-${id}`;
  let script = document.getElementById(scriptId);
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function buildFaqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };
}
