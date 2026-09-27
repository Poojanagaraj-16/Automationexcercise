# Coding Style Preferences

- Uses try/catch deliberately at framework boundaries (major page operations, reusable utilities, setup/cleanup) — logs useful context and rethrows; never swallows errors, and does not wrap every Playwright action in try/catch. Confidence: 0.85
- Does not want every Playwright method blindly wrapped in a helper; keeps the underlying Playwright behavior accessible for special operations. Confidence: 0.8
- Prefers strong typing where practical, no unnecessary `any`, no duplicated locators/actions/utilities, no dead code, no unused imports, and meaningful class/method/test names. Confidence: 0.85
- Never logs or hardcodes secrets (passwords, tokens) in source. Confidence: 0.8
- Favors a clean, focused design with additional abstraction only when it provides a real benefit ("do not create unnecessary abstraction"). Confidence: 0.8
- Values a reusable UI action wrapper utility for common interactions, kept maintainable rather than exhaustive. Confidence: 0.75
- Wants explanatory comments added where they clarify non-obvious code (e.g. why a shared constant exists, what a helper does) — but not redundant comments restating self-documenting code. Confidence: 0.7
