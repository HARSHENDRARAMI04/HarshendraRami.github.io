/* =====================================================================
   EDIT THIS FILE TO UPDATE YOUR SITE.
   Everything you see on the page comes from here. No other file needs
   to change when you add a product, write a note, or post an update.

   - Leave a text field empty ("") and that part simply won't show.
   - Newest items go first in `products` and `notes`. The home page shows the first 2 products; the rest live on works.html.
   - Dates are written as YYYY-MM-DD.
   ===================================================================== */

window.SITE = {
  name: "Harshendra Rami",
  greeting: "Hi, I'm",   // small line above your name in the hero
  photo: "",             // optional: e.g. "img/me.jpg" (square, ~400px). A face makes it personal.
  status: "",            // top-left note. Leave "" to auto-show your newest "Building" product.
  role: "Data engineer and tool maker",
  intro:
    "I move data for a living. On the side I build stuff that makes everyday things a little nicer.",

  // Links under your name. Empty url = hidden.
  links: [
    { label: "GitHub", url: "https://github.com/HARSHENDRARAMI" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/harshendrarami" },
    { label: "YouTube", url: "" },    // paste your channel URL
    { label: "Instagram", url: "https://www.instagram.com/ramis.3d?srtk=MWJtbWljNTU2cjlkZg==" }, // paste your profile URL,
    { label: "Email", url: "mailto:hrcreates2021@gmail.com" } // e.g. "mailto:you@example.com"
  ],

  /* ---------------------------------------------------------------
     WORK: your extensions and apps.
     type:   "Extension" | "App" | anything you like (filters build themselves)
     status: "Live" | "Building" | "Planned"
     icon:   optional path to a small image, e.g. "img/ytm.png" (40x40 is plenty)
     --------------------------------------------------------------- */
  products: [
    {
      name: "YTM but Better",
      type: "Extension",
      status: "Live",
      tagline: "A nicer way to listen on YouTube Music.",
      description:
        "A browser extension that adds a lyrics overlay, romanised lyrics for songs in other scripts, and a better seekbar to YouTube Music.",
      features: [
        "Lyrics overlay on top of the player",
        "Romanised lyrics for non-Latin scripts",
        "Different visual modes for your moods."
      ],
      links: [
        { label: "Get the extension", url: "https://chromewebstore.google.com/detail/kpgmciooonipfpkgfeecmcaagileejpi?utm_source=item-share-cb", primary: true },
        { label: "Source code", url: "" }
      ]
    },
    {
      name: "Guitar practice tool",
      type: "Extension",
      status: "Building",
      tagline: "Loop the hard part until it's clean.",
      description:
        "A browser extension that controls the video playing in your active tab, built for learning songs by ear and practising along.",
      features: [
        "Countdown before playback starts",
        "A–B loop for any section",
        "Works on the tab you already have open"
      ],
      links: [{ label: "Get the extension", url: "", primary: true }]
    }
  ],

  /* ---------------------------------------------------------------
     NOTES: things you write yourself. Blank line between paragraphs.
     --------------------------------------------------------------- */
  notes: [
    {
      title: "Check out the website my works and stay a bit on the website for surprise.",
      date: "2026-10-16",
      tags: ["site"],
      body:
        "This site is a reflection of me, Showing me and my works. Feel free to check out all the stuff I made and support as you wish"
    },
    {
      title: "Hello, this is where my work lives",
      date: "2026-10-11",
      tags: ["hello"],
      body:
        "Everything I build lives here: extensions, apps, and the notes I write along the way."
    }
  ],

  resume: "Harshendra_Rami_Resume_Data_Engineer.pdf",   // e.g. "resume.pdf": put the file next to index.html. Shows a Resume link when set.
  contact: {
    email: "hrcreates2021@gmail.com",
    note: "A project, a question, or just hello. Write to me.",
    formEndpoint: "",  // optional: Formspree or Web3Forms URL so messages arrive without opening an email app
    accessKey: ""      // Web3Forms only: its public access key
  },

  /* ---------------------------------------------------------------
     ABOUT
     --------------------------------------------------------------- */
  about: {
    paragraphs: [
      "I'm a data engineer. Day to day that means building and running large data pipelines with Hive, Impala, Oozie and SQL.",
      "Outside work I design and make things: 3D in Blender, animation, UI and UX, and small web tools. The extensions and apps on this page are where those two sides meet."
    ],
    facts: [
      {
        title: "Now",
        items: [
          "Program Analyst at Cognizant",
          "Building YTM but Better and a guitar practice tool"
        ]
      },
      {
        title: "Tools",
        items: [
          "Hive, Impala, Oozie, SQL, Spark, Databricks, Linux",
          "Python and web development",
          "Blender, Photoshop, video editing, Canva, UI/UX"
        ]
      },
      {
        title: "Certifications",
        items: [
          "Databricks Associate Data Engineer, May 2026",
          "Databricks Associate Spark Developer, July 2026",
          "Gemini Enterprise Agent (Certified Partner), October 2026"
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------
     SUPPORT ("Buy me a coffee")
     upiId:          your UPI ID, e.g. "name@okbank". Free, works for supporters in India.
     paymentPageUrl: a hosted payment page link (e.g. Razorpay Payment Page) for
                     cards and international supporters. Leave "" until you have one.
     Never put secret API keys in this file. Everyone can read it.
     --------------------------------------------------------------- */
  support: {
    currency: "₹",
    amounts: [50, 100, 250, 500],
    payeeName: "Harshendra Rami",
    upiId: "aerospacerami@oksbi",
    // Pay-by-card in any currency (needs the Razorpay setup in SETUP.md). Leave "" until then.
    checkoutEndpoint: "",          // filled in automatically by: npm run deploy:worker
    paypalMe: "",                  // optional: your PayPal.Me name, e.g. "harshendra"
    // Used only if rates.json has not loaded. Approximate: 1 rupee in each currency.
    fallbackRates: { USD: 0.0113, EUR: 0.0097, GBP: 0.0085, AUD: 0.0174, CAD: 0.0158, SGD: 0.0146, AED: 0.0415 },
    paymentPageUrl: "",   // Razorpay Payment Page link (cards + international). See SETUP.md.
    qr: "img/UPI_Qr.jpeg", // QR for desktop visitors. Regenerate if you change upiId.
    message:
      "If one of these tools saved you time, you can chip in any amount. It's entirely optional, and it pays for the next one."
  }
};
