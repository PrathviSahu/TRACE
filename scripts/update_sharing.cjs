const fs = require("fs");

// 1. Update StudioHeader.jsx
let sh = fs.readFileSync("./src/components/StudioHeader.jsx", "utf8");
const oldShare = `  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link copied to clipboard');
  }`;

const newShare = `  function handleShare() {
    try {
      const state = useTraceStore.getState();
      const payload = {
        code: state.code,
        inputs: state.inputs,
        inputText: state.inputText,
        language: state.language,
        activeTab: state.activeTab,
        activeExampleId: state.activeExampleId
      };
      const json = JSON.stringify(payload);
      const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode("0x" + p1)));
      const url = window.location.origin + window.location.pathname + "#share=" + b64;
      navigator.clipboard?.writeText?.(url);
      window.history.replaceState(null, "", "#share=" + b64);
      showToast("Shareable link with code & inputs copied!");
    } catch (_) {
      navigator.clipboard?.writeText?.(window.location.href);
      showToast("Link copied to clipboard");
    }
  }`;

if (sh.includes(oldShare)) {
  sh = sh.replace(oldShare, newShare);
  fs.writeFileSync("./src/components/StudioHeader.jsx", sh, "utf8");
  console.log("Updated StudioHeader.jsx with state URL encoding!");
} else {
  console.log("StudioHeader already updated or oldShare not found");
}

// 2. Update traceStore.js to unpack #share= hash
let ts = fs.readFileSync("./src/store/traceStore.js", "utf8");
if (!ts.includes("loadSharedState()")) {
  const helper = `
function loadSharedState() {
  if (typeof window === "undefined") return null;
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#share=")) {
      const b64 = hash.slice(7);
      const json = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
      return JSON.parse(json);
    }
  } catch (_) {}
  return null;
}
const _shared = loadSharedState();
`;
  ts = helper + ts;
  ts = ts.replace("code: MULTI_LANG_EXAMPLES[initialLang]['two-sum'].code,", "code: _shared?.code || MULTI_LANG_EXAMPLES[initialLang]['two-sum'].code,");
  ts = ts.replace("inputs: MULTI_LANG_EXAMPLES[initialLang]['two-sum'].inputs,", "inputs: _shared?.inputs || MULTI_LANG_EXAMPLES[initialLang]['two-sum'].inputs,");
  ts = ts.replace("inputText: formatInputs(MULTI_LANG_EXAMPLES[initialLang]['two-sum'].inputs),", "inputText: _shared?.inputText || formatInputs(MULTI_LANG_EXAMPLES[initialLang]['two-sum'].inputs),");
  fs.writeFileSync("./src/store/traceStore.js", ts, "utf8");
  console.log("Updated traceStore.js with shared state hydration!");
}
