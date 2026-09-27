# Workflow Preferences
- Wants the agent to take full end-to-end ownership: inspect the project, create/edit files, write the implementation, run the tests, fix TypeScript/locator/framework errors, and verify the result — not just produce an example or a plan. Confidence: 0.9
- When something is wrong or failing, expects the agent to fix it rather than merely report it ("If something is wrong, FIX IT"). Confidence: 0.9
- Before modifying anything, expects a thorough inspection of the existing project (config, package.json, tests, pages, utils, fixtures, reporters) and then design around what already exists. Confidence: 0.85
- Prefers reusing/adapting existing files and utilities over creating new ones; if a file needs improvement, modify it in place rather than creating a duplicate file with another name. Confidence: 0.85
- Strongly wants to avoid writing implementation code manually; only involve the user for a genuinely unavoidable decision that only they can make. Confidence: 0.85
- Values a "do not stop early" completion bar — wants the whole deliverable finished and verified, not a partial scaffold. Confidence: 0.85
