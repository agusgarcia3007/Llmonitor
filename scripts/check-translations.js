const fs = require("fs");
const path = require("path");

const en = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../apps/client/src/locale/en.json"),
    "utf8"
  )
);
const es = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../apps/client/src/locale/es.json"),
    "utf8"
  )
);

function getAllKeys(obj, prefix = "") {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === "object" && obj[k] !== null) {
      keys = keys.concat(getAllKeys(obj[k], prefix ? `${prefix}.${k}` : k));
    } else {
      keys.push(prefix ? `${prefix}.${k}` : k);
    }
  }
  return keys;
}

const enKeys = getAllKeys(en);
const esKeys = getAllKeys(es);

const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
const missingInEn = esKeys.filter((k) => !enKeys.includes(k));

if (missingInEs.length || missingInEn.length) {
  if (missingInEs.length) {
    console.error("Faltan claves en es.json:", missingInEs);
  }
  if (missingInEn.length) {
    console.error("Faltan claves en en.json:", missingInEn);
  }
  process.exit(1);
}

// --- NUEVO: buscar keys usadas en el código ---
const SRC_DIR = path.join(__dirname, "../apps/client/src");
function findAllFiles(dir, exts, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAllFiles(full, exts, found);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      found.push(full);
    }
  }
  return found;
}
const files = findAllFiles(SRC_DIR, [".ts", ".tsx"]);

const keyRegex = /\bt\(["'`]([^"'`]+)["'`]/g;
const usedKeys = new Set();

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = keyRegex.exec(content))) {
    usedKeys.add(match[1]);
  }
}

const missingInJson = [];
for (const key of usedKeys) {
  if (!enKeys.includes(key) || !esKeys.includes(key)) {
    missingInJson.push(key);
  }
}

if (missingInJson.length) {
  console.error("Keys used but not in JSON:", missingInJson);
  process.exit(1);
}

console.log(
  "✔️  All translations are synchronized and all used keys exist in the JSON."
);
