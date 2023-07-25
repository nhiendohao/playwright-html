<div align="center">

![](/assets/logo.png "playwright-html-report")

<br>

![Playwright](https://img.shields.io/badge/-playwright-%232ead33?style=for-the-badge&logo=playwright&logoColor=d65348) ![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) <br> ![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white) ![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

<br>
<a href="https://paypal.me/rodrigoodhin"><img src="https://img.shields.io/badge/donate-PayPal-blue"></a>
<br><br>
</div>


# Playwright HTML

Generates a complete HTML report for your playwright test runs.

## Install

```sh
npm i -D playwright-html
```

## Usage

Add reporter to your `playwright.config.ts` configuration file

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [
    ['playwright-html', { 
      testFolder: 'tests', // Default: "tests"
      title: 'Playwright HTML Report', // Default: "Playwright HTML Report"
      project: 'QA Tests', // Default: ""
      release: '9.87.6', // Default: ""
      testEnvironment: 'DEV', // Default: ""
      embedAssets: true, // Default: true
      embedAttachments: true, // Default: true
      outputFolder: 'playwright-html-report', // Default: "playwright-html-report"
      minifyAssets: true, // Default: true
      startServer: true, // Default: true
    }]
  ],
}
``` 


### Execution

Then run your tests with `npx playwright test` command and you'll see the result in console:

```sh
-------------------------------------
 
⏺  Starting the run with 22 tests
 
✅ Chromium | Simple test 10
✅ Chromium | More simple test
⛔ Chromium | Wrong image validation
✅ Chromium | Open playwright website many times
✅ Chromium | Simple test 2
✅ Chromium | Simple test
✅ Firefox | More simple test
✅ Firefox | Simple test 10
⛔ Firefox | Wrong image validation
✅ Firefox | Open playwright website many times
✅ Firefox | Simple test 4
✅ Firefox | Simple test
⛔ Firefox | Wrong text validation 
⛔ Webkit | More simple test
⛔ Webkit | Wrong image validation
⛔ Webkit | Open playwright website many times
🚫 Webkit | Wrong text validation 
⛔ Webkit | Simple test 10
⛔ Webkit | Simple test 3
🚫 Webkit | Simple test 7
🚫 Webkit | Simple test 6
🚫 Webkit | Simple test 4
 
-------------------------------------
 
Serving HTML report at http://localhost:8001. Press Ctrl+C to quit.

```
*The port number may change*

Open the URL in the browser to see the HTML report


## Dasboard
![](/assets/dashboard.png)

## Test List
![](/assets/test_list.png)

## Test Details
![](/assets/test_details.png)

## License

playwright-html is [MIT licensed](./LICENSE).
