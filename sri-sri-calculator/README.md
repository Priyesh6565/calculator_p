# SRI SRI Calculator

A mobile-friendly calculator built with plain HTML, CSS and JavaScript. No backend, account or database is used.

## Run it locally
1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. Edit the material rates, moisture, percentages, processing cost and rates. Results update as you type.

For best mobile/offline behavior, host the files on a static HTTPS host such as GitHub Pages and open the URL on your phone. You can add the page to your phone's home screen from the browser menu.

## Workbook formulas preserved
For each material:
- Final material = `1000 - moisture`
- Final material rate = `rate / final material`
- Tone rate = `final material rate * 1000`
- Final contribution = `tone rate * material percentage / 100`

Totals:
- Total final rate = material contributions + processing cost + Excel J10 adjustment (default 0)
- Profit = party rate - our rate (Excel L9 formula)

## Values loaded from the workbook
- cron: rate 5300, moisture 100, material % 0
- CUTTY: rate 3200, moisture 200, material % 30
- SHOWDUST: rate 5100, moisture 150, material % 70
- Processing cost: 1000
- Excel J10 adjustment: 0
- Party rate: 7900
- Our rate: 6400

## Important formula ambiguity
The workbook's profit formula is `L9 = L7 - L8` (party rate minus our rate). It does not use Total Final Rate (`J11`). This implementation preserves the workbook formula exactly. Confirm whether that is intended before using it for business decisions.

The workbook's percentage values for the three materials total 100%. This app preserves the individual percentages but does not force them to total 100%, so you can edit them; verify their sum when entering new values.

## Privacy and storage
The app does not send inputs anywhere or save calculation records. Browser inputs are transient; refresh/reset returns to the workbook's default values.
