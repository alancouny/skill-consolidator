# 吸星大法（Skill Consolidator）

> 一个用于整理、合并、优化本地 WorkBuddy / Trae / Cursor / Claude Code / Windsurf / Cline / Continue / Roo Code / Copilot / Codex 等 AI Agent skills / rules / commands 的元 skill。

## 为什么需要它？

随着 Agent 使用的深入，本地会安装越来越多的 skill：科研、写作、编程、调试、浏览器自动化、文档处理……

同一类型的 skill 越多，越容易出现：

- **同名冲突**：不同来源的 skill 取了相同的名字。
- **功能重叠**：多个 skill 都声称能处理"科研"或"写作"。
- **触发词冲突**：多个 skill 监听相同的用户指令，导致模型选错 skill。
- **命中率下降**：模型不知道到底该调用哪一个 skill。

**吸星大法**像《天龙八部》里的武功一样，把所有散落的 skills 吸纳进来，去芜存菁，再融会贯通，最终形成一份清晰的技能目录与整理方案。

## 核心功能

- **确定性扫描器**（`skill-consolidator/scripts/scan_skills.mjs`）：一键扫描各 Agent 的 skills 目录，解析 frontmatter，检测同名冲突、功能重叠、触发词冲突、版本差异，按类别归档，生成 Markdown 报告（或 JSON）。
- 扫描范围可扩展：扫描目标表集中在脚本的 `TARGETS` 常量中，改脚本即可，无需改 SKILL.md。
- 整理前默认只读：只生成报告，不删除、不修改任何已有 skill，执行需用户确认。

## 安装

### 方式一：复制（最简单）

把 `skill-consolidator/` 整个目录复制到对应 Agent 的 skills 目录（务必复制整个目录，包含 `scripts/`）：

```bash
# Cursor / Claude Code / Trae / WorkBuddy（用户级）
cp -r skill-consolidator ~/.cursor/skills/
cp -r skill-consolidator ~/.claude/skills/
cp -r skill-consolidator ~/.trae-cn/skills/
cp -r skill-consolidator ~/.workbuddy/skills/

# 项目级（示例：Cursor）
cp -r skill-consolidator .cursor/skills/

# Windsurf（rules 布局只支持单文件，脚本不可用）
mkdir -p ~/.windsurf/rules/skill-consolidator
cp skill-consolidator/SKILL.md ~/.windsurf/rules/skill-consolidator/skill-consolidator.md
```

### 方式二：npm（可选）

```bash
npm install -g skill-consolidator
# 安装到各 Agent 目录（手动执行，无自动副作用）
npm run install:skills            # 默认: workbuddy, claude, cursor, trae
npm run install:skills -- --agents claude,cursor
npm run install:skills -- --project   # 安装到当前项目
```

### 方式三：skills.sh / ClawHub

```bash
npx skills add alancouny/skill-consolidator --skill skill-consolidator
clawhub skill publish ./skill-consolidator
```

安装完成后重启 Agent / IDE 生效。

## 使用方法

### 手动触发

```
/吸星大法    或    /skill-consolidator
```

也可以直接说："帮我整理一下 skill"、"skills 太多了"、"organize my skills" 等。

### 自动触发

当 Agent 准备安装或推荐新 skill 时，应先调用本 skill 评估是否与现有 skill 冲突。`description` 已包含明确的触发条件，以提升被模型选中的概率。

## 目录结构

```
.
├── skill-consolidator/          # 唯一 skill 包（单一事实来源）
│   ├── SKILL.md                 # 双语 skill 定义（中文为主）
│   ├── _meta.json               # ClawHub 元数据
│   └── scripts/
│       ├── scan_skills.mjs      # 扫描器：扫描/解析/检测/分类/生成报告
│       └── install_skills.mjs   # 安装器（手动执行，复制整个包到各 Agent）
├── scripts/
│   └── validate.mjs             # 仓库校验（CI / npm run validate 共用）
├── package.json                 # npm 发布配置（无自动安装副作用）
├── .github/workflows/validate-skill.yml  # CI 校验
├── README.md / README_EN.md / LICENSE
```

## 开发

```bash
npm run validate                 # 校验 SKILL.md / _meta.json / package.json
node skill-consolidator/scripts/scan_skills.mjs --no-write   # 试运行扫描器（不写文件）
```

## 注意事项

- 在获得明确确认前，吸星大法**不会删除或修改**任何已有 skill。
- 内置 skills（如 `~/.workbuddy/plugins/cache/`、`~/.cursor/plugins/cache/`）仅作只读参考。
- 扫描结果会按工具来源分别列出，避免不同 Agent 的同名文件被误判为冲突。

## 许可证

[MIT](LICENSE)
