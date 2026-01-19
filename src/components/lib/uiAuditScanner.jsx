// UI Audit Scanner - percorre a árvore do DOM e verifica handlers
export function scanInteractiveIssues(root = document) {
  const issues = [];
  try {
    const clickable = root.querySelectorAll('button, [role="button"], a, [data-action], [data-interactive]');
    clickable.forEach((el) => {
      const hasHandler = !!(el.onclick || el.getAttribute('onClick') || el.__reactProps$ || el.__handlers || el.dataset?.action);
      if (!hasHandler) {
        issues.push({ type: 'missing_handler', selector: cssPath(el), text: el.textContent?.trim()?.slice(0, 60) });
      }
    });

    const inputs = root.querySelectorAll('input, textarea, [role="switch"], [role="checkbox"], select');
    inputs.forEach((el) => {
      const hasChange = !!(el.onchange || el.getAttribute('onChange') || el.__reactProps$);
      if (!hasChange) {
        issues.push({ type: 'missing_onchange', selector: cssPath(el), name: el.getAttribute('name') });
      }
    });
  } catch (e) {
    issues.push({ type: 'scanner_error', error: String(e?.message || e) });
  }
  return issues;
}

function cssPath(el) {
  try {
    if (!(el instanceof Element)) return '';
    const path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += `#${el.id}`;
        path.unshift(selector);
        break;
      } else {
        let sib = el, nth = 1;
        while ((sib = sib.previousElementSibling)) {
          if (sib.nodeName.toLowerCase() === selector) nth++;
        }
        selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      el = el.parentElement;
    }
    return path.join(' > ');
  } catch {
    return '';
  }
}