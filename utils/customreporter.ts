/**
 * CustomReporter
 *
 * A Playwright reporter that produces:
 *   - Terminal progress (started / finished / step level)
 *   - A readable HTML report at custom-report/index.html
 *   - Per-run report  at custom-report/report_<runId>.html
 *   - Failure artifacts (screenshots / videos / traces) under custom-report/
 *
 * It implements Playwright's Reporter interface only — no invented methods.
 */

import type {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
    TestStep
} from '@playwright/test/reporter';

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------

type TestStatus = 'passed' | 'failed' | 'timedOut' | 'skipped';

interface StepData {
    title: string;
    duration: number;
    status: 'passed' | 'failed';
    error?: string;
}

interface TestData {
    id: string;
    title: string;
    file: string;
    line: number;
    duration: number;
    status: TestStatus;
    retry: number;
    steps: StepData[];
    screenshots: string[];
    video?: string;
    trace?: string;
    error?: string;
    errorStack?: string;
}

interface RunStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
}

// ---------------------------------------------------------
// REPORTER
// ---------------------------------------------------------

export default class CustomReporter implements Reporter {

    private config!: FullConfig;

    private startTime = new Date();

    private endTime?: Date;

    private runId = '';

    private readonly tests: TestData[] = [];

    private readonly testSteps = new Map<string, StepData[]>();

    private readonly testOrder = new Map<string, number>();

    private readonly outputDirectory = 'custom-report';

    private readonly screenshotsDirectory = 'custom-report/screenshots';

    private readonly videosDirectory = 'custom-report/videos';

    private readonly tracesDirectory = 'custom-report/traces';

    /** Maps a test id to its index in `tests` so retries replace, not duplicate. */
    private readonly testIndex = new Map<string, number>();

    // -----------------------------------------------------
    // RUN LIFECYCLE
    // -----------------------------------------------------

    onBegin(config: FullConfig, suite: Suite): void {

        this.config = config;
        this.startTime = new Date();
        this.runId = this.generateRunId();

        this.createDirectories();

        suite.allTests().forEach((test, index) => {
            this.testOrder.set(test.id, index + 1);
        });

        this.log('');
        this.log('================================================');
        this.log('   AUTOMATIONEXERCISE - CUSTOM REPORTER');
        this.log('================================================');
        this.log(`Started     : ${this.startTime.toLocaleString()}`);
        this.log(`Total Tests : ${suite.allTests().length}`);
        this.log(`Environment : ${process.env.TEST_ENV || 'QA'}`);
        this.log('================================================');
    }

    onTestBegin(test: TestCase): void {
        this.testSteps.set(test.id, []);
        this.log(`>> STARTED: ${test.title}`);
    }

    onStepBegin(_test: TestCase, _result: TestResult, step: TestStep): void {
        if (step.category === 'test.step') {
            this.log(`   -> ${step.title}`);
        }
    }

    onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {

        if (step.category !== 'test.step') {
            return;
        }

        const steps = this.testSteps.get(test.id) ?? [];

        steps.push({
            title: step.title,
            duration: step.duration || 0,
            status: step.error ? 'failed' : 'passed',
            error: step.error?.message
        });

        this.testSteps.set(test.id, steps);

        this.log(
            `   ${step.error ? '[x]' : '[v]'} ${step.title} (${step.duration || 0}ms)`
        );
    }

    onTestEnd(test: TestCase, result: TestResult): void {

        const status = this.toStatus(result.status);
        const isFailure = status === 'failed' || status === 'timedOut';

        const testData: TestData = {
            id: test.id,
            title: test.title,
            file: path.basename(test.location.file),
            line: test.location.line,
            duration: result.duration,
            status,
            retry: result.retry,
            steps: this.testSteps.get(test.id) ?? [],
            screenshots: isFailure ? this.saveScreenshots(test, result) : [],
            video: isFailure ? this.saveVideo(test, result) : undefined,
            trace: isFailure ? this.saveTrace(test, result) : undefined,
            error: result.error?.message,
            errorStack: result.error?.stack
        };

        // A retried test fires onTestEnd again — replace its previous record
        // so the summary counts unique tests, not attempts.
        const existingIndex = this.testIndex.get(test.id);
        if (existingIndex === undefined) {
            this.testIndex.set(test.id, this.tests.length);
            this.tests.push(testData);
        } else {
            this.tests[existingIndex] = testData;
        }

        this.log('');
        this.log(
            `${this.statusIcon(status)} ${status.toUpperCase()} : ${test.title}`
        );
        this.log(`   Duration : ${this.formatDuration(result.duration)}`);
        this.log(`   Retry    : ${result.retry}`);

        if (result.error) {
            this.log(`   Error    : ${result.error.message}`);
        }

        this.log('------------------------------------------------');

        // Keep the report fresh even if the run is interrupted mid-way.
        this.writeReport();
    }

    async onEnd(_result: FullResult): Promise<void> {

        this.endTime = new Date();

        this.writeReport();

        const duration =
            this.endTime.getTime() - this.startTime.getTime();

        const stats = this.computeStats();

        const passRate = stats.total > 0
            ? ((stats.passed / stats.total) * 100).toFixed(2)
            : '0';

        this.log('');
        this.log('================================================');
        this.log('            TEST EXECUTION SUMMARY');
        this.log('================================================');
        this.log(`Total Tests : ${stats.total}`);
        this.log(`Passed      : ${stats.passed}`);
        this.log(`Failed      : ${stats.failed}`);
        this.log(`Skipped     : ${stats.skipped}`);
        this.log(`Pass Rate   : ${passRate}%`);
        this.log(`Duration    : ${this.formatDuration(duration)}`);
        this.log('================================================');
        this.log(`Custom report : ${this.outputDirectory}/index.html`);
        this.log('================================================');
    }

    // -----------------------------------------------------
    // REPORT WRITING
    // -----------------------------------------------------

    private writeReport(): void {

        const html = this.generateHtml();

        fs.writeFileSync(
            path.join(this.outputDirectory, `report_${this.runId}.html`),
            html,
            'utf-8'
        );

        fs.writeFileSync(
            path.join(this.outputDirectory, 'index.html'),
            html,
            'utf-8'
        );
    }

    // -----------------------------------------------------
    // ARTIFACTS
    // -----------------------------------------------------

    private createDirectories(): void {

        // Start each run clean so stale artifacts do not pile up.
        for (const directory of [
            this.screenshotsDirectory,
            this.videosDirectory,
            this.tracesDirectory
        ]) {
            fs.rmSync(directory, { recursive: true, force: true });
            fs.mkdirSync(directory, { recursive: true });
        }

        fs.mkdirSync(this.outputDirectory, { recursive: true });

        const logFile = path.resolve('logs', 'combined.log');
        if (fs.existsSync(logFile)) {
            fs.writeFileSync(logFile, '', 'utf-8');
        }
    }

    private saveScreenshots(test: TestCase, result: TestResult): string[] {

        const saved: string[] = [];

        for (const attachment of result.attachments) {

            if (attachment.contentType !== 'image/png') {
                continue;
            }

            const fileName = `${this.safeFileName(test.title)}_${Date.now()}.png`;
            const destination = path.join(this.screenshotsDirectory, fileName);

            try {
                if (attachment.path) {
                    fs.copyFileSync(attachment.path, destination);
                } else if (attachment.body) {
                    fs.writeFileSync(destination, attachment.body);
                } else {
                    continue;
                }

                saved.push(`screenshots/${fileName}`);
            } catch (error) {
                this.log(`Unable to save screenshot: ${String(error)}`);
            }
        }

        return saved;
    }

    private saveVideo(test: TestCase, result: TestResult): string | undefined {

        const attachment = result.attachments.find(
            item => item.contentType === 'video/webm'
        );

        return this.copyArtifact(attachment, test, 'webm', 'videos');
    }

    private saveTrace(test: TestCase, result: TestResult): string | undefined {

        const attachment = result.attachments.find(
            item => item.name === 'trace' && !!item.path
        );

        return this.copyArtifact(attachment, test, 'zip', 'traces');
    }

    private copyArtifact(
        attachment: TestResult['attachments'][number] | undefined,
        test: TestCase,
        extension: string,
        folder: string
    ): string | undefined {

        if (!attachment?.path) {
            return undefined;
        }

        const fileName =
            `${this.safeFileName(test.title)}_${Date.now()}.${extension}`;
        const destination = path.join(this.outputDirectory, folder, fileName);

        try {
            fs.copyFileSync(attachment.path, destination);
            return `${folder}/${fileName}`;
        } catch (error) {
            this.log(`Unable to save ${folder} artifact: ${String(error)}`);
            return undefined;
        }
    }

    // -----------------------------------------------------
    // HTML
    // -----------------------------------------------------

    private generateHtml(): string {

        const totalDuration = (
            (this.endTime ?? new Date()).getTime() - this.startTime.getTime()
        );

        const stats = this.computeStats();

        const passRate = stats.total > 0
            ? ((stats.passed / stats.total) * 100).toFixed(2)
            : '0';

        const rows = [...this.tests]
            .sort(
                (a, b) =>
                    (this.testOrder.get(a.id) ?? 0) - (this.testOrder.get(b.id) ?? 0)
            )
            .map(test => this.generateRow(test))
            .join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AutomationExercise - Custom Report</title>
<style>${this.styles()}</style>
</head>
<body>
<div class="header">
    <h1>AutomationExercise</h1>
    <p>Playwright UI Automation - Custom Report</p>
</div>
<div class="container">
    <div class="dashboard">
        <div class="card"><div class="number">${stats.total}</div><div class="label">Total</div></div>
        <div class="card passed"><div class="number">${stats.passed}</div><div class="label">Passed</div></div>
        <div class="card failed"><div class="number">${stats.failed}</div><div class="label">Failed</div></div>
        <div class="card skipped"><div class="number">${stats.skipped}</div><div class="label">Skipped</div></div>
        <div class="card"><div class="number">${passRate}%</div><div class="label">Pass Rate</div></div>
        <div class="card"><div class="number">${this.formatDuration(totalDuration)}</div><div class="label">Duration</div></div>
    </div>
    <div class="metadata">
        <div><strong>Environment</strong><span>${this.escape(process.env.TEST_ENV || 'QA')}</span></div>
        <div><strong>Browser</strong><span>${this.escape(this.config?.projects?.[0]?.name || 'chromium')}</span></div>
        <div><strong>Run ID</strong><span>${this.runId}</span></div>
        <div><strong>Started</strong><span>${this.startTime.toLocaleString()}</span></div>
    </div>
    <div class="filters">
        <button onclick="filterRows('all')">All</button>
        <button onclick="filterRows('passed')">Passed</button>
        <button onclick="filterRows('failed')">Failed</button>
        <button onclick="filterRows('skipped')">Skipped</button>
    </div>
    <table>
        <thead>
            <tr>
                <th>#</th><th>Test Name</th><th>File</th>
                <th>Duration</th><th>Retry</th><th>Status</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
</div>
<script>
function toggleRow(id) {
    var el = document.getElementById(id);
    if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
}
function filterRows(status) {
    var rows = document.querySelectorAll('.test-row');
    rows.forEach(function (row) {
        row.style.display = (status === 'all' || row.classList.contains(status)) ? '' : 'none';
    });
}
</script>
</body>
</html>`;
    }

    private generateRow(test: TestData): string {

        const statusClass =
            test.status === 'passed' ? 'passed'
                : test.status === 'skipped' ? 'skipped'
                    : 'failed';

        const sections: string[] = [];

        if (test.error) {
            sections.push(
                `<h4>Error</h4><pre class="error">${this.escape(test.error)}\n${this.escape(test.errorStack || '')}</pre>`
            );
        }

        if (test.steps.length > 0) {
            sections.push(
                `<h4>Steps</h4><ul>${test.steps.map(step => `
                    <li class="${step.status}">
                        ${step.status === 'passed' ? '✓' : '✗'} ${this.escape(step.title)}
                        <em>(${this.formatDuration(step.duration)})</em>
                        ${step.error ? `<br><span class="error">${this.escape(step.error)}</span>` : ''}
                    </li>`).join('')}</ul>`
            );
        }

        const attachments: string[] = [];

        if (test.screenshots.length > 0) {
            attachments.push(
                `<strong>📷 Screenshots:</strong> ${test.screenshots
                    .map(s => `<a href="${s}" target="_blank">view</a>`)
                    .join(' ')}`
            );
        }

        if (test.video) {
            attachments.push(`<strong>🎥 Video:</strong> <a href="${test.video}" target="_blank">view</a>`);
        }

        if (test.trace) {
            attachments.push(`<strong>🔍 Trace:</strong> <a href="${test.trace}" target="_blank">open</a>`);
        }

        if (attachments.length > 0) {
            sections.push(`<div class="attachments">${attachments.join('<br>')}</div>`);
        }

        const index = this.testOrder.get(test.id) ?? '';

        return `
<tr class="test-row ${statusClass}">
    <td>${index}</td>
    <td>
        <button class="test-name" onclick="toggleRow('${test.id}')">${this.escape(test.title)}</button>
        <div id="${test.id}" class="details" style="display:none;">${sections.join('')}</div>
    </td>
    <td>${this.escape(test.file)}:${test.line}</td>
    <td>${this.formatDuration(test.duration)}</td>
    <td>${test.retry}</td>
    <td><span class="status ${statusClass}">${test.status.toUpperCase()}</span></td>
</tr>`;
    }

    private styles(): string {
        return `
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, sans-serif; background: #f5f7fa; color: #333; }
.header { background: #1f2937; color: #fff; text-align: center; padding: 28px; }
.container { max-width: 1400px; margin: auto; padding: 28px; }
.dashboard { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-bottom: 22px; }
.card { background: #fff; padding: 18px; text-align: center; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.card.passed { border-top: 4px solid #16a34a; }
.card.failed { border-top: 4px solid #dc2626; }
.card.skipped { border-top: 4px solid #f59e0b; }
.number { font-size: 26px; font-weight: bold; }
.label { margin-top: 6px; color: #666; }
.metadata { background: #fff; padding: 18px; display: flex; gap: 28px; flex-wrap: wrap; margin-bottom: 18px; border-radius: 8px; }
.metadata div { display: flex; flex-direction: column; gap: 4px; }
.filters button { padding: 8px 14px; margin-right: 8px; border: none; border-radius: 5px; cursor: pointer; background: #374151; color: #fff; }
table { width: 100%; border-collapse: collapse; background: #fff; }
th, td { padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; }
th { background: #111827; color: #fff; }
.test-row.passed { border-left: 4px solid #16a34a; }
.test-row.failed { border-left: 4px solid #dc2626; }
.test-row.skipped { border-left: 4px solid #f59e0b; }
.test-name { background: none; border: none; cursor: pointer; font-weight: bold; color: #2563eb; text-align: left; }
.status { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
.status.passed { background: #dcfce7; color: #166534; }
.status.failed { background: #fee2e2; color: #991b1b; }
.status.skipped { background: #fef3c7; color: #92400e; }
.details { margin-top: 12px; padding: 16px; background: #f9fafb; border-radius: 8px; }
.details li.passed { color: #166534; }
.details li.failed { color: #991b1b; }
pre { background: #111827; color: #e5e7eb; padding: 14px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; }
.error { color: #dc2626; font-family: monospace; }
.attachments { margin-top: 12px; }
.attachments a { color: #2563eb; margin-right: 10px; }
@media (max-width: 900px) { .dashboard { grid-template-columns: repeat(2, 1fr); } }`;
    }

    // -----------------------------------------------------
    // HELPERS
    // -----------------------------------------------------

    private computeStats(): RunStats {

        const stats: RunStats = { total: 0, passed: 0, failed: 0, skipped: 0 };

        for (const test of this.tests) {
            stats.total++;
            if (test.status === 'passed') {
                stats.passed++;
            } else if (test.status === 'skipped') {
                stats.skipped++;
            } else {
                stats.failed++;
            }
        }

        return stats;
    }

    private toStatus(status: TestResult['status']): TestStatus {
        if (status === 'passed' || status === 'timedOut' || status === 'skipped') {
            return status;
        }
        return 'failed';
    }

    private generateRunId(): string {
        const now = new Date();
        return (
            `${now.getFullYear()}` +
            `${String(now.getMonth() + 1).padStart(2, '0')}` +
            `${String(now.getDate()).padStart(2, '0')}_` +
            `${String(now.getHours()).padStart(2, '0')}` +
            `${String(now.getMinutes()).padStart(2, '0')}` +
            `${String(now.getSeconds()).padStart(2, '0')}`
        );
    }

    private safeFileName(name: string): string {
        return name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 100);
    }

    private formatDuration(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;
        return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
    }

    private statusIcon(status: TestStatus): string {
        switch (status) {
            case 'passed': return '[PASS]';
            case 'skipped': return '[SKIP]';
            default: return '[FAIL]';
        }
    }

    private escape(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    private log(message: string): void {
        // console.log is captured by Playwright and shown in the terminal.
        console.log(message);
    }
}
