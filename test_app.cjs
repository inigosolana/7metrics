const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const takeScreenshot = async (name) => {
        await page.screenshot({ path: name, fullPage: true });
        console.log(`Saved ${name}`);
    };

    try {
        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
        console.log('Port 3000 failed, trying 5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 60000 });
    }

    await takeScreenshot('landing_page_test.png');

    // Login
    console.log('Logging in...');
    try {
        const loginButton = await page.waitForSelector('text=Access Platform', { timeout: 10000 });
        await loginButton.click();
        await page.waitForTimeout(3000);
        await takeScreenshot('dashboard_test.png');
    } catch (e) {
        console.log('Failed to log in:', e.message);
    }

    const sections = [
        { name: 'Team Hub', file: 'team_hub_test.png' },
        { name: 'AI Auto-Stats', file: 'ai_stats_test.png' },
        { name: 'AI Processor', file: 'ai_processor_test.png' },
        { name: 'Clip Editor', file: 'clip_editor_test.png' },
        { name: 'AI Assistant', file: 'ai_assistant_test.png' },
        { name: '3D Tactical Board', file: 'tactical_board_test.png' }
    ];

    for (const section of sections) {
        console.log(`Clicking ${section.name}...`);
        try {
            // Try multiple ways to find the button
            const xpath = `//span[contains(text(), "${section.name}")]/ancestor::button | //button[contains(., "${section.name}")]`;
            const btn = await page.waitForSelector(xpath, { timeout: 10000 });
            await btn.click();
            await page.waitForTimeout(2000);
            await takeScreenshot(section.file);

            // If it's a modal (Tactical Board or AI Assistant), close it if needed, or just stay
            if (section.name === '3D Tactical Board' || section.name === 'AI Assistant') {
                // Look for a close button
                const closeBtn = await page.$('span:text("close")');
                if (closeBtn) await closeBtn.click();
                await page.waitForTimeout(1000);
            }
        } catch (e) {
            console.log(`Failed to click ${section.name}:`, e.message);
        }
    }

    await browser.close();
    console.log('Done!');
})();
