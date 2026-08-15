#!/usr/bin/env node
/**
 * validate.mjs — 吸星大法 / Skill Consolidator 仓库校验
 *
 * 单一校验入口，供本地开发、CI（.github/workflows/validate-skill.yml）与
 * `npm run prepublishOnly` 共用。通过退出码 0 / 1 报告结果。
 *
 * 用法：
 *   node scripts/validate.mjs [--root <repo-root>] [--skills skill-consolidator]
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const ROOT = resolve(getArg('--root') ?? '.');
const SKILL_DIRS = (getArg('--skills') ?? 'skill-consolidator').split(',').map((s) => s.trim()).filter(Boolean);

const errors = [];
const ok = (msg) => console.log(`  \u2713 ${msg}`);
const fail = (msg) => errors.push(msg);

/** 解析简单 YAML frontmatter（单行 key: value） */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[kv[1]] = v;
  }
  return fm;
}

// ---- SKILL.md 校验 ----
for (const dir of SKILL_DIRS) {
  const skillRoot = join(ROOT, dir);
  const skillFile = join(skillRoot, 'SKILL.md');
  console.log(`\n[${dir}]`);
  if (!existsSync(skillFile)) {
    fail(`${dir}/SKILL.md 不存在`);
    continue;
  }
  const text = readFileSync(skillFile, 'utf8');
  const fm = parseFrontmatter(text);

  for (const field of ['name', 'description', 'version']) {
    if (!fm[field]) fail(`${dir}/SKILL.md 缺少 frontmatter 字段 '${field}'`);
  }
  if (!fm['agent_created']) {
    fail(`${dir}/SKILL.md 缺少 'agent_created: true'（否则 skill 管理工具无法修改/删除它）`);
  } else if (fm['agent_created'] !== 'true') {
    fail(`${dir}/SKILL.md 的 'agent_created' 必须为 true`);
  }
  if (fm.name && fm.name !== dir) {
    fail(`${dir}/SKILL.md 的 name '${fm.name}' 必须与目录名 '${dir}' 一致`);
  }
  if (fm.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) {
    fail(`${dir}/SKILL.md 的 name '${fm.name}' 必须是 kebab-case ASCII（如 skill-consolidator）`);
  }
  if (fm.description && fm.description.length < 40) {
    fail(`${dir}/SKILL.md 的 description 过短（<40 字符），难以被模型可靠触发`);
  }
  if (!fm.description?.includes('/') ) {
    // 不强制，仅提示：触发型 skill 建议在 description 中写明触发词
    ok('description 已存在（可考虑补充 /命令 触发词以提升命中率）');
  } else {
    ok('description 包含触发词');
  }
  if (!errors.some((e) => e.startsWith(`${dir}/SKILL.md 缺少 frontmatter`))) ok('SKILL.md frontmatter 校验通过');

  // 脚本存在性（skill 声明了 scripts/ 时）
  const scriptsDir = join(skillRoot, 'scripts');
  if (existsSync(scriptsDir)) {
    for (const f of readdirSync(scriptsDir)) {
      const p = join(scriptsDir, f);
      if (existsSync(p) && !readFileSync(p, 'utf8').trim().startsWith('#!')) {
        fail(`${dir}/scripts/${f} 缺少 shebang 行（#!/usr/bin/env node）`);
      }
    }
  }

  // _meta.json
  const metaFile = join(skillRoot, '_meta.json');
  if (!existsSync(metaFile)) {
    fail(`${dir}/_meta.json 不存在`);
  } else {
    try {
      const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
      for (const f of ['ownerId', 'slug', 'version', 'description']) {
        if (!meta[f]) fail(`${dir}/_meta.json 缺少字段 '${f}'`);
      }
      if (meta.slug && meta.slug !== dir) fail(`${dir}/_meta.json 的 slug '${meta.slug}' 必须与目录名一致`);
      ok('_meta.json 校验通过');
    } catch (e) {
      fail(`${dir}/_meta.json 不是合法 JSON: ${e.message}`);
    }
  }
}

// ---- package.json ----
const pkgFile = join(ROOT, 'package.json');
if (!existsSync(pkgFile)) {
  fail('package.json 不存在');
} else {
  try {
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'));
    if (!pkg.name || !pkg.version || !pkg.license) fail('package.json 缺少 name/version/license');
    ok('package.json 校验通过');
  } catch (e) {
    fail(`package.json 不是合法 JSON: ${e.message}`);
  }
}

// ---- 汇总 ----
console.log('');
if (errors.length) {
  console.error(`\u2717 校验失败，共 ${errors.length} 个问题:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\u2713 全部校验通过 (${SKILL_DIRS.join(', ')})`);
