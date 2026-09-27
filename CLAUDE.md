# CLAUDE.md

## 技能触发约定

- 用户说"拷问我""盘问我""追问我""把我的想法问透""压力测试我的方案""挑刺""grill 我""grill me"，或想让方案、决策、想法经受反复追问时，使用 `grilling` 技能。`grill-me` 只是 `/grill-me` 命令的入口，最终同样调用 `grilling`。
- 用户要发布到抖音的文案、口播稿需要检查违规、限流风险时，使用 `laohan-weigui` 技能。
- `.claude/skills/` 下的技能由 `npx skills add` 安装并记录在 `skills-lock.json`，不要手改其中文件，更新用 `npx skills update`。
