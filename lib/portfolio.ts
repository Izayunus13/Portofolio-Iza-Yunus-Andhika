export type CategoryId = 'programming' | 'design' | 'videography';
export type PortfolioSlide = {
  title: string;
  label: string;
  highlights?: { title: string; description: string }[];
  description: string;
  emphasizedText?: string;
  tags: string[];
  media: string | null;
  mediaType?: 'image' | 'video' | 'youtube';
  poster?: string;
  videoDimensions?: {width:number;height:number};
  excerpt?: {start:number;end:number};
  imageLabel?: string;
  linkLabel?: string;
  url: string | null;
};
export type Project = {
  id: string;
  name: string;
  status?: string;
  slides: [PortfolioSlide, ...PortfolioSlide[]];
};
export type Category = {
  id: CategoryId;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  port: string;
  projects: [Project, ...Project[]];
};

// Each island has its own portfolios. Each portfolio has independent media slides.
// Tabs select a portfolio; arrows and swipes select slides inside that portfolio.
// Replace the concept entries below with your own work.
// Media: place files in public/portfolio/, then use '/portfolio/your-file.jpg'.
// Video: set mediaType to 'video'. Link: replace url: null with a full https:// URL.
// Keep null values until your media and links are ready; the page handles them gracefully.
export const categories: Category[] = [
  {
    id: 'programming', number: '01', title: 'Built with curiosity.', subtitle: 'Software Engineering', port: 'Bytehaven',
    description: 'Turning complex business requirements into intuitive, reliable web applications. I work with responsive interfaces, structured databases, and maintainable code to simplify workflows and build software that can grow.',
    projects: [
      {
        "id": "programming-a",
        "name": "Portfolio A",
        "status": "ANJEMIN / Live walkthrough across three account roles",
        "slides": [
          {
            "title": "ANJEMIN, made for campus life.",
            "label": "Live website / Overview & account roles",
            "description": "ANJEMIN brings rides, parcel delivery, personal shopping, and a student marketplace into one campus-focused web experience for Tembalang. Its purple visual identity introduces the services before normal account access leads into separate Customer, Penganjem, and Pengelola workspaces. This walkthrough follows the current public website and all three authorized demo accounts, documenting discovery, registration, booking, marketplace activity, driver operations, and management. The site identifies the product as still in development, and payment or reward availability is explained according to the state visible in each screen.",
            "tags": [
              "Campus service platform",
              "Three account roles",
              "Four service areas"
            ],
            "media": "/portfolio/anjemin/live/01-home-overview.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/",
            "highlights": [
              {
                "title": "Customer",
                "description": "Chooses services, uses maps, reviews a three-stage shopping request, follows orders, accesses marketplace buying and selling, manages referrals, and edits account information."
              },
              {
                "title": "Penganjem (Driver)",
                "description": "Works through approved-driver access and Ready availability, reviews eligible requests and history, checks balance and reward conditions, and can also use the marketplace."
              },
              {
                "title": "Pengelola (Manager)",
                "description": "Reviews driver records, filters user data, distinguishes recorded commission from received funds, analyzes reporting datasets, and follows up restricted transaction and driver reports."
              }
            ]
          },
          {
            "title": "Four needs. One place to start.",
            "label": "Live website / Service discovery",
            "description": "The Layanan section separates four everyday needs into service cards: ANJEMIN for transport, ANJEMIN Barang for deliveries, Jasa Titip for shopping requests, and Marketplace for student goods. Each card pairs an icon with a concise explanation so a visitor can choose a task before seeing booking details. Transport, delivery, and shopping lead into service-oriented workflows, while buying and selling goods has its own marketplace journey. This makes the scope of the platform understandable before the visitor needs to learn its account and transaction structure.",
            "tags": [
              "Rides & deliveries",
              "Personal shopping",
              "Student marketplace"
            ],
            "media": "/portfolio/anjemin/live/02-service-discovery.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Invite a friend, understand the reward.",
            "label": "Live website / Referral offer",
            "description": "The public referral section introduces a code-sharing promotion with conditions rather than an immediate cash reward. At capture time, it advertises a Rp500 voucher for a new user and a Rp300 voucher for the inviter after the required transaction conditions are met. The action leads toward account access so the code can be associated with a user. The page also states that promotions may change. These figures describe the captured offer; eligibility and subsequent transaction activity determine whether a voucher is actually granted.",
            "tags": [
              "Referral codes",
              "Conditional vouchers",
              "Captured promotion terms"
            ],
            "media": "/portfolio/anjemin/live/03-referral-offer.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A campus idea with a clear development stage.",
            "label": "Live website / About the platform",
            "description": "The About section connects ANJEMIN to student routines: getting to campus, moving belongings, buying food, and finding useful goods. It describes passenger and verified-driver spaces alongside a marketplace with direct negotiation. The same section states that service availability and commercial fares depend on operational verification. This context distinguishes a working software showcase from a fully launched commercial transport operation. The portfolio keeps that development-stage statement visible while explaining the interfaces and workflows already represented in the project.",
            "tags": [
              "Student community",
              "Verified-driver concept",
              "Development-stage product"
            ],
            "media": "/portfolio/anjemin/live/04-about-development-status.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "An account entry that stays familiar.",
            "label": "Live website / Sign in",
            "description": "The login dialog accepts an email address or username followed by the account password. Masuk and Daftar akun tabs let returning and new users share one entry point, while an optional Ingat saya setting explains a 30-day signed-in period on the device. Normal sign-in then leads into the workspace appropriate to the account role. The Customer, Penganjem, and Pengelola chapters in this walkthrough were captured after signing in with the authorized demo accounts. The public login image itself keeps all credential fields empty.",
            "tags": [
              "Email or username",
              "Remember this device",
              "Login & registration tabs"
            ],
            "media": "/portfolio/anjemin/live/06-login.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Start with the person behind the account.",
            "label": "Live website / Customer registration",
            "description": "Customer registration begins with a role selector and a three-part progress guide: enter details, verify the phone number, and create the account. The form requests a full name, username, email, and active Indonesian phone number before password confirmation and consent. Selecting Penganjem reveals additional driver requirements rather than merely renaming the submit action. This screenshot documents the initial Customer onboarding form. No registration was submitted, so the capture does not imply that an account was created or that phone verification succeeded.",
            "tags": [
              "Customer onboarding",
              "Identity fields",
              "Three-stage registration"
            ],
            "media": "/portfolio/anjemin/live/07-customer-registration.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Phone verification has its own visible state.",
            "label": "Live website / OTP verification panel",
            "description": "The verification panel explains SMS delivery, displays Belum dikirim before a request, and provides Kirim kode OTP. Supporting text asks for an active number that can receive SMS and identifies verification as a prerequisite for continuing signup. A separate reminder says the code must never be shared, including with someone claiming to represent ANJEMIN. This focused screenshot makes the status and instructions readable without the rest of the form. It shows the initial state only; no SMS was requested and no successful verification state was fabricated.",
            "tags": [
              "Phone verification",
              "Visible OTP status",
              "Registration prerequisite"
            ],
            "media": "/portfolio/anjemin/live/08-phone-verification.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Finish the form with deliberate confirmation.",
            "label": "Live website / Password, referral & consent",
            "description": "The lower Customer form requires a password of at least ten characters and a second entry to catch typing mistakes. An optional referral field attaches an invitation code during signup. A required consent checkbox links to the privacy information and terms of use, and the create-account action follows those conditions. Capturing this area separately preserves details that would otherwise fall below the identity and OTP sections. The disabled initial action also makes clear that opening the form alone does not complete registration.",
            "tags": [
              "Password confirmation",
              "Optional referral",
              "Required consent"
            ],
            "media": "/portfolio/anjemin/live/09-password-and-consent.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A driver application begins with a role choice.",
            "label": "Live website / Penganjem registration",
            "description": "Selecting Penganjem retains the common identity, phone-verification, and password fields while adding driver-specific requirements farther down the form. The distinction is visible before submission, helping applicants understand that fulfilling requests carries different responsibilities from booking them. The next two screenshots isolate the conduct commitment and supporting documents. The public terms state that a Penganjem needs management approval before accepting orders, so registration represents an application step rather than immediate access to available jobs. No personal documents were uploaded during this capture.",
            "tags": [
              "Driver application",
              "Role-dependent form",
              "Approval before orders"
            ],
            "media": "/portfolio/anjemin/live/10-driver-registration.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Make the driver commitment explicit.",
            "label": "Live website / Penganjem rules",
            "description": "The driver commitment groups expectations around honesty, respectful treatment, privacy, and delivery of the agreed service. It addresses false identities or documents, requests for another person's OTP or password, harassment, misuse of personal data, and additional charges without agreement. A consequence section describes review, possible account freezing, and relevant evidence handled through an appropriate process. A separate checkbox records agreement with the rules. The screenshot documents the stated application requirements; checking a commitment is distinct from management verifying and approving a driver.",
            "tags": [
              "Driver conduct",
              "Privacy commitments",
              "Explicit agreement"
            ],
            "media": "/portfolio/anjemin/live/11-driver-commitment.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Documents support a separate verification decision.",
            "label": "Live website / KTM, SIM & vehicle information",
            "description": "Driver applicants provide a campus email, vehicle and registration details, a KTM photo, a SIM A or SIM C selection, and a SIM photo. The upload guidance accepts JPG, PNG, or WebP up to four megabytes per image and asks for readable documents. It states that KTM and SIM photographs are restricted to management for verification. A final declaration covers licence validity, consistency with the documents, and vehicle suitability. These visible requirements support the application; management review remains a separate decision after submission.",
            "tags": [
              "Campus identity",
              "Vehicle & driving licence",
              "Restricted document review"
            ],
            "media": "/portfolio/anjemin/live/12-driver-document-verification.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Keep an unfinished form from disappearing silently.",
            "label": "Live website / Discard confirmation",
            "description": "Closing an unfinished account dialog can display a confirmation explaining that unsaved information will be lost. Lanjut mengisi returns to the form, while Buang perubahan discards the draft. These actions distinguish leaving a form from accepting the loss of entered information, which is useful when signup includes identity, verification, consent, and driver-document sections. The capture isolates the confirmation so its explanation and choices remain readable. It does not create an account, request an OTP, or change any existing account data.",
            "tags": [
              "Unsaved-form protection",
              "Continue or discard",
              "Clear action choices"
            ],
            "media": "/portfolio/anjemin/live/13-discard-confirmation.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Everyday help, inside the account.",
            "label": "Customer / Dashboard",
            "description": "The signed-in Customer dashboard greets the account holder and brings the four service areas into one workspace. The sidebar separates booking, marketplace activity, service orders, referral codes, and privacy information. A prominent introduction leads into service discovery, while the referral section belongs to the same account rather than a separate application. This current capture connects the public introduction to the logged-in experience: customers request help and manage their activity here, while driver operations and management tools appear in their own account roles.",
            "tags": [
              "Personalized dashboard",
              "Task-based navigation",
              "Four connected services"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-01-dashboard.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Choose the job before filling the form.",
            "label": "Customer / Service selection",
            "description": "Pesan Layanan first asks the customer to choose transport, parcel delivery, or personal shopping. Each card describes its purpose before the application exposes service-specific fields. This avoids asking someone sending a parcel for passenger details or treating shopping instructions as a simple destination. Once a service is selected, a shared switcher keeps the other options available. The next screens follow that structure, showing how vehicle choice, item information, maps, and the dedicated shopping wizard change with the selected task.",
            "tags": [
              "Service discovery",
              "Task-specific forms",
              "Shared booking entry"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-02-service-selection.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Book a motorcycle with the necessary details.",
            "label": "Customer / Motorcycle request",
            "description": "The motorcycle form combines a pickup address, destination, example fare, optional voucher, and additional instructions. Map and GPS controls sit beside the location fields, while a separate destination preview explains that the chosen point must be confirmed. The screen identifies Rp6,000 as an MVP example rather than an official commercial fare. It also explains the intended sequence of driver acceptance, payment availability, and completion confirmation. This capture stops at the form; the broader account interface currently reports that payments have not been activated.",
            "tags": [
              "Motorcycle request",
              "Pickup & destination",
              "Example fare and voucher"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-03-ride-motor.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A car request adds passenger information.",
            "label": "Customer / Car & passenger count",
            "description": "Switching the vehicle to Mobil reveals a passenger-count selector that is absent from the motorcycle form. The customer can select from one to seven passengers while keeping the same pickup, destination, voucher, and note fields. This capture uses four passengers to demonstrate the conditional field, without submitting a ride. The visible distinction shows how one booking interface adapts to a different vehicle requirement. Choosing the count describes the request; it does not establish vehicle availability or confirm that a driver has accepted it.",
            "tags": [
              "Conditional passenger field",
              "Car booking",
              "Unsubmitted example"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-04-ride-car.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Confirm a point before using it.",
            "label": "Customer / Interactive pickup map",
            "description": "The pickup dialog shows an interactive OpenStreetMap view around Tembalang, with zoom controls, a map-center action, GPS access, and optional address notes. Its confirmation button is initially unavailable until a point is selected. The customer can inspect the map, choose a location, and deliberately apply it to the booking rather than replacing the address merely by opening the dialog. The screenshot preserves the real map and controls. Device permission and location selection are separate from the later act of submitting a service request.",
            "tags": [
              "OpenStreetMap picker",
              "Explicit location confirmation",
              "Optional landmark notes"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-05-pickup-map.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A parcel needs more than two addresses.",
            "label": "Customer / Parcel delivery",
            "description": "ANJEMIN Barang keeps pickup and destination information while adding the item's name, category, weight, and photograph. Categories include documents, electronics, clothing, books, and other items; the image field accepts PNG, JPG, or WebP up to four megabytes. Fare, voucher, and notes remain part of the form, allowing handling instructions or landmarks to accompany the delivery. This full section capture preserves the added fields so the parcel flow can be compared with passenger booking. No parcel order or photo upload was submitted.",
            "tags": [
              "Item category & weight",
              "Parcel photograph",
              "Delivery instructions"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-06-parcel-delivery.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Jasa Titip starts at the shop.",
            "label": "Customer / Shopping step 1: location",
            "description": "The current Jasa Titip interface uses a dedicated three-stage flow instead of the generic booking form. Step one asks where the driver should shop or collect the items, with an optional store name, a required address, and a map-selection action. A persistent summary separates the shopping location from the delivery address and previews the service fee. In this deployment, the form offers direct address entry rather than an active shop-search interface. This screenshot documents the actual first step before the example shopping details are entered.",
            "tags": [
              "Shopping location",
              "Three-stage wizard",
              "Persistent request summary"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-07-jastip-store.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Describe the shopping request precisely.",
            "label": "Customer / Shopping step 2: items & delivery",
            "description": "Step two asks for the shopping list, including quantities, variants, and possible replacements, followed by the delivery address and optional instructions. Map and device-location controls support the drop-off point without mixing it with the store address. The screenshot uses clearly marked example items and an example campus destination to show how the summary updates as the form is completed. These values remain an unsubmitted draft. The separation helps a driver understand what to buy, where to collect it, and where the customer expects it delivered.",
            "tags": [
              "Quantities & variants",
              "Separate delivery address",
              "Optional driver instructions"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-08-jastip-items.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Review the goods and the service separately.",
            "label": "Customer / Shopping step 3: review",
            "description": "The final shopping step summarizes the store, items, and delivery address, with Ubah actions for correcting earlier entries. The fee and voucher section applies to the service charge, and the adjacent summary explicitly excludes the price of the goods. Supporting text says the shopping price is agreed with the driver through chat and describes payment after driver acceptance. This capture shows the real review interface with labelled example inputs. The final Cari Penganjem action was not used, so no shopping request was placed.",
            "tags": [
              "Review before requesting",
              "Goods versus service fee",
              "Editable summary"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-09-jastip-review.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Read the outcome of every service request.",
            "label": "Customer / Service order history",
            "description": "The service-history page brings rides, parcel delivery, and shopping requests together with their route, vehicle where relevant, fare, discount, assigned driver, and status. The captured account contains waiting, cancelled, and completed records, making those outcomes distinguishable instead of presenting every row as a successful journey. A refresh action updates the account's orders, and report buttons connect an individual transaction to management follow-up. These are existing account records inspected during documentation; no new order, cancellation, payment, or completion was performed.",
            "tags": [
              "Waiting, cancelled & completed",
              "Driver and fare context",
              "Order-specific reports"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-16-service-history.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A waiting request has a search state.",
            "label": "Customer / Driver-search timeout",
            "description": "An existing waiting order displays a three-minute driver-search timer and a progress indicator. In the captured state, the timer has reached zero and the message explains that no driver has accepted yet. Order Ulang offers another search attempt, while cancellation and reporting remain separate actions. This focused image makes the expired search understandable within its original order context. The retry button was not pressed: the screenshot documents the available recovery path without restarting matching or sending a new request to drivers.",
            "tags": [
              "Search countdown",
              "Expired search feedback",
              "Explicit retry action"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-20-driver-search.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Explain why an accepted order was cancelled.",
            "label": "Customer / Payment timeout",
            "description": "This existing cancelled order includes a specific explanation: the customer did not pay within five minutes after driver acceptance, and an applicable voucher would be returned. The driver identity and payment status stay attached to the order so the reason is not confused with an unaccepted request or a completed trip. The focused capture illustrates a distinct lifecycle state in the current application. It records a historical outcome already present in the demo account; no payment window was started or allowed to expire during this documentation.",
            "tags": [
              "Five-minute payment window",
              "Cancellation reason",
              "Voucher-return explanation"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-21-payment-timeout.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Give completed work a clear final state.",
            "label": "Customer / Completed transaction",
            "description": "A completed service record carries a visible Transaksi Selesai stamp and a thank-you message alongside the route, fare, and assigned driver. This differs from the waiting and cancelled states shown earlier, giving the customer a clear end to the service journey. A report action remains connected to the original order if follow-up is needed. The screenshot uses a pre-existing completed record, not a transaction created for the portfolio, and its displayed amount represents account history rather than a claim about current platform revenue.",
            "tags": [
              "Completed status",
              "Visible completion stamp",
              "Post-order follow-up"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-22-completed-order.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Report an issue in its transaction context.",
            "label": "Customer / Report form",
            "description": "Laporkan opens a form tied to the selected order. The customer chooses among danger, suspicious activity, or a left-behind item, then describes what happened. The interface states that report content and account contact details are visible to management for follow-up. It also explains that the form does not automatically send emergency assistance. This screenshot captures the empty reporting interface so its categories and expectations can be examined. The report was not submitted, and no management case was created or changed.",
            "tags": [
              "Order-linked report",
              "Issue categories",
              "Management-only follow-up"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-23-report-form.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Browse goods in a separate marketplace.",
            "label": "Customer / Marketplace discovery",
            "description": "The marketplace separates buying and selling student goods from driver-service booking. It offers keyword search, category filtering, and Jual barang, with categories such as electronics, boarding-house goods, clothing, and books. At capture time the live catalogue shows no available listings, so the empty state offers a route to create one. The fee explanation remains visible: publication costs Rp3,000 per product, while the item's purchase price is arranged directly with the seller through chat or COD. Historical marketplace activity is available through separate account pages.",
            "tags": [
              "Keyword & category filters",
              "Honest empty state",
              "Listing-fee explanation"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-10-marketplace.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Create a listing with enough product context.",
            "label": "Customer / Selling form",
            "description": "Buka Lapak asks for a product name, category, price, description, and between one and five original photographs. The upload area shows the current photo count and combined size, with a total four-megabyte limit and the first image designated as the cover. The form explains the Rp3,000 publication fee and says a listing appears after QRIS verification; payment for the item remains a buyer-seller agreement. The screenshot shows the form before submission. No listing, publication payment, or product image was created for the walkthrough.",
            "tags": [
              "One to five product photos",
              "Cover image & size limit",
              "Publication fee"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-11-create-listing.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Keep active purchases apart from service orders.",
            "label": "Customer / Marketplace purchases",
            "description": "The Pembelian view under marketplace Pesananku is reserved for active buying activity rather than rides or deliveries. A companion Penjualan tab switches to the seller perspective, while the page explains direct chat or COD arrangements and seller confirmation after payment and handover. The captured buying view has no active reservation, so its empty state links back to the marketplace. This distinguishes an absence of current activity from the separate completed-order archive. No product was reserved or purchased as part of documenting the page.",
            "tags": [
              "Buyer perspective",
              "Active marketplace orders",
              "Direct settlement"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-12-market-purchases.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "One account can also act as a seller.",
            "label": "Customer / Marketplace sales",
            "description": "Switching to Penjualan changes the same activity area to the account's active selling requests. This provides a different perspective from purchases without requiring a separate seller account. The captured view shows no active sale awaiting fulfilment and explains where buyer requests would appear. Supporting text keeps the item's payment and handover agreement separate from the platform's listing fee. This image documents the real empty seller state and its navigation; it does not imply that a product was posted or a sale completed during capture.",
            "tags": [
              "Seller perspective",
              "Buyer-seller account roles",
              "Active-sale empty state"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-13-market-sales.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "An archive for completed marketplace activity.",
            "label": "Customer / Marketplace history",
            "description": "Marketplace Riwayat Pesanan separates finished or cancelled transactions from active orders, with buyer and seller perspectives and a status filter. The current capture shows an existing completed purchase, its item context, a payment-detail action, and stages from checkout through handover and completion. This is an older website-payment record retained by the application. It is distinct from the current catalogue's listing-fee and direct chat or COD model. Its displayed amount is historical account data, not a purchase made during documentation or a claim about current platform revenue.",
            "tags": [
              "Completed & cancelled archive",
              "Buyer/seller views",
              "Status filtering"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-14-market-history.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Find the conversation behind the item.",
            "label": "Customer / Negotiation inbox",
            "description": "Chat Nego lists existing conversations with the partner's displayed identity and the associated product title. In the supplied account, these conversations remain available even though the current marketplace catalogue is empty. The list gives the user a way to return to an earlier negotiation instead of searching for an item again. The unselected detail pane invites the user to choose a conversation. This capture documents the actual inbox structure and existing entries; no conversation was created and no message was sent.",
            "tags": [
              "Conversation list",
              "Product-linked context",
              "Partner identity"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-15-negotiation-chat.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A negotiation has text and an optional price.",
            "label": "Customer / Conversation workspace",
            "description": "Opening an existing conversation reveals the partner identity, the selected negotiation area, a message field, and an optional offer-amount field. These controls support discussing an item and attaching a proposed price within the application's conversation context. The selected thread has no visible message history in this capture, so the image focuses on the available workspace rather than inventing sample exchanges. The Kirim action was not used. Any later reservation or agreement is a separate step from merely opening a conversation.",
            "tags": [
              "Existing conversation",
              "Optional price offer",
              "Message composer"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-24-negotiation-workspace.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Make the referral conditions visible to the account.",
            "label": "Customer / Referral & vouchers",
            "description": "The signed-in referral page displays the account's personal code and a copy action, then explains the current reward conditions. It states that the invited friend receives a Rp500 voucher and the inviter receives Rp300 after the friend completes a first trip, with a seven-day voucher period. A separate Voucher milikku area shows whether the account has active vouchers; it is empty in this capture. These are the current interface's stated promotion rules, not proof that a voucher was earned during the walkthrough.",
            "tags": [
              "Personal referral code",
              "Conditional promotion",
              "Active-voucher area"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-17-referral-vouchers.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "An identity shared at the right level.",
            "label": "Customer / Profile settings",
            "description": "Profil Saya separates a public-facing identity preview from editable account fields. The name, username, and photo help identify the person during transactions, while the form also contains email and phone details for the owner. The screen explains that changing the phone number requires OTP verification and that contact details are restricted to the owner and management. Contact values are masked in this portfolio capture while the labels and controls remain visible. No profile field, photo, or phone number was changed.",
            "tags": [
              "Identity preview",
              "Contact visibility",
              "OTP for phone changes"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-18-profile.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Change a password through a dedicated form.",
            "label": "Customer / Password settings",
            "description": "The account menu opens a password-change dialog with separate fields for the current password, a new password, and confirmation of the new value. Guidance specifies a new-password length of ten to 128 characters. Keeping these fields separate helps distinguish account verification from the new credential being proposed, and the confirmation entry supports catching mistakes before saving. All fields are empty in this screenshot. The demo login credentials were not captured in the image, and the save action was not used.",
            "tags": [
              "Current & new password",
              "Confirmation field",
              "Explicit save action"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-19-password-change.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "The signed-in dashboard at phone width.",
            "label": "Customer / Mobile dashboard",
            "description": "The Customer dashboard is also captured at a 390-pixel viewport. Its greeting, service introduction, account access, and service discovery follow the narrow layout while navigation moves into a collapsible menu. This image documents the authenticated experience at a different width from the desktop overview, using the same authorized account and actual website. It complements the public mobile screenshots later in the walkthrough by showing how the product continues after login. The capture is a real rendering, without a decorative device mockup.",
            "tags": [
              "390px viewport",
              "Authenticated mobile layout",
              "Responsive dashboard"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-25-mobile-dashboard.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Open the account's navigation when needed.",
            "label": "Customer / Mobile navigation",
            "description": "The mobile navigation drawer exposes the Customer's main destinations, including service booking, marketplace activity, orders, referral, and privacy. The account identity remains part of the menu so the current role is clear on a small screen. Capturing the drawer while open demonstrates how destinations that are permanently visible in the desktop sidebar become an intentional navigation action on a phone-width viewport. Selecting a destination returns to the main content instead of requiring the entire sidebar to stay beside the form.",
            "tags": [
              "Collapsible drawer",
              "Role-specific destinations",
              "Small-screen navigation"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-26-mobile-navigation.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Keep booking fields readable on a narrow screen.",
            "label": "Customer / Mobile ride form",
            "description": "The motorcycle booking form is captured separately at phone width so its fields can be inspected without the desktop sidebar or surrounding overview. Vehicle choice, pickup, destination, voucher, fare guidance, and instructions follow a vertical layout while retaining the same request structure. The image preserves the actual form at full resolution, allowing the labels and location controls to be expanded for detail. This is the unsubmitted booking interface; no driver was requested and no payment step was initiated for the mobile capture.",
            "tags": [
              "Vertical booking form",
              "Location actions",
              "Same request structure"
            ],
            "media": "/portfolio/anjemin/authenticated/customer-27-mobile-booking.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A dashboard shaped around the driver's work.",
            "label": "Penganjem / Dashboard",
            "description": "The Penganjem dashboard uses the same visual language as the Customer workspace but changes the introduction and primary action toward fulfilling requests. Its navigation exposes incoming work, balance, achievements, marketplace activity, and service history. The account identity and role remain visible, helping distinguish requesting a service from operating as a driver. This current capture documents the supplied driver's actual account. Approval, availability, order handling, earnings, and rewards are explained separately in the following screens instead of being treated as one undifferentiated dashboard feature.",
            "tags": [
              "Driver-oriented dashboard",
              "Role-specific navigation",
              "Operational entry points"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-01-dashboard.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Availability and approval are different conditions.",
            "label": "Penganjem / Incoming orders",
            "description": "Tarik Order shows the driver's verification state and current Ready availability alongside service shortcuts and incoming-order controls. Sorting includes arrival order, distance, highest price, and lowest price, while a service filter separates rides, shopping, and deliveries. The supplied account is already approved and Ready, but no eligible incoming request appears in the captured view. A waiting customer request does not automatically mean there is an available driver job in this filtered panel. Availability was observed without toggling it, and no job was accepted.",
            "tags": [
              "Verified access",
              "Ready availability",
              "Sorting & service filters"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-02-incoming-orders.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Keep the driver's work connected to its outcome.",
            "label": "Penganjem / Service history",
            "description": "The driver's service-history view brings completed and cancelled work together with the service type, route, fare, and payment context. It complements the Customer's order view by showing activity from the account fulfilling requests. The balance summary distinguishes funds that remain held from available earnings, while each record preserves its own status. The screenshot shows existing activity in the supplied account. It does not imply that a completed-looking historical record automatically contributes to a currently available balance or qualifies for a reward in another payment mode.",
            "tags": [
              "Driver-side history",
              "Order and payment context",
              "Held versus available funds"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-03-order-history.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Separate pending funds from available balance.",
            "label": "Penganjem / Wallet overview",
            "description": "Saldo Penganjem separates Dana tertahan from Saldo tersedia and explains that held funds are released after customer confirmation. The available figure represents eligible order income after commission together with applicable achievement rewards. A withdrawal section describes its current availability, and the page states that real-money withdrawal has not been enabled. The supplied account shows the actual balance state captured during inspection, without simulating a payout. This distinction makes the wallet understandable without treating order totals, application ledger entries, and money in a bank account as the same thing.",
            "tags": [
              "Held and available balance",
              "Withdrawal availability",
              "Payment-mode context"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-04-wallet.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Show where a balance entry would come from.",
            "label": "Penganjem / Incoming-balance history",
            "description": "The incoming-balance history is separate from the headline wallet totals and the withdrawal archive. It is designed to identify released order income and achievement bonuses, together with the time and amount of each credit. In the captured account this section has no entries, so the empty state explains where released earnings will appear. Keeping that state visible avoids inventing income to populate the portfolio. It also helps explain why existing service-history rows and a zero available balance can coexist when payment eligibility has not been satisfied.",
            "tags": [
              "Balance activity archive",
              "Order versus reward credits",
              "Visible empty state"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-05-wallet-activity.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Achievement progress has its own eligibility rules.",
            "label": "Penganjem / Achievement overview",
            "description": "The achievement overview combines progress toward the next milestone with totals for eligible completed rides, collected rewards, and rewards available to claim. The captured account shows zero qualifying progress and a message that reward claims are active only in simulation mode. This differs from simply counting every historical service record. The next milestone and progress indicator make the goal visible, while the payment-mode note keeps the reward mechanism in context. No reward was claimed or added to the wallet during the walkthrough.",
            "tags": [
              "Next-milestone progress",
              "Collected versus claimable rewards",
              "Simulation-only claims"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-06-achievements-overview.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Make each milestone readable at a glance.",
            "label": "Penganjem / Six achievement milestones",
            "description": "The milestone grid shows six cumulative targets: ten, 25, 50, 100, 250, and 500 completed eligible rides. Each card pairs its title with a potential reward, a numerical progress count, a percentage, a progress bar, and a locked or claim-related state. This focused capture keeps the cards readable separately from the overview. The values shown belong to the current reward interface, and eligibility still depends on the stated completion and payment conditions. The screenshot documents goals and progress rather than presenting unearned rewards as received income.",
            "tags": [
              "Six cumulative targets",
              "Progress and locked states",
              "Potential reward amounts"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-07-milestones.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Explain which journeys count toward a reward.",
            "label": "Penganjem / Achievement rules",
            "description": "The rules panel says progress comes from transport orders confirmed complete by the customer, fully paid, and credited to the driver's balance in the same payment mode. Cancelled or unpaid orders do not count, and deliveries, personal shopping, and marketplace activity are excluded from these ride milestones. Targets are cumulative rather than resetting monthly, with each applicable bonus claimable once. This dedicated screenshot explains the difference between service history and achievement progress, making the zero qualifying total in the previous screen understandable.",
            "tags": [
              "Paid and confirmed rides",
              "Service-type exclusions",
              "Cumulative once-only rewards"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-08-achievement-rules.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "The driver's profile also carries verification context.",
            "label": "Penganjem / Profile settings",
            "description": "The driver profile combines the shared name, username, photo, email, and phone settings with a visible Penganjem role and verification context. The public-facing identity preview explains how the account is recognized during a transaction, while contact information remains restricted to the owner and management. Changing a phone number requires separate OTP verification. The contact values are masked in this portfolio screenshot while the controls remain visible. No profile information or verification record was edited, and the page is distinct from management reviewing KTM and SIM documents.",
            "tags": [
              "Driver identity",
              "Verification context",
              "Restricted contact fields"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-09-profile.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "A driver can also sell student goods.",
            "label": "Penganjem / Marketplace sales history",
            "description": "The driver account can also use marketplace selling features. This seller-history capture shows an older completed website-payment transaction, including its historical commission split, seller portion, and completion stages. That retained record differs from the current catalogue's stated listing-fee and direct chat or COD model; the application keeps earlier website-payment transactions viewable. The seller perspective is separate from accepting driver-service work. Its amounts belong to existing account history, and no product, sale, payment, or withdrawal was created for this walkthrough.",
            "tags": [
              "Marketplace access for drivers",
              "Seller history",
              "Separate transaction model"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-12-marketplace-sales.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Driver operations at phone width.",
            "label": "Penganjem / Mobile incoming orders",
            "description": "At a 390-pixel viewport, the incoming-order workspace follows a vertical layout while keeping verification, availability, service choices, filtering, and the order-result area together. This focused capture preserves the actual mobile-width content instead of shrinking the desktop panel into a mock phone. The account's current Ready state and empty incoming queue remain the same as in the desktop inspection. The screenshot shows how a driver can read the operational controls on a smaller screen without changing availability or accepting an order.",
            "tags": [
              "390px operational view",
              "Responsive controls",
              "Same account state"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-10-mobile-orders.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Read wallet information on a smaller screen.",
            "label": "Penganjem / Mobile wallet",
            "description": "The mobile wallet stacks the held-fund and available-balance cards, withdrawal information, and activity sections into a narrow reading flow. It retains the payment-mode explanations and unavailable payout state rather than implying that a smaller interface enables a different financial action. This capture uses the same driver account at phone width, making the hierarchy comparable with the desktop wallet. Its full-resolution image can be expanded to inspect the labels and history sections. No withdrawal, balance transfer, or reward claim was initiated.",
            "tags": [
              "Stacked wallet cards",
              "Withdrawal-state explanation",
              "Mobile balance history"
            ],
            "media": "/portfolio/anjemin/authenticated/driver-11-mobile-wallet.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "See the platform from the management side.",
            "label": "Pengelola / Management Center",
            "description": "Management Center combines account totals, pending driver applications, waiting and completed service orders, marketplace activity, commission records, promotion costs, and amounts recorded as received. The verification and commission areas sit beneath those summaries, linking the overview to operational follow-up. This current capture uses the authorized Pengelola account rather than a Customer or driver view. Contact details in the driver section are masked for the portfolio. The figures are existing application records at capture time and are not presented as independently verified income or live business performance.",
            "tags": [
              "Operational overview",
              "Driver verification",
              "Commission context"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-01-management-center.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Review documents without exposing them in the gallery.",
            "label": "Pengelola / Driver verification",
            "description": "The driver-review area associates an applicant with verification status and the relevant campus, vehicle, and document information. It provides access to submitted KTM and SIM files where available and distinguishes missing records from an approved status. This complements the public registration form: collecting information and management reviewing it are separate stages. Contact and vehicle details are masked in this capture, and private identity-document images were not opened or published. No driver approval or rejection was performed during documentation.",
            "tags": [
              "Application status",
              "Document availability",
              "Restricted identity review"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-02-driver-verification.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Recorded commission still needs reconciliation.",
            "label": "Pengelola / Commission ledger",
            "description": "The commission section explicitly separates a recorded platform amount from money confirmed as received. Its note explains that COD-related entries may require reconciliation and that Catat diterima belongs to an operator after verification. The existing ledger record shows how outstanding and received portions remain distinct. Capturing this section separately preserves that explanation rather than treating the dashboard total as money already in a bank account. No receipt was marked, payment verified, or financial entry changed for the portfolio.",
            "tags": [
              "Recorded versus received",
              "Outstanding commission",
              "Operator reconciliation"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-03-commission-reconciliation.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Choose the reporting context before reading profit.",
            "label": "Pengelola / Profit statistics",
            "description": "Statistik Keuntungan filters by period and transaction dataset, including simulation, gateway testing, live transactions, and older records. This capture selects all time and Catatan lama so the historical entry and its trend can be examined in the appropriate context. The summary separates estimated profit, commission, promotions, driver rewards, and completed transactions, while the chart and receipt area explain the totals. The page states that the estimate excludes operating costs, gateway fees, and taxes. Historical figures are not treated as current live income.",
            "tags": [
              "Period & dataset filters",
              "Historical-data context",
              "Profit components"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-04-profit-statistics.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Break the totals down by service.",
            "label": "Pengelola / Service-level reporting",
            "description": "Rekap per layanan separates transport, parcel delivery, personal shopping, and marketplace activity into rows. Each row reports transaction count, commission, promotions, rewards, and estimated profit for the selected period and dataset. This focused table lets an operator connect the overall statistics to a service instead of assuming every transaction contributes in the same way. The screenshot retains the historical-data filter context from the statistics page. It documents how the reporting is organized, without using the sample amounts as a claim about current demand or revenue.",
            "tags": [
              "Service-level comparison",
              "Commission and cost columns",
              "Filtered reporting"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-05-service-breakdown.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Transaction volume is different from platform income.",
            "label": "Pengelola / Commission receipts",
            "description": "The receipt summary distinguishes amounts recorded as received, amounts still outstanding, and total transaction value. Supporting text states that transaction value is the full fare or sale price, while only commission belongs to platform income. In the captured older-data view, an amount can therefore appear as outstanding without increasing the recorded-received total. This image isolates the accounting distinction that can be missed in a broader dashboard screenshot. The portfolio does not reconcile the figure with a bank account or mark it as collected.",
            "tags": [
              "Volume versus commission",
              "Received and outstanding",
              "Ledger interpretation"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-06-commission-receipts.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Review users through a searchable management table.",
            "label": "Pengelola / User management",
            "description": "Data Pengguna combines account counts with a searchable, horizontally scrollable table of Customer and Penganjem records. Filters narrow the view by account type and driver-verification status, while Ekspor CSV states that export follows the selected records. The table includes identity, role, readiness, verification, account-status, and activity information. Identifiers, contacts, campus email, and vehicle fields are masked in this portfolio screenshot. The image documents the administration structure; no account was edited and no user-data export was downloaded.",
            "tags": [
              "User search",
              "Role & status filters",
              "Scrollable records and export"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-07-user-management.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Narrow the table to verified drivers.",
            "label": "Pengelola / Combined user filters",
            "description": "This view applies the Penganjem account filter together with the approved-verification filter. The result count explains how many records match the current selection, making the filtering behavior visible before an operator exports or reviews a row. Contact and other private fields remain masked while the relevant role and status information stays readable. This illustrates combined filtering rather than a separate driver database. Changing these controls only changes the displayed records; no verification decision, availability setting, or account status was changed.",
            "tags": [
              "Combined filtering",
              "Approved-driver view",
              "Visible result count"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-08-driver-filter.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "An account restriction requires a separate reason.",
            "label": "Pengelola / Account-review dialog",
            "description": "Opening the account-status action displays a dedicated review form that names the selected account, explains the consequence of freezing it, and requires a reason. The explanation says affected users would be signed out and unable to log in or act until reactivated, with the action recorded against the manager. This screenshot shows the empty decision form only. The final freeze action was not submitted, so no account, session, driver availability, or moderation record was changed for the documentation.",
            "tags": [
              "Explicit account action",
              "Required reason",
              "Unsubmitted decision preview"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-09-account-review.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Keep reports connected to their review state.",
            "label": "Pengelola / Transaction reports",
            "description": "The transaction-report view shows a total count, the number requiring review, category badges, and open or resolved states. Cases remain tied to an order and the relevant account, with management actions for follow-up or resolution. Private reporter details, routes, report text, and related-account information are masked in this public portfolio capture. The visible structure still explains how a customer report becomes an operator task. Existing cases were inspected without submitting a new complaint, resolving a case, or restricting an account.",
            "tags": [
              "Open versus resolved cases",
              "Order-linked follow-up",
              "Masked private report content"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-10-transaction-reports.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Separate reports about drivers from reports by them.",
            "label": "Pengelola / Driver-report scope",
            "description": "Laporan Penganjem adds a scope selector with reports about a driver and reports submitted by a driver as distinct choices. The captured view uses reports about Penganjem while retaining case counts, categories, review states, and operator actions. This makes the reporting perspective explicit rather than treating the reporter and the subject of a case as interchangeable. Private case information is masked in the image and omitted from the public capture notes. No report state or account restriction was changed.",
            "tags": [
              "About-driver versus by-driver scope",
              "Review categories",
              "Restricted case information"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-11-driver-reports.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Management summaries also adapt to phone width.",
            "label": "Pengelola / Mobile Management Center",
            "description": "At a 390-pixel viewport, the Management Center rearranges its overview into a narrow layout and places navigation behind the menu control. The screenshot provides a direct comparison with the wide management overview, showing how an operator can read the account and order summaries on a smaller screen. Private contact information remains masked wherever applicable. This is the same authorized management session and actual rendered interface, without a device mockup or invented statistics. No management action was carried out from the mobile view.",
            "tags": [
              "390px management view",
              "Responsive summaries",
              "Role-specific mobile access"
            ],
            "media": "/portfolio/anjemin/authenticated/manager-12-mobile-management.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Privacy information is part of the journey.",
            "label": "Live website / Privacy document overview",
            "description": "The privacy page can be reached from public navigation and registration, allowing a visitor to read about account information, driver documents, orders, device permissions, and local storage before signing up. The captured version labels itself Draft 0.1 and requires management review and publication of a final policy. Its introduction identifies operational information still needing completion. This screenshot documents the current disclosure page and its stated status. It is presented as information published by the website rather than an independent guarantee about the deployed system.",
            "tags": [
              "Linked privacy information",
              "Data-flow disclosure",
              "Draft document status"
            ],
            "media": "/portfolio/anjemin/live/14-privacy-overview.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Explain the account data being requested.",
            "label": "Live website / Account-data disclosure",
            "description": "The account-data article lists the details requested at signup: full name, username, email, a phone number verified with a one-time code, and a password. It states that passwords are stored as hashes rather than original text and that a phone number cannot be reused for a second account. This complements the registration images by explaining the identity and verification requirements in the site's own disclosure document. These are statements in the captured privacy draft; the screenshot does not substitute for auditing the authentication implementation.",
            "tags": [
              "Account information",
              "Phone uniqueness",
              "Published security statement"
            ],
            "media": "/portfolio/anjemin/live/15-privacy-account-data.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Select a location without implying continuous tracking.",
            "label": "Live website / Device permissions & maps",
            "description": "The location article says GPS is requested when a user chooses a location action and grants browser permission. It identifies OpenStreetMap tiles and server-side Photon lookup for selected map points, distinguishing them from typed addresses or landmark notes. It also describes opening a driver's pickup route in Google Maps without adding continuous ANJEMIN journey tracking. This gives context to the earlier map-picker image and separates device permission, address lookup, and external navigation into distinct interactions. The screenshot records the site's current description of those data flows.",
            "tags": [
              "Explicit GPS permission",
              "Map & address lookup",
              "External pickup navigation"
            ],
            "media": "/portfolio/anjemin/live/16-privacy-location-permissions.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Keep the access model visible.",
            "label": "Live website / Security & access disclosure",
            "description": "The security article states that the platform uses HttpOnly session cookies, password hashing, login and OTP attempt limits, driver approval, and restrictions on access to identity documents. It also identifies deployment configuration, backups, and monitoring as matters to verify in production. These disclosures explain why registration, authenticated account access, and management review are separate stages in the product journey. The captured page remains a draft statement from the website. It is not presented as an independent security assessment or evidence that every operational control was tested.",
            "tags": [
              "Session controls",
              "Restricted verification data",
              "Draft security disclosure"
            ],
            "media": "/portfolio/anjemin/live/17-privacy-access-and-security.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Tell users where requests belong.",
            "label": "Live website / Data rights & requests",
            "description": "The rights article describes requests for access, correction, processing explanations, withdrawal of relevant consent, and deletion where applicable. It says the submission procedure will use the official support channel and include verification of the requester. This connects privacy information to the help center rather than implying that an account-deletion button is visible in the screenshot. The help page currently marks official contacts as unconfigured, so the portfolio describes the procedure as a published draft requirement rather than a working support channel that was tested.",
            "tags": [
              "Access & correction requests",
              "Identity checks",
              "Support procedure disclosure"
            ],
            "media": "/portfolio/anjemin/live/18-privacy-rights-and-retention.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Separate service fees from marketplace sales.",
            "label": "Live website / Terms & transaction model",
            "description": "The captured draft terms distinguish several rules: drivers require approval; rides, deliveries, and shopping services state a six-percent commission; and marketplace sellers pay Rp3,000 per product for publication following QRIS verification. The terms separate that listing fee from the item's price: buyer and seller arrange payment and handover through chat or COD, with no stated commission on the goods sale. The page also identifies itself as a technical-testing draft requiring approval before commercial use. These are the terms stated on the website at capture time.",
            "tags": [
              "Service commission",
              "Listing publication fee",
              "Buyer-seller settlement"
            ],
            "media": "/portfolio/anjemin/live/19-service-terms.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Support information includes its current limits.",
            "label": "Live website / Help center",
            "description": "The help page provides fields for the official support email and WhatsApp number. In the captured version, both read Belum ditentukan, and the page says management must complete the contacts before opening the platform publicly. A visitor can therefore find the help entry point, but the current screen does not offer a configured contact channel. The portfolio keeps this readiness detail accurate instead of inventing support information or reusing a contact from another service. No support conversation was initiated during documentation.",
            "tags": [
              "Help entry point",
              "Official contact fields",
              "Unconfigured contact state"
            ],
            "media": "/portfolio/anjemin/live/20-help-center.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "The visual system also works in a dark theme.",
            "label": "Live website / Theme preference",
            "description": "The theme control switches from the light purple presentation to a darker alternative while retaining the same service introduction, account access, and navigation. Capturing the homepage again makes that visual change directly comparable with the opening image. The privacy document identifies theme preference as one of the settings stored locally on the device. The theme remains a presentation preference; it does not represent a different account role, service mode, or permission level. This screenshot documents the actual interface change rather than a recolored concept image.",
            "tags": [
              "Light & dark themes",
              "Consistent navigation",
              "Stored device preference"
            ],
            "media": "/portfolio/anjemin/live/21-dark-theme.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Navigate beyond the main call to action.",
            "label": "Live website / Footer navigation",
            "description": "The footer groups service entry points separately from information and help destinations. Visitors can revisit transport, delivery, shopping, and marketplace options, read the privacy document and terms, find the help center, or return home. Its supporting text keeps the project grounded in the Tembalang student community. Showing this area separately documents secondary navigation that complements the more prominent account and service actions near the top of the page. It also explains where visitors can look for product disclosures before deciding to register.",
            "tags": [
              "Service navigation",
              "Privacy & terms links",
              "Help access"
            ],
            "media": "/portfolio/anjemin/live/05-footer-navigation.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "The introduction adapts to a phone.",
            "label": "Live website / Mobile homepage",
            "description": "At a 390-pixel phone viewport, the homepage adapts its introduction, rider imagery, and account entry to a narrow screen. This is the actual mobile rendering rather than a desktop screenshot placed inside an illustrative phone frame. Comparing it with the wide opening image shows how the same product proposition follows a more vertical reading order on a smaller device. Additional service information continues down the page. The following screenshot captures that discovery section at the same viewport width, showing the next part of the visitor journey.",
            "tags": [
              "390px mobile viewport",
              "Responsive introduction",
              "Direct account entry"
            ],
            "media": "/portfolio/anjemin/live/22-mobile-home.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Give each service room on a narrow screen.",
            "label": "Live website / Mobile service cards",
            "description": "The mobile services capture shows how the four choices adapt to a phone instead of compressing the desktop row into tiny cards. Each option retains its icon, name, short explanation, and continuation affordance, keeping transport, delivery, shopping, and marketplace discovery distinguishable. This revisits the service-selection stage at a different device size so the card spacing and reading order can be examined directly. The image preserves the rendered section at full resolution, allowing a closer look at its mobile typography and touch-oriented layout.",
            "tags": [
              "Responsive service cards",
              "Readable labels",
              "Vertical discovery flow"
            ],
            "media": "/portfolio/anjemin/live/23-mobile-services.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          },
          {
            "title": "Let the form follow the screen.",
            "label": "Live website / Mobile identity fields",
            "description": "The mobile registration detail focuses on the full-name and username fields. They become vertically stacked inputs instead of the desktop side-by-side row, keeping labels and entry areas readable on a narrow viewport. The surrounding onboarding still uses the same role selection, phone verification, password confirmation, and consent requirements explained earlier. This focused screenshot documents the layout adaptation in the first signup stage. It does not show a completed account, imply that identity documents were supplied, or claim that SMS verification was performed.",
            "tags": [
              "Stacked signup fields",
              "Mobile form layout",
              "Same onboarding requirements"
            ],
            "media": "/portfolio/anjemin/live/24-mobile-registration.webp",
            "mediaType": "image",
            "url": "https://anjemin.vercel.app/"
          }
        ]
      },
      {
        "id": "programming-b",
        "name": "Portfolio B",
        "status": "LOWBAT Assist / OLIMDIPO 2026 liaison workspace",
        "slides": [
          {
            "title": "LOWBAT Assist, ready for the team.",
            "label": "01 / Project overview & dashboard",
            "description": "LOWBAT Assist is a web workspace for the OLIMDIPO 2026 liaison officer team at Universitas Diponegoro. It brings announcement drafting, shared message history, faculty responsibilities, and working guidelines into one interface. The dashboard links directly to the generator and summarizes upcoming matches, today's matches, saved announcements, and database connectivity. The captured version shows an empty rundown alongside an active shared history, separating schedule availability from the team's existing communication records.",
            "tags": [
              "Liaison officer workspace",
              "Event coordination",
              "Dashboard"
            ],
            "media": "/portfolio/lowbat-assist/01-dashboard.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Understand. Confirm. Communicate. Follow up.",
            "label": "02 / Working guidelines",
            "description": "The Panduan page explains the operational flow before staff start drafting: read and understand the request, confirm its source with the coordinator or relevant division, communicate it clearly, then follow up until the need is resolved. Four numbered cards turn that process into a quick reference inside the workspace. This connects the generator to the wider liaison role: staff verify the facts, choose the right recipients, and check that the information reaches the people who need it.",
            "tags": [
              "Four-step workflow",
              "Information verification",
              "Follow-up"
            ],
            "media": "/portfolio/lowbat-assist/02-workflow-guide.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Find the right person first.",
            "label": "03 / Faculty responsibility directory",
            "description": "Penanggung Jawab organizes liaison assignments by faculty or delegation. The captured directory lists 13 delegations and 43 responsible staff, with a person count on each faculty card. Collapsible groups keep the overview compact while making detailed assignments available on demand. Before preparing a message, a liaison officer can find the relevant faculty and check who handles its sports. This places an operational reference alongside the announcement tools, reducing the need to search through separate assignment lists.",
            "tags": [
              "Faculty directory",
              "Collapsible groups",
              "Team coordination"
            ],
            "media": "/portfolio/lowbat-assist/03-responsibility-directory.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "From a faculty to its sports contacts.",
            "label": "04 / Responsibility details",
            "description": "Opening the Fakultas Teknik card reveals four responsible staff and their assigned sports, including the Basket and Atletik pairing. Each name sits next to its responsibilities, while other faculties remain collapsed for easier scanning. This screen demonstrates a concrete coordination task: identify the liaison assigned to basketball for the target faculty, then use that context when confirming details or arranging delivery of the announcement. The directory describes team assignments; it is separate from the generator's recipient selection.",
            "tags": [
              "Faculty assignments",
              "Sport responsibilities",
              "Expandable detail"
            ],
            "media": "/portfolio/lowbat-assist/12-responsibility-detail.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Start with a reusable announcement.",
            "label": "05 / Generator entry",
            "description": "The Generator page introduces the announcement builder and shows the templates currently available. In the captured version, the active template is H-1 Pertandingan Basket for OLIMDIPO 2026. Mulai Generate opens a guided form instead of asking staff to rewrite a message from scratch. The workflow combines the selected template with delegation and match information, then produces a structured preview for review. It keeps repeated announcements consistent while allowing the recipient, date, schedule, and venue to change.",
            "tags": [
              "Template-based drafting",
              "H-1 basketball notice",
              "Guided form"
            ],
            "media": "/portfolio/lowbat-assist/04-generator.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Step one: choose the message type.",
            "label": "06 / Wizard: Jenis",
            "description": "The first wizard screen asks staff to choose the announcement template. Selecting H-1 Pertandingan Basket establishes the message type before recipient or match details are entered. A four-stage progress indicator keeps Jenis, Delegasi, Detail, and Crosscheck visible, showing the current position and remaining stages. The selected card provides immediate visual feedback, and Lanjut moves into the delegation form. This separates the purpose of the announcement from the information needed to personalize it.",
            "tags": [
              "Step 1 of 4",
              "Template selection",
              "Progress indicator"
            ],
            "media": "/portfolio/lowbat-assist/05-template-selection.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Step two: address the right delegation.",
            "label": "07 / Wizard: Delegasi",
            "description": "Staff enter their name, select a faculty or delegation, and choose the appropriate Mikat greeting. The creator name identifies the announcement in shared history; it is a form field rather than an authenticated account. The screen explains that Wilayah dan Daerah does not require a Mikat choice. This capture uses Demo Portofolio and Fakultas Teknik as sample inputs, showing how the recipient context is prepared before the competition details are added.",
            "tags": [
              "Step 2 of 4",
              "Creator attribution",
              "Recipient personalization"
            ],
            "media": "/portfolio/lowbat-assist/06-delegation.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Choose an opponent with context.",
            "label": "08 / Match detail: opponent picker",
            "description": "Inside the match-detail stage, the opponent picker presents faculties as selectable cards with their abbreviations and full names. The faculty receiving the announcement is excluded from the choices, preventing it from being selected as its own opponent. In this example, Fakultas Teknik is the recipient and Fakultas Hukum becomes the opponent. A focused selection panel makes the matchup easier to check before it appears in the live summary and the announcement preview.",
            "tags": [
              "Opponent selection",
              "Faculty abbreviations",
              "Invalid pairing prevention"
            ],
            "media": "/portfolio/lowbat-assist/07-opponent-selection.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Step three: make every match detail count.",
            "label": "09 / Wizard: Detail",
            "description": "Selecting Basket reveals fields for Putra or Putri, opposing faculty, Home or Away status, match date, registration time, tip-off time, and venue. A matchup preview reflects the selected teams and category as staff complete the form. The sample shows FT versus FH, Putra, Home, with separate registration and tip-off times at Gor Basket UNDIP. One tall screenshot preserves all fields, the matchup summary, and navigation controls without cutting off the lower part of the form.",
            "tags": [
              "Step 3 of 4",
              "Conditional fields",
              "Match preview"
            ],
            "media": "/portfolio/lowbat-assist/08-match-details.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Step four: read it before generating.",
            "label": "10 / Wizard: Crosscheck",
            "description": "Crosscheck combines creator, template, delegation, greeting, category, teams, status, date, times, and venue in a summary grid. A formatted announcement preview below it lets staff review the wording and match information before continuing. A confirmation checkbox requires acknowledgement of that review before generating. Staff can return to earlier steps to correct the inputs. This sample walkthrough stops at the preview: its demonstration values were not submitted as a new announcement to the shared database.",
            "tags": [
              "Step 4 of 4",
              "Summary & text preview",
              "Required confirmation"
            ],
            "media": "/portfolio/lowbat-assist/09-crosscheck.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "A shared memory for the whole team.",
            "label": "11 / Shared history & filters",
            "description": "History brings saved announcements into a searchable team view. Staff can search by faculty, sport, creator, or message content, then narrow the list with faculty and template filters. This capture filters existing records to Fakultas Hukum, showing how the archive supports one delegation. Each record offers Copy and Lihat Detail, while Refresh reloads the shared history. The archive helps staff retrieve earlier messages, check their context, and reuse their text when coordinating follow-up.",
            "tags": [
              "Shared announcement archive",
              "Search & faculty filters",
              "Copy & detail actions"
            ],
            "media": "/portfolio/lowbat-assist/10-shared-history.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "Open the message, keep its structure.",
            "label": "12 / Saved announcement detail",
            "description": "Lihat Detail opens a saved announcement in a reading panel with metadata and a Copy Jarkoman action. The text preserves line breaks, emphasis markers, emoji, category, teams, schedule, venue, and reminders, allowing staff to review the communication before copying it into a messaging channel. This screenshot shows an existing history record rather than a newly submitted demonstration. The website prepares and stores announcement text; forwarding it to the intended recipients remains part of the liaison officer's workflow.",
            "tags": [
              "Saved message detail",
              "Formatted announcement",
              "Manual sharing"
            ],
            "media": "/portfolio/lowbat-assist/11-message-detail.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          },
          {
            "title": "The same workspace, on a smaller screen.",
            "label": "13 / Mobile dashboard",
            "description": "At a phone-width viewport, the dashboard adapts into a narrow vertical layout and provides navigation through a menu button. The project introduction and announcement action remain part of the entry experience, with more dashboard information available farther down the page. This capture shows the actual website at 390 pixels wide, complementing the desktop overview and focused wizard screens. It documents how staff can access the workspace from a smaller device while moving between event-coordination tasks.",
            "tags": [
              "Responsive interface",
              "390px viewport",
              "Mobile access"
            ],
            "media": "/portfolio/lowbat-assist/13-mobile-dashboard.png",
            "mediaType": "image",
            "url": "https://lowbat-assist.vercel.app/"
          }
        ]
      },
      {
        "id": "programming-c",
        "name": "Portfolio C",
        "status": "Priorify AI / Academic productivity prototype",
        "slides": [
          {
            "title": "Priorify AI, a clearer path to focus.",
            "label": "01 / Product introduction",
            "description": "Priorify AI connects academic tasks, priority decisions, and study time in one productivity workspace. The landing page introduces Smart Priority, Adaptive Schedule, and Personal Assistant, then offers a public demo through Jelajahi Demo. This walkthrough follows that demo with illustrative tasks and availability, showing how a student moves from planning work to tracking progress. The assistant is presented in the site settings as a simulation.",
            "tags": [
              "Academic productivity",
              "Task-to-schedule workflow",
              "Interactive demo"
            ],
            "media": "/portfolio/priorify-ai/01-home-overview.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Start with a view of what matters.",
            "label": "02 / Demo dashboard",
            "description": "Entering the demo opens a dashboard with three example tasks and three available study slots. Summary cards separate total, active, and completed work, while AI Insight explains the leading priority and the top-three list highlights what to tackle next. The seeded tasks appear overdue in this capture, making the deadline-based recommendation visible before a new task is added.",
            "tags": [
              "Dashboard overview",
              "Priority queue",
              "Study-time summary"
            ],
            "media": "/portfolio/priorify-ai/02-demo-dashboard.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Turn an assignment into a clear brief.",
            "label": "03 / Add an academic task",
            "description": "The Tugas form gathers the task name, course, deadline, estimated hours, difficulty, importance, and supporting notes. This example describes a three-hour software prototype with medium difficulty and high importance. These inputs give the priority calculation more context than a deadline alone. Selecting Simpan Tugas adds the example to the demo dashboard, where it can be reviewed alongside the existing assignments.",
            "tags": [
              "Structured task input",
              "Effort & importance",
              "Illustrative task"
            ],
            "media": "/portfolio/priorify-ai/03-create-academic-task.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "See the task in its priority context.",
            "label": "04 / Task list & ranking",
            "description": "After saving, the task table contains four assignments, including the new prototype example. Each row shows its course, deadline, remaining time, priority, and editable status. The older overdue assignments remain ahead of the new task. This view makes the result of task entry tangible and gives students one place to review their workload before deciding when to work on it.",
            "tags": [
              "Ranked task list",
              "Deadline visibility",
              "Status controls"
            ],
            "media": "/portfolio/priorify-ai/04-task-priorities.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Make room for focused work.",
            "label": "05 / Enter available study time",
            "description": "The Jadwal page asks for a weekday, start time, end time, and a short note. Here, a Thursday slot from 19:00 to 21:00 is prepared as an illustrative focus session. Existing Monday, Tuesday, and Wednesday slots remain visible below. Choosing Tambah Jadwal Kosong makes the new window available to the scheduler, connecting a realistic time budget with the task queue.",
            "tags": [
              "Weekly availability",
              "Time-slot input",
              "Study planning"
            ],
            "media": "/portfolio/priorify-ai/05-available-study-time.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Let the workload become a study plan.",
            "label": "06 / Automatically generated sessions",
            "description": "The schedule result assigns work to the available study windows. In this captured example, the four-hour proposal is split into two two-hour sessions on Monday and Tuesday, followed by the presentation on Wednesday and the report on Thursday. Each card names the task, time range, duration, and scheduling reason. The focused screenshot shows the generated plan after adding the extra availability.",
            "tags": [
              "Automatic scheduling",
              "Split study sessions",
              "Priority-based allocation"
            ],
            "media": "/portfolio/priorify-ai/06-generated-study-schedule.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Ask where to begin, and see why.",
            "label": "07 / Assistant priority guidance",
            "description": "In Assistant, the Tanya prioritas shortcut prepares a question that is submitted with Kirim. The response identifies Proposal Tugas Besar AI as the first task to address and explains its overdue deadline alongside the other ranking factors. The exchange turns the dashboard priority into a readable explanation. As disclosed in Pengaturan, this prototype assistant simulates guidance from the current task and schedule data.",
            "tags": [
              "Conversational guidance",
              "Explained priorities",
              "Prototype simulation"
            ],
            "media": "/portfolio/priorify-ai/07-assistant-priority-advice.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Break a large task into smaller steps.",
            "label": "08 / Assistant task breakdown",
            "description": "Submitting the Pecah tugas prompt adds a six-step breakdown for the proposal: reread the instructions, identify the hardest part, collect references, complete the main work, add supporting details, and review the result. The screenshot captures the actual demo response. It offers a practical starting checklist inside the conversation; the suggested steps are guidance rather than newly created task records.",
            "tags": [
              "Step-by-step guidance",
              "Task decomposition",
              "Actual demo response"
            ],
            "media": "/portfolio/priorify-ai/08-assistant-task-breakdown.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Finish one task. Find the next focus.",
            "label": "09 / Completion & updated priorities",
            "description": "Marking the proposal as Selesai changes the dashboard to one completed task and three active tasks. The presentation moves to the top of the priority queue, and AI Insight updates its recommendation. This closes the main workflow: capture a task, plan the work, then record completion so the remaining queue reflects what still needs attention. The completed assignment remains in the task table.",
            "tags": [
              "Completion tracking",
              "Updated recommendations",
              "Next-task focus"
            ],
            "media": "/portfolio/priorify-ai/09-progress-and-next-priority.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Choose a workspace that suits your focus.",
            "label": "10 / Appearance & prototype settings",
            "description": "Pengaturan brings together Daylight and Midnight themes, an animation preference, and the prototype reset action. The animation description says device reduced-motion preferences are respected. The same page explains that the assistant uses a simulation based on tasks and schedules, making the current implementation clear. This capture shows the available controls without resetting the walkthrough data.",
            "tags": [
              "Workspace preferences",
              "Reduced-motion support",
              "Prototype transparency"
            ],
            "media": "/portfolio/priorify-ai/10-workspace-settings.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "The same priorities, after dark.",
            "label": "11 / Midnight appearance",
            "description": "Switching to Midnight changes the dashboard to a darker palette while preserving its task counts, priority cards, navigation, and insight panel. The screenshot shows the same demo workload in the alternate theme. This view demonstrates how appearance can change without interrupting the planning workflow or requiring students to re-enter their assignments and study availability.",
            "tags": [
              "Midnight theme",
              "Consistent workspace",
              "Appearance toggle"
            ],
            "media": "/portfolio/priorify-ai/11-midnight-dashboard.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          },
          {
            "title": "Keep the plan close, on a smaller screen.",
            "label": "12 / Mobile dashboard",
            "description": "At a 390-pixel viewport, the dashboard stacks its content into a narrow layout. The capture shows the mobile entry to the workspace, with task summaries and further planning information available down the page. This complements the desktop walkthrough with an actual phone-width view of the same demo data, showing how students can review their workload from a smaller device.",
            "tags": [
              "Responsive interface",
              "390px viewport",
              "Mobile task overview"
            ],
            "media": "/portfolio/priorify-ai/12-mobile-dashboard.webp",
            "mediaType": "image",
            "url": "https://priorify-ai-nu.vercel.app/"
          }
        ]
      },
    ],
  },
  {
    id: 'design', number: '02', title: 'Made to feel different.', subtitle: 'Website & Visual Design', port: 'Pigment Atoll',
    description: 'A good design does more than look beautiful. I bring together soft palettes, clear visual stories, and intuitive interfaces to create experiences with a little personality.',
    projects: [
      {
        "id": "design-a",
        "name": "Portfolio A",
        "status": "School Posters / Graphic Designer & Poster Visualization / Adobe Photoshop, Premiere Pro & After Effects",
        "slides": [
          {
            "title": "Luminous Prom Night.",
            "label": "Graphic Designer & Poster Visualization / Prom night / SMAN 1 Madiun",
            "description": "As graphic designer and poster visualizer, I created this moving announcement for Luminous Prom Night. A moonlit navy background, gold borders, theatrical character imagery, and decorative lettering give the event a formal, cinematic atmosphere. The sequence reveals the visual before presenting the prom title and venue details. My workflow combined Adobe Photoshop for the graphic composition with Adobe After Effects and Adobe Premiere Pro for motion, timing, and the finished video.",
            "tags": [
              "Prom night",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/01-lumi.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/01-lumi.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "HIVI! at SMAN 1 Madiun.",
            "label": "Graphic Designer & Poster Visualization / HUT SMAN 1 Madiun / Peak celebration",
            "description": "I designed and visualized this HIVI! motion poster for the peak celebrations of HUT SMAN 1 Madiun. A purple concert atmosphere, neon outlines around the band members, lightning effects, and bold artist lettering bring the guest performance into focus. The sequence introduces the musicians before holding the event and venue information. As graphic designer and poster visualizer, I used Adobe Photoshop, Adobe After Effects, and Adobe Premiere Pro to compose the artwork and develop its animated presentation.",
            "tags": [
              "HUT SMAN 1 Madiun",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/15-hivi.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/15-hivi.webp",
            "videoDimensions": {
              "width": 576,
              "height": 1024
            }
          },
          {
            "title": "Vierratale at SMAN 1 Madiun.",
            "label": "Graphic Designer & Poster Visualization / HUT SMAN 1 Madiun / Peak celebration",
            "description": "This Vierratale motion poster was created for the peak celebrations of HUT SMAN 1 Madiun. I combined performance imagery, angular artist lettering, purple-and-yellow accents, and a layered concert composition to introduce the guest act. The animated opening leads into the main artist visual, with event details grouped underneath. My role covered graphic design and poster visualization, using Adobe Photoshop for the graphic composition and Adobe After Effects with Adobe Premiere Pro for the motion and final video.",
            "tags": [
              "HUT SMAN 1 Madiun",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/16-vierratale.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/16-vierratale.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Happy New Year 2022.",
            "label": "Graphic Designer & Poster Visualization / New Year greeting / SMAN 1 Madiun",
            "description": "For this New Year poster, I combined large yellow 2022 lettering, a pink greeting, illustrated people, and fireworks against a cool blue background. The moving composition brings the celebration into view before holding the greeting and its short message. I worked as graphic designer and poster visualizer, developing the layered artwork in Adobe Photoshop and using Adobe After Effects and Adobe Premiere Pro to shape the movement and assemble the final greeting video.",
            "tags": [
              "New Year greeting",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/03-new-year-2022.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/03-new-year-2022.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Candidate 01: Devin Erlangga.",
            "label": "Graphic Designer & Poster Visualization / OSIS election / SMAN 1 Madiun",
            "description": "I created this candidate introduction as graphic designer and poster visualizer for the OSIS election. A cutout portrait, oversized outlined 01, textured teal background, and orange accents establish the candidate's identity. The sequence then changes from the portrait introduction to a structured vision-and-mission panel, giving the message its own reading space. I used Adobe Photoshop for the graphic layout, with Adobe After Effects and Adobe Premiere Pro for the animated presentation and final assembly.",
            "tags": [
              "Candidate introduction",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/04-candidate-01.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/04-candidate-01.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Introducing the elected MPK chairperson.",
            "label": "Graphic Designer & Poster Visualization / MPK announcement / SMAN 1 Madiun",
            "description": "This moving poster congratulates the newly elected MPK chairperson for the 2022-2023 period. I arranged the portrait against a textured blue-green composition, with a large outlined number, expressive name lettering, and an orange announcement heading. The animation settles into a clear portrait-led layout so the person and the message stay central. My graphic design and poster visualization workflow used Adobe Photoshop, Adobe After Effects, and Adobe Premiere Pro.",
            "tags": [
              "Leadership announcement",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/05-mpk-chairperson.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/05-mpk-chairperson.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Celebrating Indonesia's 77th Independence Day.",
            "label": "Graphic Designer & Poster Visualization / 17 August 2022 / SMAN 1 Madiun",
            "description": "As graphic designer and poster visualizer, I built this Independence Day greeting around a red-and-white identity and an illustrated panjat pinang celebration. The date and anniversary heading sit above a scene of people, prizes, trees, and mountains. Layered movement introduces the scene and lets the final composition hold as a readable greeting. Adobe Photoshop supported the visual arrangement, while Adobe After Effects and Adobe Premiere Pro supported the motion and finished video.",
            "tags": [
              "Independence Day",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/06-independence-day-2022.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/06-independence-day-2022.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Rethera Classmeeting.",
            "label": "Graphic Designer & Poster Visualization / Classmeeting announcement / SMAN 1 Madiun",
            "description": "I designed and visualized this Rethera classmeeting poster with a purple palette, bold geometric accents, and a central window-like panel. Basketball, volleyball, and gaming imagery introduce the range of activities, while the title and event dates remain grouped inside the main panel. The animated entrance and exit extend the playful visual direction. I worked with Adobe Photoshop, Adobe After Effects, and Adobe Premiere Pro as graphic designer and poster visualizer.",
            "tags": [
              "Sports & gaming",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/07-universal-classmeet.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/07-universal-classmeet.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Lunar New Year 2022.",
            "label": "Graphic Designer & Poster Visualization / Lunar New Year greeting / SMAN 1 Madiun",
            "description": "For this Lunar New Year greeting, I composed a red-and-gold poster with a tiger, hanging lanterns, a patterned background, and a circular decorative frame. The greeting stays above the main illustration, while the closing message sits on a ribbon below. Motion brings the separate elements into one celebratory composition. As graphic designer and poster visualizer, I used Adobe Photoshop for the artwork layout and Adobe After Effects with Adobe Premiere Pro for its animated delivery.",
            "tags": [
              "Festive greeting",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/08-lunar-new-year-2022.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/08-lunar-new-year-2022.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Magnificent: the event rundown.",
            "label": "Graphic Designer & Poster Visualization / Animated event schedule / SMAN 1 Madiun",
            "description": "I turned the Magnificent event rundown into a sequence of illustrated activity posters. Volleyball, dance, a fashion presentation, and basketball each receive a distinct scene, color palette, and date treatment. Rather than placing the whole schedule in one dense layout, the video moves between activities so each announcement has its own moment. My role covered graphic design and poster visualization using Adobe Photoshop, Adobe After Effects, and Adobe Premiere Pro.",
            "tags": [
              "Event rundown",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/09-magnificent-rundown.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/09-magnificent-rundown.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Waisak 2022.",
            "label": "Graphic Designer & Poster Visualization / Waisak greeting / SMAN 1 Madiun",
            "description": "I created this Waisak greeting around a quiet night scene, with warm lanterns, a moon, lotus flowers, and a central seated figure. The peach-colored title contrasts with the deep blue and purple background, keeping the greeting readable while the surrounding layers move. As graphic designer and poster visualizer, I used Adobe Photoshop to arrange the composition and Adobe After Effects with Adobe Premiere Pro to develop its motion and final presentation.",
            "tags": [
              "Commemorative poster",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/10-waisak-2022.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/10-waisak-2022.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Rethera 2.0 Classmeeting.",
            "label": "Graphic Designer & Poster Visualization / 16?21 June 2022 / SMAN 1 Madiun",
            "description": "For Rethera 2.0, I combined stacked classmeeting lettering, a purple central panel, colorful borders, and illustrations of sport and gaming activities. The title and dates establish the event before the eye moves toward the activity scene below. Animated layers give the poster energy while preserving the hierarchy of the announcement. My contribution was graphic design and poster visualization, using Adobe Photoshop, Adobe After Effects, and Adobe Premiere Pro.",
            "tags": [
              "Classmeeting visual",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/11-rethera-2.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/11-rethera-2.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Honoring Indonesia's heroes.",
            "label": "Graphic Designer & Poster Visualization / Heroes? Day greeting / SMAN 1 Madiun",
            "description": "This Heroes' Day poster uses a deep red background, Garuda imagery, illustrated figures, and a raised flag to frame the commemorative message. The opening reveals the emblem before bringing the characters and heading into the foreground. I worked as graphic designer and poster visualizer, arranging the composition in Adobe Photoshop and developing its animated sequence with Adobe After Effects and Adobe Premiere Pro. The final layout centers the message of remembrance.",
            "tags": [
              "Heroes? Day",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/12-heroes-day.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/12-heroes-day.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "Maulid Nabi Muhammad SAW.",
            "label": "Graphic Designer & Poster Visualization / Commemorative greeting / SMAN 1 Madiun",
            "description": "I designed this Maulid Nabi greeting with an ornamental arch, geometric corner details, a crescent moon, and a warm mosque skyline. The blue-to-gold atmosphere guides attention from the greeting at the top toward the layered architecture below. Moving clouds and birds add depth to the poster visualization. As graphic designer and poster visualizer, I brought the composition together using Adobe Photoshop, Adobe After Effects, and Adobe Premiere Pro.",
            "tags": [
              "Religious greeting",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/13-maulid-nabi.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/13-maulid-nabi.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            }
          },
          {
            "title": "International Earth Day.",
            "label": "Graphic Designer & Poster Visualization / 22 April 2023 / SMAN 2 Madiun",
            "description": "As graphic designer, I composed this Earth Day poster in Adobe Photoshop around a large globe and small figures caring for their surroundings. Extruded green and orange lettering, layered clouds, foliage, and soft shadows give the flat poster a dimensional, paper-cut feel. The date anchors the lower section while the environmental imagery carries the message. This slide presents the finished static artwork, alongside the motion posters created with Adobe After Effects and Adobe Premiere Pro elsewhere in this collection.",
            "tags": [
              "Environmental poster",
              "Adobe Photoshop",
              "Poster Visualization"
            ],
            "media": "/portfolio/school-posters/14-earth-day.webp",
            "mediaType": "image",
            "url": null,
            "imageLabel": "Earth Day poster"
          },
          {
            "title": "SMALA MPLS: Dwipantara.",
            "label": "Graphic Designer & Poster Visualization / Animated twibbon / SMAN 5 Madiun",
            "description": "I designed and visualized this animated twibbon for MPLS SMALA 2024, using a red-and-gold palette, a glowing gunungan motif, and traditional character imagery. The opening animation leads into a circular portrait frame carrying the Dwipantara identity. Its green center is an intentional replacement area for a participant's photo or footage. As graphic designer and poster visualizer, I used Adobe Photoshop, Adobe After Effects, and Adobe Premiere Pro to bring the frame and its animated presentation together.",
            "tags": [
              "Animated twibbon",
              "Adobe Photoshop",
              "Adobe Premiere Pro",
              "Adobe After Effects"
            ],
            "media": "/portfolio/school-posters/02-smala-twibbon.mp4",
            "mediaType": "video",
            "url": null,
            "poster": "/portfolio/school-posters/02-smala-twibbon.webp",
            "videoDimensions": {
              "width": 720,
              "height": 720
            }
          }
        ]
      },
      {
        "id": "design-b",
        "name": "Portfolio B",
        "status": "FORMAS Semarang / Graphic design with Adobe Photoshop",
        "slides": [
          {
            "title": "FORMAS Goes to School.",
            "label": "Poster / Adobe Photoshop",
            "description": "I designed this FORMAS Goes to School poster using Adobe Photoshop. Its comic-inspired composition combines oversized yellow lettering, halftone dots, thick outlines, stars, and cloud-shaped bursts to give the school outreach announcement an energetic identity. The university emblems are arranged as a central collage, followed by the January 2025 event timeline and the closing call to stay tuned. Teal, yellow, and pink separate the information into clear visual areas while the character illustration connects the lower half of the layout.",
            "tags": [
              "Adobe Photoshop",
              "Event Poster",
              "Comic-inspired Design"
            ],
            "media": "/portfolio/formas/01-goes-to-school-poster.webp",
            "mediaType": "image",
            "imageLabel": "poster",
            "url": null
          },
          {
            "title": "A comic-inspired sticker collection.",
            "label": "Sticker / Adobe Photoshop",
            "description": "This sticker sheet extends the FORMAS visual identity into a collection of individual graphic pieces designed using Adobe Photoshop. It brings together the FORMAS wordmark, a collage of university emblems, comic sound effects, a megaphone, and a ringing telephone. Bold outlines, layered lettering, halftone textures, and expressive burst shapes connect the different compositions. Each sticker keeps a distinct silhouette while sharing the same bright visual language, allowing the collection to feel varied without losing its identity.",
            "tags": [
              "Adobe Photoshop",
              "Sticker Design",
              "Visual Identity"
            ],
            "media": "/portfolio/formas/02-sticker-bundle.webp",
            "mediaType": "image",
            "imageLabel": "sticker sheet",
            "url": null
          },
          {
            "title": "Welcome, SNBP Class of 2025.",
            "label": "Poster Welcome / Adobe Photoshop",
            "description": "I created this welcome poster in Adobe Photoshop to celebrate new students entering through SNBP in 2025. The headline is the main point of entry, with rounded green lettering and a dark dimensional shadow over a teal halftone background. A city landmark, the character illustration, comic clouds, and the congratulations ribbon connect the message with the FORMAS Semarang identity. The date and community header sit at the top, while contact and social details are grouped along the bottom so the welcome message remains prominent.",
            "tags": [
              "Adobe Photoshop",
              "Welcome Poster",
              "Social Media Design"
            ],
            "media": "/portfolio/formas/03-snbp-welcome-poster.webp",
            "mediaType": "image",
            "imageLabel": "welcome poster",
            "url": null
          },
          {
            "title": "UNDIP & UNNES, brought into focus.",
            "label": "Visual Logo / Adobe Photoshop",
            "description": "This short visual presents the existing UNDIP and UNNES emblems against a dark background. Warm golden highlights reveal their contours and depth before the sequence settles into a simpler side-by-side presentation. My graphic design work uses Adobe Photoshop, with attention to clean silhouettes, contrast, and the recognition of the university marks. The complete visual is included here, showing how the graphic assets read in motion as well as in a still composition.",
            "tags": [
              "Adobe Photoshop",
              "Logo Presentation",
              "Visual Treatment"
            ],
            "media": "/portfolio/formas/04-logo-visual.mp4",
            "poster": "/portfolio/formas/04-logo-visual.webp",
            "mediaType": "video",
            "videoDimensions": {
              "width": 1280,
              "height": 720
            },
            "url": null
          },
          {
            "title": "A welcome worth celebrating.",
            "label": "Visual Welcoming Party / Adobe Photoshop",
            "description": "The FORMAS welcoming party visual translates the graphic identity into a short event sequence. A deep blue background, teal lightning shapes, bright accents, and comic-style bursts frame the FORMAS emblem and the Welcoming Party and FORMAS 2025 titles. My graphic design work for the event uses Adobe Photoshop, carrying the same emphasis on expressive typography, strong silhouettes, and layered composition into the moving presentation. The full video retains its original sequence and soundtrack so the complete visual can be experienced here.",
            "tags": [
              "Adobe Photoshop",
              "Event Visual",
              "Welcoming Party"
            ],
            "media": "/portfolio/formas/05-welcoming-party-visual.mp4",
            "poster": "/portfolio/formas/05-welcoming-party-visual.webp",
            "mediaType": "video",
            "videoDimensions": {
              "width": 1280,
              "height": 720
            },
            "url": null
          }
        ]
      },
      {
        "id": "design-c",
        "name": "Portfolio C",
        "status": "Tenseiga_Clinic / Internship",
        "slides": [
          {
            "title": "Serum Gold Anti Aging.",
            "label": "Internship / Tenseiga_Clinic / Product motion poster",
            "description": "Created during my internship at Tenseiga_Clinic, this motion poster introduces the Serum Gold Anti Aging product through a warm gold-and-cream visual direction. The bottle is presented above a circular display platform, with an arched background, dimensional shadows, and bold product lettering. The sequence moves from the main product introduction into an information panel, bringing the product image and promotional copy together in one vertical presentation.",
            "tags": [
              "Internship",
              "Tenseiga_Clinic",
              "Motion Poster",
              "Product Presentation"
            ],
            "media": "/portfolio/tenseiga-clinic/01-serum-gold.mp4",
            "mediaType": "video",
            "poster": "/portfolio/tenseiga-clinic/01-serum-gold.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            },
            "url": null
          },
          {
            "title": "Tenseiga Clinic: logo visual.",
            "label": "Internship / Tenseiga_Clinic / Brand visual",
            "description": "This logo visual was created as part of my internship at Tenseiga_Clinic. The sequence brings the clinic emblem into focus on a white background, using a raised, dimensional treatment and soft shadows to give the mark a physical presence. Gold and dark lettering emerge as the visual settles into the finished clinic identity. The restrained composition keeps attention on the emblem and its reveal.",
            "tags": [
              "Internship",
              "Tenseiga_Clinic",
              "Brand Visual",
              "Logo Motion"
            ],
            "media": "/portfolio/tenseiga-clinic/02-clinic-visual.mp4",
            "mediaType": "video",
            "poster": "/portfolio/tenseiga-clinic/02-clinic-visual.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            },
            "url": null
          }
        ]
      },
    ],
  },
  {
    id: 'videography', number: '03', title: 'Stories, set in motion.', subtitle: 'Videography & Editing', port: 'Framewake Bay',
    description: 'Some stories are meant to move. Through framing, rhythm, and editing, I explore how everyday moments can become something worth watching, feeling, and remembering.',
    projects: [
      {
        "id": "videography-a",
        "name": "Portfolio A",
        "status": "BANGKIT / Cameraman / Jawa Pos SMA Awards 2021",
        "slides": [
          {
            "title": "BANGKIT, through my lens.",
            "label": "Film overview / My role: Cameraman",
            "description": "BANGKIT is a student short film published by SMAN 1 MADIUN for Jawa Pos SMA Awards 2021. I am credited as Cameraman, working with the director, director of photography, and wider Bhimacore Smasa production team. My contribution focuses on capturing the performances, composing the frame, and providing the camera coverage that carries the story from school and home into more intimate and night-time scenes. This opening slide uses the official film thumbnail; the following four slides show selected one-minute excerpts of the actual film.",
            "tags": [
              "Cameraman",
              "Student short film",
              "2021"
            ],
            "media": "/portfolio/bangkit/cover.webp",
            "mediaType": "image",
            "imageLabel": "film thumbnail",
            "url": "https://www.youtube.com/watch?v=KTGtOQgDrOo",
            "linkLabel": "Watch full film"
          },
          {
            "title": "Begin with a sense of place.",
            "label": "Cameraman / Part 01: Establishing space",
            "description": "The opening excerpt moves from the school entrance and the students beside a motorcycle to the approach to a house and the beginning of an interior scene. As cameraman, my role is to capture coverage that makes those spaces and movements understandable: wider views introduce the location, while closer framing brings the viewer toward the character. The sequence demonstrates environmental context and a progression from public space into a more personal setting. This selection preserves the original framing and follows the film from 00:15 to 01:15.",
            "tags": [
              "Establishing views",
              "Spatial continuity",
              "Character introduction"
            ],
            "media": "/portfolio/bangkit/01-establishing-space.mp4",
            "poster": "/portfolio/bangkit/01-establishing-space.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 15,
              "end": 75
            },
            "url": "https://www.youtube.com/watch?v=KTGtOQgDrOo",
            "linkLabel": "Watch full film"
          },
          {
            "title": "Keep the conversation connected.",
            "label": "Cameraman / Part 02: Dialogue coverage",
            "description": "This excerpt moves from the character at her desk into a conversation at the doorway, then toward a closer look at her phone and screen activity. My camera contribution is visible in the coverage of faces, the doorway, and the performers in relation to one another. Framing a speaker with the other person in the foreground gives the exchange a readable spatial relationship, while closer views bring attention to reactions. The focus here is camera coverage within the production team, with the original edit and performance retained.",
            "tags": [
              "Dialogue framing",
              "Foreground relationships",
              "Reaction coverage"
            ],
            "media": "/portfolio/bangkit/02-dialogue-coverage.mp4",
            "poster": "/portfolio/bangkit/02-dialogue-coverage.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 180,
              "end": 240
            },
            "url": "https://www.youtube.com/watch?v=KTGtOQgDrOo",
            "linkLabel": "Watch full film"
          },
          {
            "title": "Let the small details carry the story.",
            "label": "Cameraman / Part 03: Character & detail",
            "description": "A closer portrait, an over-the-shoulder view of the laptop, the character seated in the room, and an insert of the phone connect small actions to the person carrying them out. As cameraman, I work with those changes in shot size so that both the activity and the reaction remain legible. The excerpt gives a closer look at how device details and character framing sit together in the finished film. The excerpt shows how tighter coverage of objects can be paired with a readable view of the character.",
            "tags": [
              "Close-up details",
              "Over-the-shoulder framing",
              "Character observation"
            ],
            "media": "/portfolio/bangkit/03-character-and-details.mp4",
            "poster": "/portfolio/bangkit/03-character-and-details.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 250,
              "end": 310
            },
            "url": "https://www.youtube.com/watch?v=KTGtOQgDrOo",
            "linkLabel": "Watch full film"
          },
          {
            "title": "Carry the scene into the night.",
            "label": "Cameraman / Part 04: Night-time coverage",
            "description": "This selection transitions from the character on the phone to helmeted performers outside at night, followed by their arrival at a doorway. My role as cameraman is to keep the subjects readable within those changing surroundings and capture the viewpoints needed for the interaction. The street sequence pairs views from behind with a closer frontal angle, using the visible environment as context before returning to the house. The visible location lighting and the shift between viewpoints give the night coverage its sense of place.",
            "tags": [
              "Night exterior",
              "Reverse viewpoints",
              "Location-light coverage"
            ],
            "media": "/portfolio/bangkit/04-night-coverage.mp4",
            "poster": "/portfolio/bangkit/04-night-coverage.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 395,
              "end": 455
            },
            "url": "https://www.youtube.com/watch?v=KTGtOQgDrOo",
            "linkLabel": "Watch full film"
          }
        ]
      },
      {
        "id": "videography-b",
        "name": "Portfolio B",
        "status": "LÉGIONNAIRE / Co-Producer / Catatan Akhir Sekolah 75",
        "slides": [
          {
            "title": "LÉGIONNAIRE, made together.",
            "label": "Film overview / My role: Co-Producer",
            "description": "Légionnaire is the Catatan Akhir Sekolah film for SMAN 1 MADIUN's 75th cohort, published in 2024. It brings together scripted school scenes, messages from teachers, and shared memories of the graduating class. As Co-Producer, I helped with direction, equipment, and practical production needs alongside the wider crew. This walkthrough opens with the official thumbnail, followed by five one-minute excerpts and the film's production credit.",
            "tags": [
              "Co-Producer",
              "School farewell film",
              "2024"
            ],
            "media": "/portfolio/legionnaire/cover.webp",
            "mediaType": "image",
            "imageLabel": "film thumbnail",
            "url": "https://www.youtube.com/watch?v=EoJ8pQyXcTA",
            "linkLabel": "Watch full film"
          },
          {
            "title": "An opening built around small details.",
            "label": "Co-Producer / Part 01: Opening story",
            "description": "The excerpt follows the character in a night-time shop setting, moving between a letter, the counter, and the motorcycle outside. These everyday details establish a personal story before the school memories unfold. My contribution as Co-Producer was to support direction and the production's equipment needs, helping the crew carry out the intended scenes. This is a selection from the finished film, retaining its original framing and sound.",
            "tags": [
              "Narrative introduction",
              "Production support",
              "Night-time setting"
            ],
            "media": "/portfolio/legionnaire/01-opening-story.mp4",
            "poster": "/portfolio/legionnaire/01-opening-story.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 120,
              "end": 180
            },
            "url": "https://www.youtube.com/watch?v=EoJ8pQyXcTA",
            "linkLabel": "Watch full film"
          },
          {
            "title": "The classroom, as a shared memory.",
            "label": "Co-Producer / Part 02: Classroom life",
            "description": "A classroom scene brings together the teacher at the front, students at their desks, and closer reactions, including a student wearing headphones. The familiar setting connects the film's story to everyday school life. Supporting direction and equipment was part of my Co-Producer role across the project; this excerpt presents the crew's finished classroom sequence rather than behind-the-scenes footage.",
            "tags": [
              "School-life sequence",
              "Ensemble scene",
              "Direction support"
            ],
            "media": "/portfolio/legionnaire/02-classroom-life.mp4",
            "poster": "/portfolio/legionnaire/02-classroom-life.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 480,
              "end": 540
            },
            "url": "https://www.youtube.com/watch?v=EoJ8pQyXcTA",
            "linkLabel": "Watch full film"
          },
          {
            "title": "Give the school community a voice.",
            "label": "Co-Producer / Part 03: Teachers & students",
            "description": "This passage moves from a school scene into a teacher's interview, then returns to a light-hearted student memory. The recorded message gives the farewell film a reflective voice alongside its narrative scenes. It also shows the range of material brought together by the production team. My Co-Producer contribution supported direction and practical equipment needs within that shared production effort.",
            "tags": [
              "Teacher interview",
              "Shared memories",
              "Collaborative production"
            ],
            "media": "/portfolio/legionnaire/03-teacher-and-student-memories.mp4",
            "poster": "/portfolio/legionnaire/03-teacher-and-student-memories.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 1095,
              "end": 1155
            },
            "url": "https://www.youtube.com/watch?v=EoJ8pQyXcTA",
            "linkLabel": "Watch full film"
          },
          {
            "title": "A whole cohort in one frame.",
            "label": "Co-Producer / Part 04: Cohort togetherness",
            "description": "Students gather on the sports field as the film moves between wide group views, individual gestures, and the cohort's large formation. The sequence turns separate school memories into a shared celebration of Angkatan 75. It highlights the collective scale of the project: my Co-Producer role supported the director and equipment needs, while the finished result reflects the contributions of the cast and wider crew.",
            "tags": [
              "Angkatan 75",
              "Group sequence",
              "Shared celebration"
            ],
            "media": "/portfolio/legionnaire/04-cohort-togetherness.mp4",
            "poster": "/portfolio/legionnaire/04-cohort-togetherness.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 2280,
              "end": 2340
            },
            "url": "https://www.youtube.com/watch?v=EoJ8pQyXcTA",
            "linkLabel": "Watch full film"
          },
          {
            "title": "Leave with the memories intact.",
            "label": "Co-Producer / Part 05: Closing reflection",
            "description": "Near the end, the film revisits familiar school spaces and follows the characters toward the school entrance. The sequence gives the story a sense of departure after its classroom memories, teacher messages, and group celebration. As Co-Producer, I contributed through direction assistance and equipment support; this final excerpt shows how the team's work comes together in the finished film's closing movement.",
            "tags": [
              "Closing sequence",
              "School memories",
              "Co-Producer"
            ],
            "media": "/portfolio/legionnaire/05-closing-reflection.mp4",
            "poster": "/portfolio/legionnaire/05-closing-reflection.webp",
            "mediaType": "video",
            "excerpt": {
              "start": 2520,
              "end": 2580
            },
            "url": "https://www.youtube.com/watch?v=EoJ8pQyXcTA",
            "linkLabel": "Watch full film"
          },
          {
            "title": "The credit behind the collaboration.",
            "label": "Production Department / Co-Producer credit",
            "description": "The film's end credits list Iza Yunus Andhika under Co-Producer in the Production Department. This still is taken from the original film at 43:55 and links the role described in this portfolio to the published project. My contribution included helping with direction, equipment, and practical production needs. The full-size image preserves the surrounding crew credits to acknowledge the wider collaboration.",
            "tags": [
              "Co-Producer credit",
              "Iza Yunus Andhika",
              "Production Department"
            ],
            "media": "/portfolio/legionnaire/06-co-producer-credit.webp",
            "mediaType": "image",
            "imageLabel": "production credit",
            "url": "https://www.youtube.com/watch?v=EoJ8pQyXcTA",
            "linkLabel": "Watch full film"
          }
        ]
      },
      {
        "id": "videography-c",
        "name": "Portfolio C",
        "status": "NIGHTRIDE / Cameraman / MADENO STUDIOS",
        "slides": [
          {
            "title": "Nightride, through my lens.",
            "label": "Project overview / My role: Cameraman",
            "description": "Nightride with MADENO STUDIOS follows a group of motorcycle riders from the details of their bikes to a ride through the city after dark. I worked as cameraman on this project, contributing camera coverage of the motorcycles, rider preparations, and moving night-time sequences. The studio is credited for the video and colour grading in the original Instagram caption. This opening still introduces the project; four selected excerpts follow.",
            "tags": [
              "Cameraman",
              "MADENO STUDIOS",
              "Motorcycle film"
            ],
            "media": "/portfolio/madeno-nightride/cover.webp",
            "mediaType": "image",
            "imageLabel": "reel still",
            "url": "https://www.instagram.com/reel/CpfJr5cjiRC/",
            "linkLabel": "Watch full reel"
          },
          {
            "title": "Start with the machine.",
            "label": "Cameraman / Part 01: Motorcycle details",
            "description": "The first selection brings the viewer close to the motorcycles: bodywork, controls, and mechanical details become the visual introduction to the ride. Tight framing draws attention to surfaces and shapes before the film opens out to the riders. As cameraman, my contribution was to capture coverage that gives these details presence and connects the bikes to the wider sequence. The finished colour treatment is credited to MADENO STUDIOS.",
            "tags": [
              "Detail coverage",
              "Close framing",
              "Motorcycle portrait"
            ],
            "media": "/portfolio/madeno-nightride/01-motorcycle-details.mp4",
            "poster": "/portfolio/madeno-nightride/01-motorcycle-details.webp",
            "mediaType": "video",
            "videoDimensions": {
              "width": 720,
              "height": 320
            },
            "excerpt": {
              "start": 6,
              "end": 26
            },
            "url": "https://www.instagram.com/reel/CpfJr5cjiRC/",
            "linkLabel": "Watch full reel"
          },
          {
            "title": "The riders enter the story.",
            "label": "Cameraman / Part 02: Rider preparation",
            "description": "This excerpt moves from the parked motorcycles and cockpit details toward the helmeted riders gathering before departure. The shift from objects to people establishes the group behind the ride. My camera role focused on capturing the scene and its changing points of attention, with wider views for context and closer coverage of the preparations. It provides a quieter lead-in to the moving night-time footage.",
            "tags": [
              "Rider preparation",
              "Scene coverage",
              "Visual progression"
            ],
            "media": "/portfolio/madeno-nightride/02-rider-preparation.mp4",
            "poster": "/portfolio/madeno-nightride/02-rider-preparation.webp",
            "mediaType": "video",
            "videoDimensions": {
              "width": 720,
              "height": 320
            },
            "excerpt": {
              "start": 30,
              "end": 50
            },
            "url": "https://www.instagram.com/reel/CpfJr5cjiRC/",
            "linkLabel": "Watch full reel"
          },
          {
            "title": "Keep the rider in the frame.",
            "label": "Cameraman / Part 03: Night rolling shots",
            "description": "After dark, the sequence follows the motorcycles in motion. The frame shifts between the rider, wheels, rear lights, and the road markings passing beneath them. This selection highlights the camera work: maintaining a readable subject while using changes in distance and angle to convey movement. My contribution was as cameraman; the edit and colour treatment shown here belong to the finished MADENO STUDIOS project.",
            "tags": [
              "Moving coverage",
              "Night photography",
              "Subject framing"
            ],
            "media": "/portfolio/madeno-nightride/03-night-rolling-shots.mp4",
            "poster": "/portfolio/madeno-nightride/03-night-rolling-shots.webp",
            "mediaType": "video",
            "videoDimensions": {
              "width": 720,
              "height": 320
            },
            "excerpt": {
              "start": 62,
              "end": 82
            },
            "url": "https://www.instagram.com/reel/CpfJr5cjiRC/",
            "linkLabel": "Watch full reel"
          },
          {
            "title": "Let the city light the journey.",
            "label": "Cameraman / Part 04: City lights",
            "description": "The closing selection places the riders among streetlights, illuminated buildings, and reflections on the road. Headlights bring the motorcycles forward while the surrounding city gives the ride its atmosphere. As cameraman, I contributed the footage that connects the moving subjects with their night-time setting. The excerpt preserves the source picture and soundtrack, with only the empty black padding outside the film image removed for this player.",
            "tags": [
              "City atmosphere",
              "Available light",
              "Night ride"
            ],
            "media": "/portfolio/madeno-nightride/04-city-lights.mp4",
            "poster": "/portfolio/madeno-nightride/04-city-lights.webp",
            "mediaType": "video",
            "videoDimensions": {
              "width": 720,
              "height": 320
            },
            "excerpt": {
              "start": 94,
              "end": 114
            },
            "url": "https://www.instagram.com/reel/CpfJr5cjiRC/",
            "linkLabel": "Watch full reel"
          }
        ]
      },
      {
        "id": "videography-d",
        "name": "Portfolio D",
        "status": "Jingle PKKMB FH UNS / Full Editor",
        "slides": [
          {
            "title": "Jingle PKKMB FH UNS",
            "label": "Project overview / My role: Full Editor",
            "description": "I handled the full editing workflow for this Jingle PKKMB FH UNS video, from raw footage to the finished sequence. My work included selecting and arranging the footage, shaping the pacing, applying color grading, and editing the sound. The five chapters that follow use the local video supplied for this portfolio, moving from the campus opening through individual and group performances to the finale and closing credits.",
            "tags": [
              "Full Editor",
              "Footage Assembly",
              "Color Grading",
              "Sound Editing"
            ],
            "media": "/portfolio/jingle-pkkmb-fh-uns/cover.webp",
            "mediaType": "image",
            "imageLabel": "video still",
            "url": null
          },
          {
            "title": "Opening the journey.",
            "label": "Full Editor / Part 01 / Campus opening",
            "description": "This first chapter opens at the university entrance before introducing the campus performance. As Full Editor, I selected and arranged the raw footage to move from the setting into the performers, giving the sequence a clear starting point. The edit connects changes in framing with the musical pacing, while color grading and sound editing bring the opening material into the finished visual and audio treatment.",
            "tags": [
              "Full Editor",
              "Footage Sequencing",
              "Color Grading",
              "Sound Editing"
            ],
            "media": "/portfolio/jingle-pkkmb-fh-uns/01-opening-campus.mp4",
            "mediaType": "video",
            "poster": "/portfolio/jingle-pkkmb-fh-uns/01-opening-campus.webp",
            "videoDimensions": {
              "width": 1280,
              "height": 720
            },
            "excerpt": {
              "start": 0,
              "end": 50
            },
            "url": null
          },
          {
            "title": "Keep the performance moving.",
            "label": "Full Editor / Part 02 / Small-group performance",
            "description": "The second chapter stays with the smaller performance group, moving between individual gestures, shared choreography, and changes in camera angle. My contribution as Full Editor was to assemble the available footage into a continuous musical sequence, choosing cuts that follow the performers and maintain the rhythm. This excerpt shows how footage arrangement, color grading, and sound editing support the energy of the performance.",
            "tags": [
              "Full Editor",
              "Footage Sequencing",
              "Color Grading",
              "Sound Editing"
            ],
            "media": "/portfolio/jingle-pkkmb-fh-uns/02-small-group-performance.mp4",
            "mediaType": "video",
            "poster": "/portfolio/jingle-pkkmb-fh-uns/02-small-group-performance.webp",
            "videoDimensions": {
              "width": 1280,
              "height": 720
            },
            "excerpt": {
              "start": 50,
              "end": 105
            },
            "url": null
          },
          {
            "title": "Bring the cohort into the picture.",
            "label": "Full Editor / Part 03 / Cohort transition",
            "description": "This chapter widens the visual story to students in university jackets and additional campus imagery. The change in people and locations gives the edit a new movement before the larger ensemble sequences. As Full Editor, I organized these transitions from the supplied footage, keeping the musical flow connected across different scenes and carrying the color and sound treatment through the sequence.",
            "tags": [
              "Full Editor",
              "Footage Sequencing",
              "Color Grading",
              "Sound Editing"
            ],
            "media": "/portfolio/jingle-pkkmb-fh-uns/03-cohort-transition.mp4",
            "mediaType": "video",
            "poster": "/portfolio/jingle-pkkmb-fh-uns/03-cohort-transition.webp",
            "videoDimensions": {
              "width": 1280,
              "height": 720
            },
            "excerpt": {
              "start": 105,
              "end": 160
            },
            "url": null
          },
          {
            "title": "Build toward the ensemble.",
            "label": "Full Editor / Part 04 / Ensemble performance",
            "description": "The fourth chapter brings the larger student group into view, using broad campus compositions and coordinated movement to expand the scale of the video. I worked as Full Editor, selecting and sequencing these group views so the musical performance remains the focus. The edit balances the wider formations with changes in perspective, with color grading and sound editing applied as part of the complete post-production workflow.",
            "tags": [
              "Full Editor",
              "Footage Sequencing",
              "Color Grading",
              "Sound Editing"
            ],
            "media": "/portfolio/jingle-pkkmb-fh-uns/04-ensemble-performance.mp4",
            "mediaType": "video",
            "poster": "/portfolio/jingle-pkkmb-fh-uns/04-ensemble-performance.webp",
            "videoDimensions": {
              "width": 1280,
              "height": 720
            },
            "excerpt": {
              "start": 160,
              "end": 215
            },
            "url": null
          },
          {
            "title": "Close with the full celebration.",
            "label": "Full Editor / Part 05 / Finale and credits",
            "description": "The final chapter combines the wider ensemble, elevated views of the formation, and the closing credits. These images bring the performance to its conclusion and acknowledge the people involved in the finished video. As Full Editor, I assembled this closing movement, maintained its pacing against the soundtrack, and carried the color grading and sound edit through to the end. The excerpt preserves the source video's closing credit sequence.",
            "tags": [
              "Full Editor",
              "Footage Sequencing",
              "Color Grading",
              "Sound Editing"
            ],
            "media": "/portfolio/jingle-pkkmb-fh-uns/05-finale-credits.mp4",
            "mediaType": "video",
            "poster": "/portfolio/jingle-pkkmb-fh-uns/05-finale-credits.webp",
            "videoDimensions": {
              "width": 1280,
              "height": 720
            },
            "excerpt": {
              "start": 215,
              "end": 264
            },
            "url": null
          }
        ]
      },
      {
        "id": "videography-e",
        "name": "Portfolio E",
        "status": "I-GATE 2025 / Director, Cameraman & Editor",
        "slides": [
          {
            "title": "I-GATE 2025: Sore meets the Enchanted Garden.",
            "label": "My roles: Director, Cameraman & Editor",
            "description": "I worked as Director, Cameraman, and Editor on this promotional reel for I-GATE 2025. The scene follows two characters encountering an event poster, using their conversation and a later interaction to lead into the event reveal. Title cards connect the story to the Sore meets the Enchanted Garden concept shared in the original caption. My contribution covered directing the scene, filming the footage, and shaping the final sequence through editing. This slide presents the complete reel.",
            "tags": [
              "Director",
              "Cameraman",
              "Editor",
              "Promotional Reel"
            ],
            "media": "/portfolio/igate-2025/igate-2025-reel.mp4",
            "mediaType": "video",
            "poster": "/portfolio/igate-2025/cover.webp",
            "videoDimensions": {
              "width": 1280,
              "height": 792
            },
            "url": "https://www.instagram.com/reel/DRChiwBjLnm/",
            "linkLabel": "Watch on Instagram"
          }
        ]
      },
      {
        "id": "videography-f",
        "name": "Portfolio F",
        "status": "Tenseiga_Clinic / Cameraman, Concept Developer & Video Editor",
        "slides": [
          {
            "title": "A visit to Tenseiga Clinic.",
            "label": "My roles: Cameraman, Concept Developer & Video Editor",
            "description": "I worked as Cameraman, Concept Developer, and Video Editor on this promotional clinic-visit film for Tenseiga_Clinic, featuring influencer @faisafch. The video follows the visit from arrival and reception through consultation, the treatment room, and selected stages of the treatment process. I developed the concept, filmed the footage, and edited the scenes into a connected visitor journey, presenting the clinic's setting and services through an on-site experience.",
            "emphasizedText": "@faisafch",
            "tags": [
              "Cameraman",
              "Concept Development",
              "Video Editing",
              "Clinic Promotion"
            ],
            "media": "/portfolio/visit-tenseiga/visit-tenseiga.mp4",
            "mediaType": "video",
            "poster": "/portfolio/visit-tenseiga/cover.webp",
            "videoDimensions": {
              "width": 720,
              "height": 1280
            },
            "url": null
          }
        ]
      },
    ],
  },
];

// Add only the contact channels you want to make public.
export const contact = {
  email: '',
  instagram: '',
  linkedin: '',
};
