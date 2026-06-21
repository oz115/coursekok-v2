/**
 * extractor.js
 * ============
 * coursekok raw-wireframe 번들(app.html)을 언팩하여
 * output/ 폴더 아래에 실제 파일로 추출하는 스크립트.
 *
 * 사용법:
 *   node extractor.js [app.html 경로] [출력 폴더 경로]
 *
 * 기본값:
 *   입력: ./app.html
 *   출력: ./output/
 *
 * 인코딩 방식 요약:
 *   __bundler/manifest  → JSON { uuid: { mime, compressed, data } }
 *     - data: 순수 Base64 (Standard, atob 호환)
 *     - compressed=true → Base64 decode 후 gzip 압축 해제
 *     - compressed=false → Base64 decode만 수행 (이미지 등 바이너리)
 *   __bundler/ext_resources → JSON 배열 [{ id, uuid }, ...]  (uuid → 사람이 읽을 수 있는 id 매핑)
 *   __bundler/template  → JSON 직렬화된 HTML 문자열 (JSON.parse로 복원)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── CLI 인수 ────────────────────────────────────────────────────────────────
const INPUT_HTML  = process.argv[2] || path.join(__dirname, 'app.html');
const OUTPUT_DIR  = process.argv[3] || path.join(__dirname, 'output');

// ─── 유틸리티 ────────────────────────────────────────────────────────────────

/** MIME 타입 → 파일 확장자 */
function mimeToExt(mime) {
  const map = {
    'application/javascript': '.js',
    'text/javascript':        '.js',
    'text/css':               '.css',
    'text/html':              '.html',
    'image/jpeg':             '.jpg',
    'image/png':              '.png',
    'image/gif':              '.gif',
    'image/webp':             '.webp',
    'image/svg+xml':          '.svg',
    'application/json':       '.json',
    'font/woff2':             '.woff2',
    'font/woff':              '.woff',
  };
  return map[mime] || '.bin';
}

/** 디렉터리 재귀 생성 */
function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Base64 → Buffer */
function b64ToBuffer(b64) {
  return Buffer.from(b64, 'base64');
}

/** gzip 압축 해제 (동기) */
function gunzipSync(buf) {
  return zlib.gunzipSync(buf);
}

/**
 * JS 파일 첫 줄에서 사람이 읽을 수 있는 설명 추출.
 * 예: "// 코스콕 — App shell: NavBar, BasketDrawer, Toaster"
 * → "Shell"  (간단한 휴리스틱)
 */
function guessFriendlyName(code) {
  // @ds-bundle 메타데이터가 있으면 namespace 사용
  const nsMatch = code.match(/"namespace"\s*:\s*"([^"]+)"/);
  if (nsMatch) return nsMatch[1];

  // 첫 줄 주석에서 파일명 힌트 추출
  const commentMatch = code.match(/^\/\/[^\n]*—\s*(.+)/);
  if (commentMatch) {
    return commentMatch[1]
      .trim()
      .split(':')[0]
      .replace(/[^a-zA-Z0-9가-힣 _-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 40);
  }

  // window.XXX = 패턴
  const windowMatch = code.match(/window\.([A-Z][A-Za-z0-9_]+)\s*=/);
  if (windowMatch) return windowMatch[1];

  return null;
}

/**
 * ds-bundle 주석에서 components 배열 추출.
 * 파일 분리에 사용.
 */
function parseDsBundle(code) {
  const metaMatch = code.match(/\/\*\s*@ds-bundle:\s*(\{[\s\S]*?\})\s*\*\//);
  if (!metaMatch) return null;
  try {
    return JSON.parse(metaMatch[1]);
  } catch {
    return null;
  }
}

// ─── HTML 파싱: script 태그 내용 추출 ───────────────────────────────────────

/**
 * 특정 type의 <script> 태그 내용만 추출한다.
 * 주의: 로더 스크립트 안에도 type 문자열이 등장하므로
 *       반드시 줄의 시작 부분에 <script 태그가 있는지 확인한다.
 */
function extractScriptByType(lines, type) {
  // <script 로 실제 시작하는 태그만 인식하는 정규식
  const openRe = new RegExp(`^\\s*<script[^>]+type=["']${type.replace(/\//g, '\\/')}["'][^>]*>`);

  let inside  = false;
  let content = [];

  for (const line of lines) {
    if (!inside) {
      if (openRe.test(line)) {
        inside = true;
        // 같은 줄에 내용이 있을 수 있음 (한 줄짜리)
        const afterOpen = line.replace(/<script[^>]*>/, '');
        const closeIdx = afterOpen.indexOf('</script>');
        if (closeIdx !== -1) {
          content.push(afterOpen.substring(0, closeIdx));
          inside = false;
        } else {
          content.push(afterOpen);
        }
      }
    } else {
      const closeIdx = line.indexOf('</script>');
      if (closeIdx !== -1) {
        content.push(line.substring(0, closeIdx));
        inside = false;
      } else {
        content.push(line);
      }
    }
  }

  return content.join('').trim();
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' coursekok app.html extractor');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`입력 파일  : ${INPUT_HTML}`);
  console.log(`출력 폴더  : ${OUTPUT_DIR}`);
  console.log('');

  // 1. 파일 읽기 (라인 분리 – 530만 자이나 실제 라인 수는 182줄)
  console.log('▶ [1/5] app.html 읽는 중...');
  const raw   = fs.readFileSync(INPUT_HTML, 'utf-8');
  const lines = raw.split('\n');
  console.log(`   총 ${lines.length}줄, ${(raw.length / 1024 / 1024).toFixed(2)} MB`);

  // 2. 각 번들 섹션 추출
  console.log('▶ [2/5] 번들 섹션 파싱 중...');

  const manifestRaw      = extractScriptByType(lines, '__bundler/manifest');
  const extResourcesRaw  = extractScriptByType(lines, '__bundler/ext_resources');
  const templateRaw      = extractScriptByType(lines, '__bundler/template');

  if (!manifestRaw)     { console.error('❌ __bundler/manifest 를 찾을 수 없습니다.'); process.exit(1); }
  if (!templateRaw)     { console.error('❌ __bundler/template 를 찾을 수 없습니다.'); process.exit(1); }

  let manifest, extResources, templateHtml;

  try { manifest = JSON.parse(manifestRaw); }
  catch (e) { console.error('❌ manifest JSON 파싱 실패:', e.message); process.exit(1); }

  try { extResources = extResourcesRaw ? JSON.parse(extResourcesRaw) : []; }
  catch { extResources = []; }

  try { templateHtml = JSON.parse(templateRaw); }
  catch (e) { console.error('❌ template JSON 파싱 실패:', e.message); process.exit(1); }

  // uuid → 사람이 읽을 수 있는 id 매핑 (ext_resources 기반)
  const uuidToId = {};
  for (const r of extResources) {
    uuidToId[r.uuid] = r.id;
  }

  const uuids = Object.keys(manifest);
  console.log(`   manifest 항목 수  : ${uuids.length}`);
  console.log(`   ext_resources 수  : ${extResources.length}`);
  console.log(`   template 크기     : ${(templateHtml.length / 1024).toFixed(1)} KB`);

  // 3. 출력 디렉터리 구성
  console.log('▶ [3/5] 출력 디렉터리 초기화 중...');
  mkdirp(OUTPUT_DIR);

  const DIRS = {
    js:        path.join(OUTPUT_DIR, 'scripts'),
    images:    path.join(OUTPUT_DIR, 'images'),
    css:       path.join(OUTPUT_DIR, 'styles'),
    fonts:     path.join(OUTPUT_DIR, 'fonts'),
    misc:      path.join(OUTPUT_DIR, 'misc'),
    template:  OUTPUT_DIR,
  };
  for (const d of Object.values(DIRS)) mkdirp(d);

  // 4. 각 asset 디코딩 & 저장
  console.log('▶ [4/5] 에셋 디코딩 & 저장 중...');

  const index = {  // 나중에 index.json으로 저장할 메타
    manifest_count: uuids.length,
    files: [],
  };

  // uuid → 저장된 파일명 (template 내 uuid 치환에 사용)
  const uuidToFile = {};

  let count = 0;
  for (const uuid of uuids) {
    count++;
    const entry = manifest[uuid];
    const { mime, compressed, data } = entry;
    const ext   = mimeToExt(mime);

    // Base64 → Buffer
    let buf = b64ToBuffer(data);

    // gzip 압축 해제
    if (compressed) {
      try {
        buf = gunzipSync(buf);
      } catch (e) {
        console.warn(`   ⚠ [${count}/${uuids.length}] gzip 해제 실패 (${uuid}): ${e.message}`);
      }
    }

    // 폴더 결정
    let targetDir = DIRS.misc;
    if (mime.startsWith('image/'))                  targetDir = DIRS.images;
    else if (mime.startsWith('font/'))              targetDir = DIRS.fonts;
    else if (mime.includes('javascript'))           targetDir = DIRS.js;
    else if (mime === 'text/css')                   targetDir = DIRS.css;

    // 파일명 결정
    let friendlyName = uuidToId[uuid] || null;  // ext_resources에서 먼저 확인

    if (!friendlyName && mime.includes('javascript')) {
      // JS라면 코드 내용에서 추측
      const code = buf.toString('utf-8');
      friendlyName = guessFriendlyName(code);
    }

    const fileName = friendlyName
      ? `${friendlyName}${ext}`
      : `${uuid}${ext}`;

    const outPath = path.join(targetDir, fileName);

    fs.writeFileSync(outPath, buf);
    uuidToFile[uuid] = path.relative(OUTPUT_DIR, outPath).replace(/\\/g, '/');

    const sizeKB = (buf.length / 1024).toFixed(1);
    const label  = friendlyName || uuid.substring(0, 8) + '…';
    process.stdout.write(`   [${String(count).padStart(2)}/${uuids.length}] ${label.padEnd(50)} ${sizeKB.padStart(8)} KB  (${mime})\n`);

    index.files.push({
      uuid,
      friendlyName: friendlyName || null,
      mime,
      compressed,
      sizeBytes: buf.length,
      outputPath: uuidToFile[uuid],
    });
  }

  // ─── DS-bundle 내부 분리 ───────────────────────────────────────────────────
  // DesignSystem 번들에는 여러 컴포넌트가 합쳐져 있음.
  // @ds-bundle 메타가 있으면 각 컴포넌트를 sourceHashes 기반으로 분리.
  const dsEntry = index.files.find(f => f.outputPath.includes('DesignSystem'));
  if (dsEntry) {
    const dsCode = fs.readFileSync(path.join(OUTPUT_DIR, dsEntry.outputPath), 'utf-8');
    const dsMeta = parseDsBundle(dsCode);
    if (dsMeta && dsMeta.components) {
      console.log(`\n   DS-bundle 컴포넌트 ${dsMeta.components.length}개 메타 발견 → component_map.json 저장`);
      const mapOut = path.join(OUTPUT_DIR, 'component_map.json');
      fs.writeFileSync(mapOut, JSON.stringify(dsMeta, null, 2), 'utf-8');
      index.ds_bundle_meta = 'component_map.json';
    }
  }

  // 5. template HTML 저장
  console.log('\n▶ [5/5] template HTML 및 index 저장 중...');

  // template 저장 (원본 + uuid 치환된 버전)
  fs.writeFileSync(path.join(DIRS.template, 'template_raw.html'), templateHtml, 'utf-8');

  // uuid → 파일경로 치환
  let templateResolved = templateHtml;
  for (const [uuid, filePath] of Object.entries(uuidToFile)) {
    templateResolved = templateResolved.split(uuid).join(filePath);
  }
  fs.writeFileSync(path.join(DIRS.template, 'template_resolved.html'), templateResolved, 'utf-8');
  console.log(`   template_raw.html      → ${(templateHtml.length / 1024).toFixed(1)} KB`);
  console.log(`   template_resolved.html → UUID를 상대 경로로 치환한 버전`);

  // index.json 저장
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
  console.log(`   index.json             → 전체 에셋 목록`);

  // ─── 요약 출력 ──────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(' 추출 완료!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(' 출력 폴더 구조:');
  console.log('  output/');
  console.log('  ├── index.json              ← 전체 에셋 메타 목록');
  console.log('  ├── template_raw.html       ← 원본 템플릿 HTML');
  console.log('  ├── template_resolved.html  ← UUID → 파일명 치환된 HTML');
  console.log('  ├── component_map.json      ← DS 컴포넌트 목록 (있을 경우)');
  console.log('  ├── scripts/                ← JavaScript / JSX 코드');
  console.log('  ├── images/                 ← JPEG/PNG 이미지');
  console.log('  ├── styles/                 ← CSS 파일');
  console.log('  ├── fonts/                  ← 웹폰트');
  console.log('  └── misc/                   ← 기타');
  console.log('');

  const byMime = {};
  for (const f of index.files) {
    byMime[f.mime] = (byMime[f.mime] || 0) + 1;
  }
  console.log(' MIME 타입별 집계:');
  for (const [m, n] of Object.entries(byMime)) {
    console.log(`  ${String(n).padStart(3)}개  ${m}`);
  }
  console.log('');
}

main().catch(err => {
  console.error('❌ 오류 발생:', err);
  process.exit(1);
});
