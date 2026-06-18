export const siteConfig = {
  // ====== CUSTOMIZE THESE FOR EACH TOOL ======
  name: "ANSI Color Code Generator",
  title: "ANSI Color Code Generator — Terminal Colors & Escape Codes",
  description:
    "Generate ANSI escape codes for terminal text styling. Supports 8-color, 256-color, and 24-bit true-color modes with bold, italic, underline, and more. Copy ready-to-use code for bash, Python, and Node.js.",
  url: "https://ansi-color-code-generator.tools.jagodana.com",
  ogImage: "/opengraph-image",

  // Header
  headerIcon: "Terminal", // lucide-react icon name
  brandAccentColor: "#06b6d4", // hex accent for OG image gradient (must match --brand-accent in globals.css)

  // SEO
  keywords: [
    "ANSI escape codes",
    "terminal color codes",
    "ANSI color generator",
    "bash color codes",
    "terminal text styling",
    "256 color terminal",
    "true color terminal",
    "ANSI codes generator",
    "shell color codes",
    "terminal formatting",
    "bash escape codes",
    "Python terminal colors",
    "Node.js terminal colors",
    "ANSI bold italic underline",
    "terminal text colors online",
  ],
  applicationCategory: "DeveloperApplication",

  // Theme
  themeColor: "#8b5cf6", // violet-500

  // Branding
  creator: "Jagodana",
  creatorUrl: "https://jagodana.com",
  twitterHandle: "@jagodana",

  // Social Profiles (for Organization schema sameAs)
  socialProfiles: [
    "https://twitter.com/jagodana",
  ],

  // Links
  links: {
    github:
      "https://github.com/Jagodana-Studio-Private-Limited/ansi-color-code-generator",
    website: "https://jagodana.com",
  },

  // Footer
  footer: {
    about:
      "Free online ANSI escape code generator. Build terminal color codes visually and copy ready-to-use snippets for bash, Python, and Node.js — no signup required.",
    featuresTitle: "Features",
    features: [
      "8-color, 256-color & true-color (RGB) modes",
      "Bold, italic, underline, dim & blink styles",
      "Live terminal preview",
      "Code snippets for bash, Python & Node.js",
    ],
  },

  // Hero Section
  hero: {
    badge: "Terminal Styling Made Easy",
    titleLine1: "Generate ANSI",
    titleGradient: "Escape Codes Instantly",
    subtitle:
      "Pick colors and styles visually, then copy the exact escape codes for your terminal scripts. Supports 8-color, 256-color, and true-color (24-bit RGB) modes.",
  },

  // Feature Cards (shown on homepage)
  featureCards: [
    {
      icon: "🎨",
      title: "8 / 256 / True Color",
      description:
        "Switch between classic 8-color mode, the full 256-color palette, or 24-bit RGB for precise terminal colors.",
    },
    {
      icon: "✨",
      title: "Text Style Options",
      description:
        "Apply bold, italic, underline, dim, blink, and strikethrough — mix and match any combination.",
    },
    {
      icon: "📋",
      title: "Ready-to-Use Snippets",
      description:
        "One-click copy of escape codes for bash/shell, Python, and Node.js. No memorizing escape sequences.",
    },
  ],

  // Related Tools (cross-linking to sibling Jagodana tools for internal SEO)
  relatedTools: [
    {
      name: "Color Palette Generator",
      url: "https://color-palette-generator.tools.jagodana.com",
      icon: "🎨",
      description: "Generate beautiful color palettes for your projects.",
    },
    {
      name: "Color Format Converter",
      url: "https://color-format-converter.tools.jagodana.com",
      icon: "🔄",
      description: "Convert between HEX, RGB, HSL, and other color formats.",
    },
    {
      name: "Regex Playground",
      url: "https://regex-playground.tools.jagodana.com",
      icon: "🧪",
      description: "Build, test & debug regular expressions in real-time.",
    },
    {
      name: "Git Command Builder",
      url: "https://git-command-builder.tools.jagodana.com",
      icon: "⚡",
      description: "Build complex git commands with a visual interface.",
    },
    {
      name: "Cron Expression Builder",
      url: "https://cron-expression-builder.tools.jagodana.com",
      icon: "⏰",
      description: "Build and validate cron expressions visually.",
    },
    {
      name: "Base64 Image Encoder",
      url: "https://base64-image-encoder.tools.jagodana.com",
      icon: "🔐",
      description: "Encode images to base64 for embedding in CSS or HTML.",
    },
  ],

  // HowTo Steps (drives HowTo JSON-LD schema for rich results)
  howToSteps: [
    {
      name: "Choose Color Mode",
      text: "Select 8-color for classic ANSI support, 256-color for the extended palette, or True Color (RGB) for full 24-bit color.",
      url: "",
    },
    {
      name: "Pick Colors and Styles",
      text: "Choose foreground and background colors using the color picker or palette grid. Toggle text styles like bold, italic, underline, dim, or blink.",
      url: "",
    },
    {
      name: "Preview and Copy",
      text: "See a live terminal preview with your styled text. Switch between bash, Python, and Node.js tabs and click Copy to grab the escape codes.",
      url: "",
    },
  ],
  howToTotalTime: "PT1M",

  // FAQ
  faq: [
    {
      question: "What are ANSI escape codes?",
      answer:
        "ANSI escape codes are sequences of characters that control text formatting, color, and other visual attributes in terminal emulators. They start with the ESC character (\\033 or \\e) followed by bracket and parameters. For example, \\033[31m sets the foreground color to red.",
    },
    {
      question: "What is the difference between 8-color, 256-color, and true-color modes?",
      answer:
        "8-color mode uses ANSI codes 30–37 (foreground) and 40–47 (background) for classic terminal colors. 256-color mode (\\033[38;5;Nm) expands this to 256 colors — 16 basic, a 6×6×6 color cube, and 24 grayscale shades. True-color (24-bit) mode (\\033[38;2;R;G;Bm) supports the full RGB color space with over 16 million colors.",
    },
    {
      question: "Which terminals support true-color (24-bit) ANSI codes?",
      answer:
        "Most modern terminals support true-color: iTerm2, Alacritty, Kitty, Windows Terminal, GNOME Terminal, Konsole, and recent versions of tmux. You can check support by setting the COLORTERM environment variable — if it is 'truecolor' or '24bit', the terminal supports it.",
    },
    {
      question: "How do I use ANSI codes in Python?",
      answer:
        "In Python, use print() with an f-string or string concatenation containing the escape sequences. Alternatively, use the colorama library for cross-platform compatibility. The generator produces ready-to-paste Python print() statements for each style combination.",
    },
    {
      question: "Do ANSI codes work on Windows?",
      answer:
        "Yes — Windows 10 version 1511 and later (and all of Windows 11) support ANSI escape codes in the Windows Console and Windows Terminal. In Python, import colorama and call colorama.init() for compatibility with older Windows versions.",
    },
    {
      question: "What does the reset code \\033[0m do?",
      answer:
        "\\033[0m resets all text attributes (color, bold, italic, underline, etc.) back to the terminal's default. Always append a reset at the end of styled text so subsequent output is not accidentally styled.",
    },
  ],

  // ====== PAGES (for sitemap + per-page SEO) ======
  pages: {
    "/": {
      title:
        "ANSI Color Code Generator — Terminal Colors & Escape Codes",
      description:
        "Generate ANSI escape codes for terminal text styling. Supports 8-color, 256-color, and 24-bit true-color modes with bold, italic, underline, and more.",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
