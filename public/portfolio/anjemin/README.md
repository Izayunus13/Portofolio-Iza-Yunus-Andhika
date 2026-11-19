# ANJEMIN: 75-slide live-site walkthrough

Source: https://anjemin.vercel.app/

The gallery now uses 75 current browser captures: 24 public-site screenshots and 51 authenticated account screenshots (27 Customer, 12 Penganjem, 12 Pengelola). No earlier supplied PNGs remain in the gallery. Those original assets are retained on disk.

Order: public introduction and onboarding; Customer service booking, maps, three-stage Jasa Titip, order lifecycle, marketplace, chat, referrals and account settings; driver operations, history, wallet, achievements and seller history; management verification, commission reconciliation, filtered statistics, users and report review; public disclosures, theme, navigation and mobile layouts.

Authenticated screenshots use user-authorized demo logins. Credentials and cookies were never written to project files or persisted as browser storage state. The browser helper accepts login data only through hidden stdin. All three browser contexts are closed after capture.

Read-only workflow: the capture session allowed normal authentication and GET requests. It blocked other API mutations. No message, OTP, booking, payment, document upload, availability change, approval, account edit, reward claim, withdrawal, report resolution, or account restriction was submitted. Shopping form values are explicitly labelled examples and were not submitted.

Private profile contacts, user-table identifiers and contacts, driver contact/vehicle details, and private report information are masked in screenshots. Masked field values are omitted from capture notes. Identity-document images were not opened or copied.

The current catalogue describes publication fees and direct chat/COD settlement. Existing marketplace history also contains earlier website-payment records and their older commission splits. Captions distinguish those histories from the current stated flow. Reporting screenshots identify the selected older-data dataset rather than claiming current live revenue. Payment and reward availability match the captured interface.

Images are original browser PNG captures encoded as lossless WebP. No UI or content was reconstructed. Desktop uses a 1600px viewport at 1.5x pixel density; account mobile layouts use 390px at 1.5x; public mobile captures use 390px at 2x. Focused controls and tall forms are captured separately for readable detail. Gallery images open at full resolution.

Public capture utility: scripts/capture-anjemin-public.mjs. Authenticated browser utility: scripts/anjemin-browser.mjs (interactive JSON over hidden stdin; provide credentials only for the current session). Public and authenticated capture-notes.json files record source, role, viewport, capture time, and redaction metadata without credentials.
