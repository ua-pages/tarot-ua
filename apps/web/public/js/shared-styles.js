let sharedSheet = null;
let sheetPromise = null;

function otymatySpilnyiArkush() {
  if (sharedSheet) return sharedSheet;
  if (!sheetPromise) {
    sheetPromise = fetch('/css/styles.css')
      .then((r) => r.text())
      .then((css) => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        sharedSheet = sheet;
        return sheet;
      })
      .catch(() => null);
  }
  return sheetPromise;
}

export async function pereinjatyStyl(element) {
  const sheet = await otymatySpilnyiArkush();
  if (sheet) {
    element.shadowRoot.adoptedStyleSheets = [sheet];
  }
}
