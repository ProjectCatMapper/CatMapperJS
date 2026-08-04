# CatMapper Excel Translation Add-in

## Prerequisites

- A current Node.js/npm installation supported by this project and dependencies installed with `npm install`.
- Excel for Windows, Excel for Mac, or Excel on the web with support for ExcelApi 1.7.
- Permission to sideload an Office add-in, or a Microsoft 365 administrator who can deploy it internally.

## Local development

Run the HTTPS development server:

```powershell
npm run addin:dev
```

Then sideload `manifest.dev.xml`. It points Excel to `https://localhost:3001/excel-addin.html`.

The development server uses a locally generated basic-ssl certificate. Visit `https://localhost:3001/excel-addin.html` in a browser first and trust or accept the certificate if your organization permits it. Excel may refuse to load the task pane while the certificate is untrusted. Trust development certificates only on your own machine and follow organizational security policy.

## Sideloading

- **Windows:** In Excel's Add-ins interface, upload or register `manifest.dev.xml` as a custom add-in. If direct upload is unavailable, use an approved shared-folder catalog.
- **Mac:** Use Excel's custom add-in upload option when available, or place the development manifest in Excel's documented local `wef` sideload folder, then restart Excel.
- **Excel on the web:** Open the Add-ins interface, choose **My Add-ins**, and upload `manifest.dev.xml` as a custom add-in.

Menu names vary by Microsoft 365 release and organizational policy. Keep the development server running while testing, open a workbook, and choose **Home > CatMapper > Translate Selection**.

## Validation and production deployment

Validate both manifests before deployment:

```powershell
npm run addin:validate
```

Create the production bundle with `npm run build`, then deploy the generated site so the task pane is available at `https://catmapper.org/excel-addin.html` and its assets remain available over HTTPS. The production `manifest.xml` already targets that URL.

For internal distribution, a Microsoft 365 administrator can deploy `manifest.xml` through the admin center to selected users or groups. Confirm the production URL and icons are reachable before assigning the add-in.

## Privacy and security

Selected worksheet values are sent over HTTPS to the public CatMapper translation API. The add-in stores translation mappings and alternatives in the workbook but does not store API keys, passwords, or other credentials. Do not translate sensitive data unless sending it to the public CatMapper service is permitted by your organization.
