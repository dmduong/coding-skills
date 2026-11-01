#!/usr/bin/env node
/**
 * scan-project.js: quét một dự án NestJS và xuất báo cáo theo đúng khóa của profile-template.md.
 *
 * Cách dùng:
 *   node scan-project.js [thư-mục-bắt-đầu] [--out <file>] [--stdout]
 *
 * - Tự đi lên tìm thư mục chứa package.json gần nhất làm gốc dự án.
 * - Mặc định ghi báo cáo vào <gốc>/.project-profile/scan-report.json.
 * - Chỉ dùng module có sẵn của Node.js, không cần cài thêm gì.
 * - Script CHỈ báo những gì tìm thấy (status luôn là "detected").
 *   Việc chốt thành "confirmed" là của người dùng.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SCHEMA_VERSION = 1;
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.idea',
  '.vscode',
  '.project-profile',
]);
const VI_CHARS =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

// ───────────────────────── CLI ─────────────────────────
const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--stdout') flags.stdout = true;
  else if (a === '--out') flags.out = argv[++i];
  else if (a === '--help' || a === '-h') flags.help = true;
  else positional.push(a);
}
if (flags.help) {
  console.log(
    'Cách dùng: node scan-project.js [thư-mục] [--out <file>] [--stdout]',
  );
  process.exit(0);
}

// ───────────────────────── Tiện ích ─────────────────────────
function findRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const root = findRoot(positional[0] || process.cwd());
if (!root) {
  console.error(
    JSON.stringify({
      error: 'Không tìm thấy package.json từ thư mục đã cho đi lên.',
    }),
  );
  process.exit(2);
}

const rel = (p) => path.relative(root, p).split(path.sep).join('/');

function walk(dir, acc = { files: [], dirs: [] }) {
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      acc.dirs.push(full);
      walk(full, acc);
    } else {
      acc.files.push(full);
    }
  }
  return acc;
}

const cache = new Map();
function read(p) {
  if (!cache.has(p)) {
    let t = '';
    try {
      t = fs.readFileSync(p, 'utf8');
    } catch {
      /* bỏ qua */
    }
    cache.set(p, t);
  }
  return cache.get(p);
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}
function tally(arr) {
  const m = {};
  for (const x of arr) m[x] = (m[x] || 0) + 1;
  return m;
}
function sorted(m) {
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

/** Quyết định giá trị chiếm đa số từ bảng đếm. */
function decide(counts) {
  const e = sorted(counts);
  const total = e.reduce((s, [, n]) => s + n, 0);
  if (!total) return null;
  const [label, n] = e[0];
  const ratio = n / total;
  const confidence =
    total >= 5 && ratio >= 0.8
      ? 'high'
      : total >= 2 && ratio >= 0.6
        ? 'medium'
        : 'low';
  return {
    label,
    ratio: +ratio.toFixed(2),
    total,
    confidence,
    candidates: e.length > 1 ? e.map(([l, c]) => `${l} (${c})`) : undefined,
  };
}

function caseOf(name) {
  if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(name)) return 'kebab-case';
  if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(name)) return 'snake_case';
  if (/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(name)) return 'UPPER_SNAKE_CASE';
  if (/^[a-z][a-z0-9]*([A-Z][a-z0-9]*)+$/.test(name)) return 'camelCase';
  if (/^([A-Z][a-z0-9]+){2,}$/.test(name)) return 'PascalCase';
  return null; // một từ đơn: không phân biệt được
}
function isPluralish(word) {
  return /[^s]s$/.test(word) && !/(ss|us|is)$/.test(word);
}
function pascal(s) {
  return s
    .split(/[-_]/)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}
function pkgName(spec) {
  if (
    spec.startsWith('.') ||
    spec.startsWith('/') ||
    spec.startsWith('src/') ||
    spec.startsWith('@/')
  )
    return null;
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

// ───────────────────────── Kho kết quả ─────────────────────────
const items = {};
function add(key, value, confidence, evidence, extra) {
  items[key] = {
    value,
    status: 'detected',
    confidence,
    evidence: (evidence || []).slice(0, 3),
    ...(extra || {}),
  };
}

// ───────────────────────── Thu thập dữ liệu thô ─────────────────────────
const pkg = (() => {
  try {
    return JSON.parse(read(path.join(root, 'package.json')));
  } catch {
    return {};
  }
})();
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

const srcDir = fs.existsSync(path.join(root, 'src'))
  ? path.join(root, 'src')
  : root;
const all = walk(srcDir);
const tsFiles = all.files.filter(
  (f) => f.endsWith('.ts') && !f.endsWith('.d.ts'),
);
const specFiles = tsFiles.filter(
  (f) => f.endsWith('.spec.ts') || f.endsWith('.e2e-spec.ts'),
);
const codeFiles = tsFiles.filter((f) => !specFiles.includes(f));

// Phân loại theo hậu tố: chat-room.service.ts → suffix "service"
const bySuffix = {};
for (const f of codeFiles) {
  const m = path.basename(f).match(/^(.+?)\.([a-z-]+)\.ts$/);
  if (!m) continue;
  (bySuffix[m[2]] = bySuffix[m[2]] || []).push({ file: f, name: m[1] });
}
const filesOf = (...sfx) =>
  sfx.flatMap((s) => (bySuffix[s] || []).map((x) => x.file));

// Đếm import thực tế theo gói
const importedPkgs = {};
const importsByFile = new Map();
for (const f of codeFiles) {
  const t = read(f);
  const set = new Set();
  for (const m of t.matchAll(/(?:from|require\()\s*['"]([^'"]+)['"]/g)) {
    const p = pkgName(m[1]);
    if (p) set.add(p);
  }
  importsByFile.set(f, set);
  for (const p of set) importedPkgs[p] = (importedPkgs[p] || 0) + 1;
}

/** Tìm chuỗi/regex trong các file, trả về [{file, line, match}]. */
function grep(files, re) {
  const out = [];
  const r = new RegExp(
    re.source,
    re.flags.includes('g') ? re.flags : re.flags + 'g',
  );
  for (const f of files) {
    const t = read(f);
    for (const m of t.matchAll(r))
      out.push({ file: f, line: lineOf(t, m.index), m });
  }
  return out;
}
const ev = (hits) => hits.slice(0, 3).map((h) => `${rel(h.file)}:${h.line}`);

const mainFile = codeFiles.find((f) => path.basename(f) === 'main.ts');
const moduleFiles = filesOf('module');
const featureModules = moduleFiles.filter(
  (f) => path.basename(f) !== 'app.module.ts',
);
const hasFeatureCode = featureModules.length > 0;

// ───────────────────────── 1.1 Phong cách lập trình ─────────────────────────
(function style() {
  // tsconfig
  const tsconfigPath = path.join(root, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const raw = read(tsconfigPath);
    let strict = null;
    let noImplicitAny = null;
    try {
      const cleaned = raw
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:"'])\/\/.*$/gm, '$1');
      const co = JSON.parse(cleaned).compilerOptions || {};
      strict = co.strict;
      noImplicitAny = co.noImplicitAny;
    } catch {
      const s = raw.match(/"strict"\s*:\s*(true|false)/);
      if (s) strict = s[1] === 'true';
      const n = raw.match(/"noImplicitAny"\s*:\s*(true|false)/);
      if (n) noImplicitAny = n[1] === 'true';
    }
    add(
      '1.1.1',
      `TypeScript, strict: ${strict === null ? 'không khai báo' : strict}, noImplicitAny: ${noImplicitAny === null ? 'không khai báo' : noImplicitAny}`,
      'high',
      ['tsconfig.json'],
    );
  } else if (deps.typescript) {
    add('1.1.1', 'TypeScript (không có tsconfig.json ở gốc)', 'medium', [
      'package.json',
    ]);
  }

  // Prettier
  const prettierFiles = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    'prettier.config.js',
  ].filter((n) => fs.existsSync(path.join(root, n)));
  let prettierCfg = null;
  if (pkg.prettier) prettierCfg = pkg.prettier;
  for (const n of prettierFiles) {
    try {
      prettierCfg = JSON.parse(read(path.join(root, n)));
      break;
    } catch {
      /* không phải JSON */
    }
  }
  if (prettierFiles.length || pkg.prettier) {
    const cfg = prettierCfg || {};
    add(
      '1.1.2',
      `Prettier${prettierFiles[0] ? ', cấu hình tại ' + prettierFiles[0] : ' (khai báo trong package.json)'}` +
        (prettierCfg
          ? `: singleQuote=${cfg.singleQuote ?? 'mặc định'}, semi=${cfg.semi ?? 'mặc định'}, trailingComma=${cfg.trailingComma ?? 'mặc định'}`
          : ''),
      'high',
      prettierFiles.length ? [prettierFiles[0]] : ['package.json'],
    );
  } else if (deps.prettier) {
    add(
      '1.1.2',
      'Prettier (có trong package.json, không thấy file cấu hình)',
      'medium',
      ['package.json'],
    );
  }

  // ESLint
  const eslintFiles = fs
    .readdirSync(root)
    .filter((n) =>
      /^(\.eslintrc(\..+)?|eslint\.config\.(m|c)?js|eslint\.config\.ts)$/.test(
        n,
      ),
    );
  if (eslintFiles.length)
    add('1.1.3', `ESLint, cấu hình tại ${eslintFiles[0]}`, 'high', [
      eslintFiles[0],
    ]);
  else if (deps.eslint)
    add(
      '1.1.3',
      'ESLint (có trong package.json, không thấy file cấu hình)',
      'medium',
      ['package.json'],
    );

  // Dấu nháy / chấm phẩy: ưu tiên Prettier, không có thì đo từ code
  if (
    prettierCfg &&
    (prettierCfg.singleQuote !== undefined || prettierCfg.semi !== undefined)
  ) {
    add(
      '1.1.4',
      `${prettierCfg.singleQuote ? 'Nháy đơn' : 'Nháy kép'}, ${prettierCfg.semi === false ? 'không' : 'có'} dấu chấm phẩy`,
      'high',
      prettierFiles.slice(0, 1),
    );
  } else {
    let single = 0;
    let dbl = 0;
    for (const f of codeFiles) {
      const t = read(f);
      single += (t.match(/from\s+'/g) || []).length;
      dbl += (t.match(/from\s+"/g) || []).length;
    }
    if (single + dbl) {
      add(
        '1.1.4',
        `${single >= dbl ? 'Nháy đơn' : 'Nháy kép'} (đo từ import: đơn ${single}, kép ${dbl})`,
        single + dbl >= 10 ? 'medium' : 'low',
        [],
      );
    }
  }

  // async/await
  const awaits = grep(codeFiles, /\bawait\b/).length;
  const thens = grep(codeFiles, /\.then\(/).length;
  if (awaits + thens) {
    add(
      '1.1.5',
      `${awaits >= thens ? 'async/await' : '.then()'} (await ${awaits}, .then ${thens})`,
      awaits + thens >= 10 && Math.max(awaits, thens) / (awaits + thens) >= 0.9
        ? 'high'
        : 'medium',
      [],
    );
  }

  // any
  const anyHits = grep(codeFiles, /:\s*any\b|<any>|\bas any\b/);
  const eslintNoAny = eslintFiles.some((n) =>
    /no-explicit-any/.test(read(path.join(root, n))),
  );
  add(
    '1.1.6',
    `${anyHits.length} chỗ dùng any; ESLint rule no-explicit-any: ${eslintNoAny ? 'có nhắc tới' : 'không thấy'}`,
    'medium',
    ev(anyHits),
  );

  // import
  const rel2 = grep(codeFiles, /from\s+['"]\.\.\/\.\.\//).length;
  const alias = grep(codeFiles, /from\s+['"](?:src|@)\//).length;
  if (rel2 + alias) {
    add(
      '1.1.7',
      alias > rel2
        ? `Dùng alias (src/ hoặc @/): ${alias} chỗ; import tương đối sâu: ${rel2} chỗ`
        : `Import tương đối: ${rel2} chỗ; alias: ${alias} chỗ`,
      'medium',
      [],
    );
  }

  // Ngôn ngữ chú thích
  const comments = [];
  for (const f of codeFiles) {
    const t = read(f);
    for (const m of t.matchAll(/\/\/\s*(.+)$|\/\*\*?([\s\S]*?)\*\//gm))
      comments.push(m[1] || m[2] || '');
  }
  if (comments.length >= 3) {
    const vi = comments.filter((c) => VI_CHARS.test(c)).length;
    const ratio = vi / comments.length;
    const lang =
      ratio >= 0.5
        ? 'tiếng Việt'
        : ratio === 0
          ? 'tiếng Anh'
          : 'lẫn tiếng Việt và tiếng Anh';
    add(
      '1.1.8',
      `Chú thích chủ yếu bằng ${lang} (${vi}/${comments.length} chú thích có dấu tiếng Việt)`,
      comments.length >= 10 && (ratio >= 0.8 || ratio === 0) ? 'medium' : 'low',
      [],
    );
    items['5.2.1'] = { ...items['1.1.8'] };
  }
})();

// ───────────────────────── 1.2 Đặt tên tập tin ─────────────────────────
(function fileNaming() {
  const spec = [
    ['1.2.1', ['module']],
    ['1.2.2', ['controller']],
    ['1.2.3', ['service']],
    ['1.2.4', ['repository']],
    ['1.2.5', ['dto']],
    ['1.2.6', ['ro']],
    ['1.2.7', ['entity']],
    ['1.2.8', ['guard', 'pipe', 'interceptor', 'filter']],
    ['1.2.9', ['decorator']],
    ['1.2.10', ['enum', 'interface']],
  ];
  for (const [key, sfxs] of spec) {
    const list = sfxs.flatMap((s) =>
      (bySuffix[s] || []).map((x) => ({ ...x, sfx: s })),
    );
    if (!list.length) continue;
    const nonApp = list.filter((x) => !(key === '1.2.1' && x.name === 'app'));
    const names = nonApp.map((x) => x.name);
    if (!names.length) continue;
    const cases = decide(
      tally(
        names.map((n) =>
          /^[a-z0-9]+$/.test(n) ? 'kebab-case' : caseOf(n) || 'khác',
        ),
      ),
    );
    const plural = names.filter((n) => isPluralish(n.split('-').pop())).length;
    const sfxFound = [...new Set(list.map((x) => x.sfx))].join(', ');
    add(
      key,
      {
        pattern:
          sfxs.length > 1
            ? sfxs.map((s) => `x-y.${s}.ts`).join(', ')
            : `x-y.${sfxs[0]}.ts`,
        hauTo: sfxFound,
        nameCase: cases ? cases.label : 'không rõ',
        pluralNames: `${plural}/${names.length}`,
        example: rel(nonApp[0].file),
      },
      cases ? cases.confidence : 'low',
      [rel(nonApp[0].file)],
    );
  }
  if (specFiles.length) {
    const ex = specFiles[0];
    add(
      '1.2.11',
      {
        pattern: 'x-y.<loại>.spec.ts',
        count: specFiles.length,
        example: rel(ex),
      },
      'high',
      [rel(ex)],
    );
  }
})();

// ───────────────────────── 1.3 Đặt tên lớp ─────────────────────────
(function classNaming() {
  const classOf = (file) =>
    [
      ...read(file).matchAll(
        /export\s+(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/g,
      ),
    ].map((m) => m[1]);
  const check = (key, sfxs, label) => {
    const hits = [];
    for (const s of sfxs)
      for (const x of bySuffix[s] || [])
        for (const c of classOf(x.file)) hits.push({ c, s, f: x.file });
    if (!hits.length) return;
    const ok = hits.filter((h) => h.c.endsWith(pascal(h.s))).length;
    const ratio = ok / hits.length;
    add(
      key,
      { mau: label, khop: `${ok}/${hits.length}`, example: hits[0].c },
      hits.length >= 3 && ratio >= 0.8
        ? 'high'
        : ratio >= 0.6
          ? 'medium'
          : 'low',
      [rel(hits[0].f)],
    );
  };
  check(
    '1.3.1',
    ['module', 'controller', 'service', 'repository'],
    'XxYy<HậuTố>',
  );
  check('1.3.2', ['dto'], 'XxYyDto');
  check('1.3.3', ['ro'], 'XxYyRo');
  check('1.3.4', ['guard', 'pipe', 'interceptor', 'filter'], 'XxYy<HậuTố>');

  const ents = (bySuffix.entity || []).flatMap((x) =>
    classOf(x.file).map((c) => ({ c, f: x.file })),
  );
  if (ents.length) {
    const withSuffix = ents.filter((e) => /Entity$/.test(e.c)).length;
    add(
      '1.3.5',
      {
        mau:
          withSuffix > ents.length / 2
            ? 'XxYyEntity (có hậu tố)'
            : 'XxYy (không hậu tố)',
        example: ents[0].c,
      },
      ents.length >= 3 ? 'high' : 'medium',
      [rel(ents[0].f)],
    );
  }

  const ifaces = grep(codeFiles, /export\s+interface\s+(\w+)/);
  if (ifaces.length) {
    const withI = ifaces.filter((h) => /^I[A-Z]/.test(h.m[1])).length;
    const ratio = withI / ifaces.length;
    add(
      '1.3.6',
      {
        tienTo: ratio >= 0.5 ? 'I (IXxYy)' : 'không có tiền tố I',
        khop: `${withI}/${ifaces.length} bắt đầu bằng I`,
      },
      ifaces.length >= 5 && (ratio >= 0.8 || ratio <= 0.2) ? 'high' : 'medium',
      ev(ifaces),
    );
  }

  const enums = grep(codeFiles, /export\s+enum\s+(\w+)/);
  if (enums.length) {
    const withE = enums.filter((h) => /Enum$/.test(h.m[1])).length;
    add(
      '1.3.7',
      {
        mau: withE >= enums.length / 2 ? 'XxYyEnum' : 'XxYy (không hậu tố)',
        khop: `${withE}/${enums.length} kết thúc bằng Enum`,
      },
      enums.length >= 3 ? 'medium' : 'low',
      ev(enums),
    );
  }
})();

// ───────────────────────── 1.4 Đặt tên hàm, biến, dữ liệu ─────────────────────────
(function dataNaming() {
  // Hằng số: chỉ tính khi khởi tạo bằng literal (chuỗi, số, mảng, object)
  const consts = grep(
    codeFiles,
    /export\s+const\s+(\w+)\s*(?::[^=]+)?=\s*(['"`\d\[{]|Symbol\()/,
  );
  const cc = decide(tally(consts.map((h) => caseOf(h.m[1])).filter(Boolean)));
  if (cc)
    add('1.4.2', cc.label, cc.confidence, ev(consts), {
      candidates: cc.candidates,
    });

  // Thành viên enum
  const members = [];
  for (const f of codeFiles) {
    for (const m of read(f).matchAll(/export\s+enum\s+\w+\s*\{([^}]*)\}/g)) {
      for (const mm of m[1].matchAll(/^\s*(\w+)\s*(?:=|,|$)/gm))
        members.push(mm[1]);
    }
  }
  const mc = decide(
    tally(
      members
        .map((n) =>
          /^[A-Z][A-Z0-9]*$/.test(n) ? 'UPPER_SNAKE_CASE' : caseOf(n),
        )
        .filter(Boolean),
    ),
  );
  if (mc)
    add('1.4.3', mc.label, mc.confidence, [], { candidates: mc.candidates });

  // Thuộc tính trong DTO/RO
  const dtoFiles = filesOf('dto', 'ro');
  const props = [];
  for (const f of dtoFiles) {
    for (const m of read(f).matchAll(
      /^\s{2,}(?:readonly\s+)?([a-zA-Z_]\w*)[?!]?\s*:/gm,
    ))
      props.push(m[1]);
  }
  const pc = decide(
    tally(
      props.map(caseOf).filter((c) => c === 'camelCase' || c === 'snake_case'),
    ),
  );
  if (pc)
    add('1.4.5', pc.label, pc.confidence, [rel(dtoFiles[0])], {
      candidates: pc.candidates,
      tong: pc.total,
    });

  // Boolean
  const bools = grep(codeFiles, /(\w+)[?!]?\s*:\s*boolean/);
  if (bools.length) {
    const pref = bools.filter((h) =>
      /^(is|has|can|should)[A-Z]/.test(h.m[1]),
    ).length;
    add(
      '1.4.4',
      `${pref}/${bools.length} biến boolean có tiền tố is/has/can/should`,
      bools.length >= 4 ? 'medium' : 'low',
      ev(bools),
    );
  }

  // Tên bảng / cột
  const entityFiles = filesOf('entity');
  const tables = grep(
    entityFiles,
    /@Entity\(\s*(?:['"]([^'"]+)['"]|\{[^}]*?name:\s*['"]([^'"]+)['"])/,
  );
  if (tables.length) {
    const names = tables.map((h) => h.m[1] || h.m[2]);
    const tc = decide(
      tally(
        names
          .map(
            (n) => caseOf(n) || (/^[a-z0-9]+$/.test(n) ? 'snake_case' : null),
          )
          .filter(Boolean),
      ),
    );
    const plural = names.filter((n) => isPluralish(n.split('_').pop())).length;
    add(
      '1.4.6',
      `${tc ? tc.label : 'không rõ'}, ${plural >= names.length / 2 ? 'số nhiều' : 'số ít'} (${plural}/${names.length} số nhiều)`,
      tc ? tc.confidence : 'low',
      ev(tables),
    );
  } else if (entityFiles.length) {
    add(
      '1.4.6',
      'Entity không khai báo tên bảng (TypeORM tự suy ra từ tên class)',
      'medium',
      [rel(entityFiles[0])],
    );
  }
  const cols = grep(
    entityFiles,
    /@\w*Column\(\s*(?:['"][^'"]*['"]\s*,\s*)?\{[^}]*?name:\s*['"](\w+)['"]/,
  );
  if (cols.length) {
    const cc2 = decide(tally(cols.map((h) => caseOf(h.m[1]) || 'khác')));
    add('1.4.7', cc2.label, cc2.confidence, ev(cols), {
      candidates: cc2.candidates,
    });
    add(
      '1.4.8',
      `@Column({ name: '${cols[0].m[1]}' }) với thuộc tính ${pc ? pc.label : 'không rõ'}`,
      'medium',
      ev(cols),
    );
  } else {
    const ns = grep(codeFiles, /namingStrategy|SnakeNamingStrategy/);
    if (ns.length)
      add(
        '1.4.8',
        'Dùng NamingStrategy (tự ánh xạ cột ↔ thuộc tính)',
        'high',
        ev(ns),
      );
  }
})();

// ───────────────────────── 1.5 Đặt tên API ─────────────────────────
(function apiNaming() {
  const prefix = grep(codeFiles, /setGlobalPrefix\(\s*['"]([^'"]+)['"]/);
  const versioning = grep(codeFiles, /enableVersioning\(\s*\{([^}]*)\}/);
  if (prefix.length || versioning.length) {
    add(
      '1.5.1',
      {
        globalPrefix: prefix[0] ? prefix[0].m[1] : null,
        versioning: versioning[0]
          ? versioning[0].m[1].replace(/\s+/g, ' ').trim()
          : null,
      },
      'high',
      ev([...prefix, ...versioning]),
    );
  }

  const ctrls = filesOf('controller');
  const routes = grep(
    ctrls,
    /@Controller\(\s*(?:['"]([^'"]*)['"]|\{[^}]*?path:\s*['"]([^'"]*)['"])/,
  ).map((h) => ({ ...h, path: h.m[1] ?? h.m[2] ?? '' }));
  if (routes.length) {
    const segs = routes
      .map((r) => r.path.split('/').filter(Boolean).pop())
      .filter(Boolean);
    const kc = decide(
      tally(
        segs.map((s) =>
          /^[a-z0-9]+$/.test(s) ? 'kebab-case' : caseOf(s) || 'khác',
        ),
      ),
    );
    const plural = segs.filter((s) => isPluralish(s.split('-').pop())).length;
    add(
      '1.5.2',
      `${kc ? kc.label : 'không rõ'}, ${plural >= segs.length / 2 ? 'danh từ số nhiều' : 'danh từ số ít'} (${plural}/${segs.length} số nhiều)`,
      kc && segs.length >= 3 ? kc.confidence : 'low',
      ev(routes),
    );

    // 1.5.6: segment đầu của path so với tên thư mục module
    const rows = routes.map((r) => {
      const seg = r.path.split('/').filter(Boolean)[0] || '';
      const dir = path.basename(path.dirname(r.file));
      return seg === dir
        ? 'path = tên module'
        : seg === dir + 's'
          ? 'path = tên module + s'
          : 'khác';
    });
    const d = decide(tally(rows));
    if (d)
      add(
        '1.5.6',
        `Segment đầu của path: ${d.label}`,
        d.confidence,
        ev(routes),
        { candidates: d.candidates },
      );
  }

  const verbs = [];
  for (const f of ctrls) {
    const t = read(f);
    for (const m of t.matchAll(/@(Get|Post|Put|Patch|Delete)\(([^)]*)\)/g)) {
      const after = t
        .slice(m.index + m[0].length, m.index + m[0].length + 600)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/@\w+\((?:[^()]|\([^()]*\))*\)/g, '')
        .replace(/@\w+/g, '');
      const nm = after.match(/(?:async\s+)?([A-Za-z_]\w*)\s*\(/);
      if (nm)
        verbs.push({
          file: f,
          line: lineOf(t, m.index),
          m: [m[0], m[1], m[2], '', nm[1]],
        });
    }
  }
  if (verbs.length) {
    const byMethod = {};
    const params = [];
    for (const h of verbs) {
      const [, method, arg, , name] = h.m;
      (byMethod[method] = byMethod[method] || []).push(name);
      for (const p of arg.matchAll(/:(\w+)/g)) params.push(p[1]);
    }
    const summary = {};
    for (const [method, names] of Object.entries(byMethod))
      summary[method] = sorted(tally(names))
        .slice(0, 4)
        .map(([n, c]) => `${n} (${c})`);
    add('1.5.4', summary, verbs.length >= 5 ? 'medium' : 'low', ev(verbs));
    const pcase = decide(
      tally(
        params
          .map((p) => caseOf(p) || (/^[a-z]+$/.test(p) ? 'camelCase' : null))
          .filter(Boolean),
      ),
    );
    if (pcase)
      add('1.5.3', pcase.label, pcase.confidence, ev(verbs), {
        candidates: pcase.candidates,
      });
  }
})();

// ───────────────────────── 2. Công nghệ và thư viện ─────────────────────────
(function techStack() {
  // Node
  let node = null;
  if (pkg.engines && pkg.engines.node)
    node = {
      value: `Node.js ${pkg.engines.node}`,
      src: 'package.json (engines)',
    };
  for (const n of ['.nvmrc', '.node-version']) {
    if (!node && fs.existsSync(path.join(root, n)))
      node = { value: `Node.js ${read(path.join(root, n)).trim()}`, src: n };
  }
  if (!node && fs.existsSync(path.join(root, 'Dockerfile'))) {
    const m = read(path.join(root, 'Dockerfile')).match(
      /FROM\s+node:([\w.\-]+)/i,
    );
    if (m) node = { value: `Node.js ${m[1]}`, src: 'Dockerfile' };
  }
  if (node) add('2.1.1', node.value, 'medium', [node.src]);

  if (deps['@nestjs/core'])
    add('2.1.2', `NestJS ${deps['@nestjs/core']}`, 'high', ['package.json']);

  // Cơ sở dữ liệu
  const dbMap = [
    ['mysql2', 'MySQL'],
    ['mysql', 'MySQL'],
    ['pg', 'PostgreSQL'],
    ['mongoose', 'MongoDB'],
    ['sqlite3', 'SQLite'],
    ['better-sqlite3', 'SQLite'],
    ['mssql', 'SQL Server'],
  ];
  const dbs = dbMap.filter(([d]) => deps[d]).map(([, n]) => n);
  if (dbs.length) {
    let version = null;
    for (const n of fs.readdirSync(root)) {
      if (
        /^(docker-)?compose.*\.ya?ml$/.test(n) ||
        /^docker-compose.*\.ya?ml$/.test(n)
      ) {
        const m = read(path.join(root, n)).match(
          /image:\s*(?:mysql|mariadb|postgres|mongo):([\w.\-]+)/i,
        );
        if (m) version = m[1];
      }
    }
    add(
      '2.1.3',
      `${[...new Set(dbs)].join(', ')}${version ? ' ' + version : ' (không rõ phiên bản)'}`,
      'high',
      ['package.json'],
    );
  }

  // ORM
  const orm = [
    ['typeorm', 'TypeORM'],
    ['@nestjs/typeorm', 'TypeORM'],
    ['@prisma/client', 'Prisma'],
    ['sequelize', 'Sequelize'],
    ['@nestjs/mongoose', 'Mongoose'],
    ['mikro-orm', 'MikroORM'],
    ['@mikro-orm/core', 'MikroORM'],
  ];
  const ormFound = [...new Set(orm.filter(([d]) => deps[d]).map(([, n]) => n))];
  const driver = ['mysql2', 'mysql', 'pg'].filter((d) => deps[d]);
  if (ormFound.length)
    add(
      '2.1.4',
      `${ormFound.join(', ')}${driver.length ? ', driver ' + driver.join(', ') : ''}`,
      'high',
      ['package.json'],
    );

  if (deps['@nestjs/config'])
    add('2.1.5', '@nestjs/config', 'high', ['package.json']);

  const sw = grep(mainFile ? [mainFile] : codeFiles, /SwaggerModule\.setup/);
  add(
    '2.1.6',
    deps['@nestjs/swagger']
      ? `@nestjs/swagger${sw.length ? ', đã gọi SwaggerModule.setup' : ' (chưa thấy gọi SwaggerModule.setup)'}`
      : 'N/A (không có @nestjs/swagger)',
    'high',
    sw.length ? ev(sw) : ['package.json'],
  );

  const authLibs = [
    '@nestjs/jwt',
    '@nestjs/passport',
    'passport-jwt',
    'passport-local',
    'passport',
  ].filter((d) => deps[d]);
  if (authLibs.length)
    add('2.1.7', authLibs.join(', '), 'high', ['package.json']);

  const logs = ['nestjs-pino', 'pino', 'winston', 'nest-winston'].filter(
    (d) => deps[d],
  );
  add(
    '2.1.8',
    logs.length
      ? logs.join(', ')
      : 'Logger của NestJS (không thấy thư viện log riêng)',
    logs.length ? 'high' : 'medium',
    ['package.json'],
  );

  const dates = ['dayjs', 'moment', 'date-fns', 'luxon'].filter((d) => deps[d]);
  add(
    '2.1.9',
    dates.length ? dates.join(', ') : 'Không dùng thư viện ngày giờ',
    'medium',
    ['package.json'],
  );

  // 2.2: thư viện theo tầng, tính từ import thực tế
  const layers = {
    '2.2.1': ['dto'],
    '2.2.2': ['ro'],
    '2.2.3': ['controller'],
    '2.2.4': ['service'],
    '2.2.5': ['repository'],
  };
  for (const [key, sfx] of Object.entries(layers)) {
    const files = filesOf(...sfx);
    if (!files.length) continue;
    const cnt = {};
    for (const f of files)
      for (const p of importsByFile.get(f) || []) cnt[p] = (cnt[p] || 0) + 1;
    const topPkgs = sorted(cnt)
      .slice(0, 6)
      .map(([p, n]) => `${p} (${n}/${files.length} file)`);
    add(key, topPkgs, files.length >= 3 ? 'high' : 'medium', [rel(files[0])], {
      luuY: 'Chỉ liệt kê thư viện được import; "Quy tắc sử dụng" cần người dùng bổ sung.',
    });
  }

  // Thư viện khai báo nhưng không dùng / dùng nhưng không khai báo
  const nestLike = (p) =>
    /^@nestjs\//.test(p) ||
    [
      'typeorm',
      'class-validator',
      'class-transformer',
      'passport',
      'passport-jwt',
      'bcrypt',
      'bcryptjs',
      'dayjs',
      'moment',
      'mysql2',
      'rxjs',
    ].includes(p);
  const declaredNotUsed = Object.keys(pkg.dependencies || {}).filter(
    (d) =>
      nestLike(d) &&
      !importedPkgs[d] &&
      !['mysql2', 'mysql', 'reflect-metadata', 'rxjs'].includes(d),
  );
  const usedNotDeclared = Object.keys(importedPkgs).filter(
    (p) =>
      !deps[p] &&
      !require('module').builtinModules.includes(p) &&
      !p.startsWith('node:'),
  );
  items._dependencies = {
    nestjs: Object.keys(deps)
      .filter((d) => d.startsWith('@nestjs/'))
      .map((d) => ({
        name: d,
        version: deps[d],
        usedInFiles: importedPkgs[d] || 0,
      })),
    declaredButUnused: declaredNotUsed,
    usedButUndeclared: usedNotDeclared,
  };
})();

// ───────────────────────── 3. Kiến trúc ─────────────────────────
(function architecture() {
  if (hasFeatureCode) {
    const moduleDirs = featureModules.map((f) => path.dirname(f));
    const parents = tally(moduleDirs.map((d) => rel(path.dirname(d))));
    const modulesDir = sorted(parents)[0][0];
    const layoutByLayer =
      ['controllers', 'services', 'repositories'].filter((n) =>
        all.dirs.some((d) => path.basename(d) === n),
      ).length >= 2;
    add(
      '3.1.1',
      layoutByLayer
        ? 'Chia theo loại file (by-layer)'
        : 'Chia theo tính năng (by-feature)',
      'medium',
      [rel(featureModules[0])],
    );
    add(
      '3.1.2',
      modulesDir,
      sorted(parents)[0][1] === moduleDirs.length ? 'high' : 'medium',
      [rel(featureModules[0])],
    );
    const suffixesInModules = new Set();
    const subdirs = {};
    for (const d of moduleDirs) {
      for (const f of tsFiles.filter((x) => x.startsWith(d + path.sep))) {
        const m = path.basename(f).match(/\.([a-z-]+)\.ts$/);
        if (m && m[1] !== 'spec') suffixesInModules.add(m[1]);
      }
      for (const sd of all.dirs.filter((x) => path.dirname(x) === d))
        subdirs[path.basename(sd)] = (subdirs[path.basename(sd)] || 0) + 1;
    }
    add('3.1.3', [...suffixesInModules].sort(), 'medium', [
      rel(featureModules[0]),
    ]);
    add(
      '3.1.4',
      Object.keys(subdirs).length
        ? sorted(subdirs).map(([n, c]) => `${n}/ (${c} module)`)
        : 'Không có thư mục con, file nằm phẳng trong thư mục module',
      'medium',
      [rel(moduleDirs[0])],
    );
  }

  // 3.2: thư mục dùng chung
  const types = [
    ['3.2.1', /^decorators?$/],
    ['3.2.2', /^guards?$/],
    ['3.2.3', /^interceptors?$/],
    ['3.2.4', /^filters?$/],
    ['3.2.5', /^middlewares?$/],
    ['3.2.6', /^pipes?$/],
    ['3.2.7', /^interfaces?$/],
    ['3.2.8', /^enums?$/],
    ['3.2.9', /^constants?$/],
    ['3.2.10', /^(utils?|helpers?)$/],
  ];
  const moduleDirSet = new Set(featureModules.map((f) => path.dirname(f)));
  for (const [key, re] of types) {
    const cand = all.dirs.filter(
      (d) =>
        re.test(path.basename(d)) &&
        ![...moduleDirSet].some((m) => d.startsWith(m + path.sep)),
    ); // loại thư mục nằm trong module
    if (!cand.length) continue;
    const scored = cand
      .map((d) => ({
        d,
        n: tsFiles.filter((f) => f.startsWith(d + path.sep)).length,
      }))
      .sort((a, b) => b.n - a.n);
    add(
      key,
      rel(scored[0].d),
      scored.length === 1 ? 'high' : 'medium',
      [rel(scored[0].d)],
      {
        soFile: scored[0].n,
        candidates:
          scored.length > 1
            ? scored.map((s) => `${rel(s.d)} (${s.n} file)`)
            : undefined,
      },
    );
  }

  // 3.3: phân tầng
  const ctrlImportsRepo = filesOf('controller').filter((f) =>
    /\.repository['"]|from\s+['"]typeorm['"]|@nestjs\/typeorm/.test(read(f)),
  );
  const svcImportsRepo = filesOf('service').filter((f) =>
    /\.repository['"]/.test(read(f)),
  );
  const svcInjectRepo = filesOf('service').filter((f) =>
    /@InjectRepository|\bRepository</.test(read(f)),
  );
  if (filesOf('controller').length || filesOf('service').length) {
    const flow =
      svcImportsRepo.length || filesOf('repository').length
        ? 'Controller → Service → Repository'
        : svcInjectRepo.length
          ? 'Controller → Service (Service dùng trực tiếp Repository của TypeORM)'
          : 'Controller → Service';
    add('3.3.1', flow, filesOf('service').length >= 3 ? 'medium' : 'low', [
      rel(svcImportsRepo[0] || svcInjectRepo[0] || filesOf('service')[0]),
    ]);
    add(
      '3.3.2',
      ctrlImportsRepo.length
        ? `${ctrlImportsRepo.length} controller import repository/typeorm trực tiếp (vi phạm phân tầng)`
        : 'Không thấy controller gọi repository/typeorm trực tiếp',
      'medium',
      ctrlImportsRepo.slice(0, 3).map(rel),
    );
  }
  const tx = grep(codeFiles, /\.transaction\(|createQueryRunner|QueryRunner/);
  add(
    '3.3.5',
    tx.length
      ? `Có dùng transaction (${tx.length} chỗ)`
      : 'Không thấy dùng transaction',
    'medium',
    ev(tx),
  );
  const cursor = grep(codeFiles, /\bcursor\b/i).length;
  const offset = grep(codeFiles, /\.skip\(|\.take\(|\boffset\b/).length;
  if (cursor + offset)
    add(
      '3.3.6',
      cursor > offset
        ? `Có dấu hiệu cursor/keyset (${cursor} chỗ), offset (${offset} chỗ)`
        : `Có dấu hiệu offset/limit (${offset} chỗ), cursor (${cursor} chỗ)`,
      'low',
      [],
    );
})();

// ───────────────────────── 4. Bảo mật và xử lý lỗi ─────────────────────────
(function security() {
  // 4.1
  const appGuard = grep(
    codeFiles,
    /provide:\s*APP_GUARD\s*,\s*useClass:\s*(\w+)/,
  );
  const globalGuards = grep(codeFiles, /useGlobalGuards\(\s*new\s+(\w+)/);
  const useGuards = grep(codeFiles, /@UseGuards\(/);
  if (appGuard.length || globalGuards.length) {
    const names = [
      ...new Set([...appGuard, ...globalGuards].map((h) => h.m[1])),
    ];
    add(
      '4.1.3',
      `global (guard: ${names.join(', ')})`,
      'high',
      ev([...appGuard, ...globalGuards]),
    );
    const authG = names.find((n) => /auth|jwt/i.test(n));
    if (authG) {
      const gf = filesOf('guard').find((f) =>
        new RegExp(`class\\s+${authG}\\b`).test(read(f)),
      );
      add(
        '4.1.2',
        { name: authG, file: gf ? rel(gf) : null },
        'high',
        ev(appGuard),
      );
    }
  } else if (useGuards.length) {
    add(
      '4.1.3',
      `từng route (@UseGuards: ${useGuards.length} chỗ), không thấy APP_GUARD`,
      'medium',
      ev(useGuards),
    );
  } else {
    add('4.1.3', 'Chưa thấy guard nào được đăng ký', 'medium', []);
  }

  const decoFiles = filesOf('decorator');
  const setMeta = grep(
    decoFiles,
    /export\s+const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>\s*)?SetMetadata\(/,
  );
  const pub = setMeta.find((h) => /public/i.test(h.m[1]));
  if (pub)
    add('4.1.4', { name: pub.m[1], file: rel(pub.file) }, 'high', ev([pub]));
  const roles = setMeta.find((h) => /roles?/i.test(h.m[1]));
  if (roles)
    add(
      '4.2.2',
      { name: roles.m[1], file: rel(roles.file) },
      'high',
      ev([roles]),
    );
  const cu = grep(
    decoFiles,
    /export\s+const\s+(\w+)\s*=\s*createParamDecorator/,
  );
  if (cu.length)
    add('4.1.5', { name: cu[0].m[1], file: rel(cu[0].file) }, 'high', ev(cu));

  const strat = grep(
    codeFiles,
    /class\s+(\w+)\s+extends\s+PassportStrategy\(\s*(\w+)/,
  );
  const bearer = grep(codeFiles, /ExtractJwt\.fromAuthHeaderAsBearerToken/);
  if (strat.length) {
    add(
      '4.1.1',
      `Passport ${strat[0].m[2]} (${strat[0].m[1]})${bearer.length ? ', Bearer token trong header Authorization' : ''}`,
      'high',
      ev(strat),
    );
  } else if (deps['@nestjs/jwt']) {
    add('4.1.1', 'JWT (@nestjs/jwt), không thấy Passport strategy', 'medium', [
      'package.json',
    ]);
  }

  const rolesGuard = filesOf('guard').find(
    (f) => /Reflector/.test(read(f)) && /roles?/i.test(path.basename(f)),
  );
  if (rolesGuard) {
    const cls = read(rolesGuard).match(/export\s+class\s+(\w+)/);
    add('4.2.1', { name: cls ? cls[1] : null, file: rel(rolesGuard) }, 'high', [
      rel(rolesGuard),
    ]);
  }
  const roleEnum = grep(
    codeFiles,
    /export\s+enum\s+(\w*Role\w*)\s*\{([^}]*)\}/,
  )[0];
  if (roleEnum) {
    add(
      '4.2.3',
      { name: roleEnum.m[1], file: rel(roleEnum.file) },
      'high',
      ev([roleEnum]),
    );
    const vals = [
      ...roleEnum.m[2].matchAll(/^\s*(\w+)\s*=?\s*(['"][^'"]*['"])?/gm),
    ]
      .map((m) => m[1])
      .filter(Boolean);
    add('4.2.4', vals, 'high', ev([roleEnum]));
  }

  // 4.3
  const hash = ['bcrypt', 'bcryptjs', 'argon2'].find((d) => deps[d]);
  if (hash) {
    const rounds = grep(
      codeFiles,
      /(?:\.hash|genSalt)\([^)]*?\b(\d{1,2})\b\s*\)/,
    )[0];
    add(
      '4.3.1',
      `${hash}${rounds ? ', số vòng băm ' + rounds.m[1] : ''}`,
      rounds ? 'high' : 'medium',
      rounds ? ev([rounds]) : ['package.json'],
    );
  }
  const excl = grep(codeFiles, /@Exclude\(\)/);
  add(
    '4.3.2',
    excl.length
      ? `Có dùng @Exclude() (${excl.length} chỗ)`
      : 'Không thấy @Exclude()',
    'medium',
    ev(excl),
  );
  const vp = grep(codeFiles, /new\s+ValidationPipe\(\s*(\{[^}]*\})?\s*\)/);
  if (vp.length)
    add(
      '4.3.3',
      `ValidationPipe ${vp[0].m[1] ? vp[0].m[1].replace(/\s+/g, ' ') : '(mặc định)'}`,
      'high',
      ev(vp),
    );
  else if (grep(codeFiles, /provide:\s*APP_PIPE/).length)
    add('4.3.3', 'Đăng ký pipe qua APP_PIPE', 'medium', []);
  const rawQ = grep(codeFiles, /\.query\(\s*`[^`]*\$\{/);
  add(
    '4.3.4',
    rawQ.length
      ? `Cảnh báo: ${rawQ.length} chỗ nối chuỗi vào .query()`
      : 'Không thấy nối chuỗi vào .query()',
    'medium',
    ev(rawQ),
  );
  const procEnv = grep(
    codeFiles.filter((f) => !/config/i.test(path.basename(f))),
    /process\.env\./,
  );
  const cfgSvc = grep(codeFiles, /ConfigService/);
  add(
    '4.3.5',
    `ConfigService: ${cfgSvc.length} chỗ; process.env trực tiếp (ngoài file config): ${procEnv.length} chỗ`,
    'medium',
    ev(procEnv),
  );
  const throttle = deps['@nestjs/throttler'];
  const cors = grep(codeFiles, /enableCors\(/);
  add(
    '4.3.6',
    `Throttler: ${throttle ? 'có' : 'không'}; CORS: ${cors.length ? 'có enableCors' : 'không thấy'}`,
    'medium',
    ev(cors),
  );

  // 4.4
  const exc = grep(
    codeFiles,
    /new\s+(\w+Exception)\(\s*(?:['"`]([^'"`]*)['"`])?/,
  );
  if (exc.length) {
    add(
      '4.4.1',
      sorted(tally(exc.map((h) => h.m[1])))
        .slice(0, 8)
        .map(([n, c]) => `${n} (${c})`),
      'high',
      ev(exc),
    );
    const where = tally(
      exc.map((h) => {
        const s = path.basename(h.file).match(/\.([a-z-]+)\.ts$/);
        return s ? s[1] : 'khác';
      }),
    );
    add('4.4.2', Object.fromEntries(sorted(where)), 'medium', ev(exc));
    const msgs = exc.map((h) => h.m[2]).filter(Boolean);
    if (msgs.length) {
      const vi = msgs.filter((m) => VI_CHARS.test(m)).length;
      add(
        '4.4.7',
        vi / msgs.length >= 0.5
          ? `Tiếng Việt (${vi}/${msgs.length} thông báo)`
          : `Tiếng Anh hoặc mã (${msgs.length - vi}/${msgs.length} thông báo)`,
        msgs.length >= 5 ? 'medium' : 'low',
        ev(exc),
      );
    }
  }
  const gf = grep(
    codeFiles,
    /useGlobalFilters\(\s*new\s+(\w+)|provide:\s*APP_FILTER\s*,\s*useClass:\s*(\w+)/,
  );
  if (gf.length) {
    add('4.4.4', { name: gf[0].m[1] || gf[0].m[2] }, 'high', ev(gf));
    add('4.4.3', 'Tùy filter tùy biến (xem file filter)', 'low', ev(gf));
  } else {
    add('4.4.4', 'Không có filter toàn cục', 'medium', []);
    add(
      '4.4.3',
      '{ message, error, statusCode } (mặc định của NestJS)',
      'medium',
      [],
    );
  }
  const dup = grep(codeFiles, /ER_DUP_ENTRY/);
  add(
    '4.4.8',
    dup.length ? 'Có bắt ER_DUP_ENTRY' : 'Không thấy bắt ER_DUP_ENTRY',
    'medium',
    ev(dup),
  );
})();

// ───────────────────────── 5. Tài liệu ─────────────────────────
(function docs() {
  const ctrls = filesOf('controller');
  const dtos = filesOf('dto', 'ro');
  const countFiles = (files, re) =>
    files.filter((f) => re.test(read(f))).length;
  const hasSwagger = !!deps['@nestjs/swagger'];
  add('5.1.1', hasSwagger ? 'Có' : 'Không', 'high', ['package.json']);
  if (hasSwagger && ctrls.length) {
    add(
      '5.1.2',
      `@ApiTags: ${countFiles(ctrls, /@ApiTags/)}/${ctrls.length} controller; @ApiBearerAuth: ${countFiles(ctrls, /@ApiBearerAuth/)}/${ctrls.length}`,
      ctrls.length >= 3 ? 'medium' : 'low',
      [rel(ctrls[0])],
    );
    const handlers = grep(ctrls, /@(?:Get|Post|Put|Patch|Delete)\(/).length;
    const ops = grep(ctrls, /@ApiOperation\(/).length;
    const resp = grep(ctrls, /@Api\w*Response\(/).length;
    add(
      '5.1.3',
      `@ApiOperation: ${ops}/${handlers} handler`,
      handlers >= 3 ? 'medium' : 'low',
      [rel(ctrls[0])],
    );
    add(
      '5.1.4',
      `@Api*Response: ${resp} chỗ trên ${handlers} handler`,
      handlers >= 3 ? 'medium' : 'low',
      [rel(ctrls[0])],
    );
  }
  if (hasSwagger && dtos.length)
    add(
      '5.1.5',
      `@ApiProperty trong ${countFiles(dtos, /@ApiProperty|@ApiPropertyOptional/)}/${dtos.length} file DTO/RO`,
      dtos.length >= 3 ? 'medium' : 'low',
      [rel(dtos[0])],
    );

  // 5.2 JSDoc ở Service
  const svcs = filesOf('service');
  if (svcs.length) {
    let methods = 0;
    let documented = 0;
    for (const f of svcs) {
      const t = read(f);
      for (const m of t.matchAll(
        /^\s{2}(?:public\s+)?(?:async\s+)?(?!constructor\b|private\b|protected\b)(\w+)\s*\([^)]*\)[^{;]*\{/gm,
      )) {
        methods++;
        if (/\*\/\s*$/.test(t.slice(0, m.index).trimEnd())) documented++;
      }
    }
    if (methods) {
      add(
        '5.2.2',
        `${documented}/${methods} hàm public của Service có JSDoc`,
        methods >= 5 ? 'medium' : 'low',
        [rel(svcs[0])],
      );
      add(
        '5.2.3',
        documented
          ? 'Có JSDoc; xem file mẫu để biết có @param/@returns/@throws không'
          : 'Không có JSDoc',
        'low',
        [rel(svcs[0])],
      );
    }
  }
  const gen = grep(codeFiles, /@generated-from/);
  add(
    '5.2.5',
    gen.length
      ? `Có header @generated-from (${gen.length} file)`
      : 'Chưa dùng header @generated-from',
    gen.length ? 'high' : 'medium',
    ev(gen),
  );

  // 5.3
  const wikiDirs = ['docs/wiki', 'wiki', 'docs/api', 'docs'].filter((d) =>
    fs.existsSync(path.join(root, d)),
  );
  if (wikiDirs.length)
    add(
      '5.3.1',
      wikiDirs[0],
      wikiDirs[0].includes('wiki') ? 'medium' : 'low',
      [wikiDirs[0]],
      { candidates: wikiDirs.length > 1 ? wikiDirs : undefined },
    );
  const wv = grep(codeFiles, /@wiki-(?:version|hash)/);
  if (wv.length)
    add(
      '5.3.3',
      `Có header @wiki-version/@wiki-hash (${wv.length} chỗ)`,
      'high',
      ev(wv),
    );

  // 5.4
  add(
    '5.4.1',
    fs.existsSync(path.join(root, 'README.md'))
      ? 'Có README.md'
      : 'Không có README.md',
    'high',
    ['README.md'],
  );
  const commitlint = fs
    .readdirSync(root)
    .find((n) => /^(\.commitlintrc.*|commitlint\.config\..+)$/.test(n));
  let commits = [];
  try {
    commits = execFileSync(
      'git',
      ['-C', root, 'log', '-n', '50', '--pretty=%s'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .split('\n')
      .filter(Boolean);
  } catch {
    /* không có git */
  }
  if (commitlint)
    add('5.4.2', `commitlint (${commitlint})`, 'high', [commitlint]);
  else if (commits.length >= 5) {
    const cv = commits.filter((s) =>
      /^(feat|fix|chore|docs|refactor|test|style|perf|build|ci|revert)(\(.+\))?!?:\s/.test(
        s,
      ),
    ).length;
    add(
      '5.4.2',
      `${cv}/${commits.length} commit gần nhất theo Conventional Commits`,
      cv / commits.length >= 0.8
        ? 'high'
        : cv / commits.length >= 0.4
          ? 'medium'
          : 'low',
      ['git log'],
    );
  }
  const migrations = all.files.filter(
    (f) => /migrations?[\\/]/.test(rel(f)) && f.endsWith('.ts'),
  );
  const migScript = Object.entries(pkg.scripts || {})
    .filter(([, v]) => /migration/.test(v))
    .map(([k]) => k);
  add(
    '5.4.3',
    migrations.length || migScript.length
      ? `Có migration (${migrations.length} file; script: ${migScript.join(', ') || 'không có'})`
      : 'Không thấy migration',
    'medium',
    migrations.slice(0, 1).map(rel),
  );
})();

// ───────────────────────── Tổng hợp ─────────────────────────
// Dự án chưa có module nghiệp vụ: các kết luận kiểu "không thấy X" không đáng tin
// (chưa có code để thấy), nên chỉ giữ phần suy ra từ package.json và file cấu hình.
if (!hasFeatureCode) {
  const KEEP = new Set([
    '1.1.1',
    '1.1.2',
    '1.1.3',
    '2.1.1',
    '2.1.2',
    '2.1.3',
    '2.1.4',
    '2.1.5',
    '2.1.6',
    '2.1.7',
    '2.1.8',
    '2.1.9',
    '4.3.1',
    '5.1.1',
    '5.4.1',
    '5.4.2',
    '5.4.3',
  ]);
  for (const k of Object.keys(items))
    if (!k.startsWith('_') && !KEEP.has(k)) delete items[k];
}

const range = (p, n) => Array.from({ length: n }, (_, i) => `${p}.${i + 1}`);
const ALL_KEYS = [
  ...range('1.1', 8),
  ...range('1.2', 11),
  ...range('1.3', 7),
  ...range('1.4', 8),
  ...range('1.5', 6),
  ...range('2.1', 9),
  ...range('2.2', 5),
  '2.3.1',
  '2.3.2',
  '2.4.1',
  ...range('3.1', 4),
  ...range('3.2', 10),
  ...range('3.3', 6),
  ...range('3.4', 4),
  ...range('3.5', 5),
  ...range('4.1', 5),
  ...range('4.2', 6),
  ...range('4.3', 7),
  ...range('4.4', 8),
  ...range('5.1', 5),
  ...range('5.2', 5),
  ...range('5.3', 3),
  ...range('5.4', 3),
];
const POLICY = new Set([
  '2.3.1',
  '2.3.2',
  '2.4.1',
  '3.4.1',
  '3.4.2',
  '3.4.3',
  '3.4.4',
  '3.5.1',
  '3.5.2',
  '3.5.3',
  '3.5.4',
  '3.5.5',
  '4.2.5',
  '4.2.6',
  '4.3.7',
  '4.4.5',
  '4.4.6',
  '1.4.1',
  '1.5.5',
  '5.3.2',
]);

const unresolved = [];
for (const k of ALL_KEYS) {
  if (items[k]) {
    if (items[k].candidates && items[k].confidence !== 'high') {
      unresolved.push({
        key: k,
        reason: 'tìm thấy nhiều kiểu, cần người dùng chọn',
        candidates: items[k].candidates,
      });
    }
    continue;
  }
  unresolved.push({
    key: k,
    reason: POLICY.has(k)
      ? 'quy ước do nhóm đặt, không suy ra được từ code (lấy từ preset hoặc hỏi)'
      : 'không tìm thấy dấu hiệu trong dự án',
  });
}

const conf = tally(
  Object.entries(items)
    .filter(([k]) => !k.startsWith('_'))
    .map(([, v]) => v.confidence),
);
const report = {
  meta: {
    schemaVersion: SCHEMA_VERSION,
    scannedAt: new Date().toISOString(),
    root,
    sourceDir: rel(srcDir) || '.',
    tsFilesScanned: codeFiles.length,
    featureModules: featureModules.length,
    hasFeatureCode,
    recommendation: hasFeatureCode
      ? 'Dự án đã có code: dùng giá trị quét được, hỏi người dùng các mục trong "unresolved".'
      : 'Dự án chưa có module nghiệp vụ: lấy giá trị từ preset, chỉ dùng kết quả quét cho phần công nghệ (mục 2.1).',
    summary: {
      high: conf.high || 0,
      medium: conf.medium || 0,
      low: conf.low || 0,
      unresolved: unresolved.length,
    },
  },
  items,
  unresolved,
};

const outPath = flags.out
  ? path.resolve(flags.out)
  : path.join(root, '.project-profile', 'scan-report.json');
if (flags.stdout) {
  console.log(JSON.stringify(report, null, 2));
} else {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  const s = report.meta.summary;
  console.log(
    `Đã quét ${report.meta.tsFilesScanned} file TypeScript, ${report.meta.featureModules} module nghiệp vụ.`,
  );
  console.log(
    `Kết quả: high ${s.high}, medium ${s.medium}, low ${s.low}, chưa xác định ${s.unresolved}.`,
  );
  console.log(report.meta.recommendation);
  console.log(`Báo cáo: ${outPath}`);
}
