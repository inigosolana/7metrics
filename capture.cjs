const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

        console.log('Taking screenshot of Landing Page...');
        await page.screenshot({ path: 'landing_page.png', fullPage: true });

        console.log('Attempting to enter the platform...');
        // Try different selectors for the enter button
        const enterButtons = [
            'text="Acceder"',
            'text="Entrar"',
            'text="Access Platform"',
            'button'
        ];

        let clicked = false;
        for (const selector of enterButtons) {
            if (await page.isVisible(selector)) {
                console.log(`Clicking ${selector}...`);
                await page.click(selector);
                clicked = true;
                break;
            }
        }

        if (clicked) {
            await page.waitForTimeout(2000);
            console.log('Taking screenshot of Dashboard...');
            await page.screenshot({ path: 'dashboard.png', fullPage: true });

            // Navigate to Manual Stats
            console.log('Navigating to Manual Stats...');
            await page.click('text="Manual Tagging"'); // Based on my App.tsx logic
            await page.waitForTimeout(1000);

            console.log('Clicking GOAL button...');
            await page.click('text="GOAL"');
            await page.waitForTimeout(1000);

            console.log('Taking screenshot of Tactical Wizard...');
            await page.screenshot({ path: 'tactical_wizard.png' });
        } else {
            console.log('Could not find entry button.');
        }

    } catch (err) {
        console.error('Error during capture:', err);
    } finally {
        await browser.close();
    }
})();
