"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolEvents } from "@/lib/analytics";

// ─── ANSI palette data ─────────────────────────────────────────────────────

const ANSI_8_COLORS = [
  { label: "Black", fg: 30, bg: 40, hex: "#000000" },
  { label: "Red", fg: 31, bg: 41, hex: "#cc0000" },
  { label: "Green", fg: 32, bg: 42, hex: "#4e9a06" },
  { label: "Yellow", fg: 33, bg: 43, hex: "#c4a000" },
  { label: "Blue", fg: 34, bg: 44, hex: "#3465a4" },
  { label: "Magenta", fg: 35, bg: 45, hex: "#75507b" },
  { label: "Cyan", fg: 36, bg: 46, hex: "#06989a" },
  { label: "White", fg: 37, bg: 47, hex: "#d3d7cf" },
  { label: "Bright Black", fg: 90, bg: 100, hex: "#555753" },
  { label: "Bright Red", fg: 91, bg: 101, hex: "#ef2929" },
  { label: "Bright Green", fg: 92, bg: 102, hex: "#8ae234" },
  { label: "Bright Yellow", fg: 93, bg: 103, hex: "#fce94f" },
  { label: "Bright Blue", fg: 94, bg: 104, hex: "#729fcf" },
  { label: "Bright Magenta", fg: 95, bg: 105, hex: "#ad7fa8" },
  { label: "Bright Cyan", fg: 96, bg: 106, hex: "#34e2e2" },
  { label: "Bright White", fg: 97, bg: 107, hex: "#eeeeec" },
] as const;

type StyleKey = "bold" | "dim" | "italic" | "underline" | "blink" | "strikethrough";

const TEXT_STYLES: { key: StyleKey; code: number; label: string }[] = [
  { key: "bold", code: 1, label: "Bold" },
  { key: "dim", code: 2, label: "Dim" },
  { key: "italic", code: 3, label: "Italic" },
  { key: "underline", code: 4, label: "Underline" },
  { key: "blink", code: 5, label: "Blink" },
  { key: "strikethrough", code: 9, label: "Strike" },
];

type ColorMode = "8color" | "256color" | "truecolor";

interface StyleState {
  bold: boolean;
  dim: boolean;
  italic: boolean;
  underline: boolean;
  blink: boolean;
  strikethrough: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function hex6To256(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round((r - 8) / 247 * 24) + 232;
  }
  const ri = Math.round(r / 255 * 5);
  const gi = Math.round(g / 255 * 5);
  const bi = Math.round(b / 255 * 5);
  return 16 + 36 * ri + 6 * gi + bi;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function buildCodes(
  mode: ColorMode,
  fgColor: string | null,
  bgColor: string | null,
  fg8: (typeof ANSI_8_COLORS)[number] | null,
  bg8: (typeof ANSI_8_COLORS)[number] | null,
  styles: StyleState,
): number[] {
  const codes: number[] = [];

  for (const s of TEXT_STYLES) {
    if (styles[s.key]) codes.push(s.code);
  }

  if (mode === "8color") {
    if (fg8) codes.push(fg8.fg);
    if (bg8) codes.push(bg8.bg);
  } else if (mode === "256color") {
    if (fgColor) codes.push(38, 5, hex6To256(fgColor));
    if (bgColor) codes.push(48, 5, hex6To256(bgColor));
  } else {
    if (fgColor) {
      const [r, g, b] = hexToRgb(fgColor);
      codes.push(38, 2, r, g, b);
    }
    if (bgColor) {
      const [r, g, b] = hexToRgb(bgColor);
      codes.push(48, 2, r, g, b);
    }
  }

  return codes;
}

function codesToEscSeq(codes: number[]): string {
  if (codes.length === 0) return "";
  return `\\033[${codes.join(";")}m`;
}

function generateBash(codes: number[], text: string): string {
  const seq = codes.length ? `\\033[${codes.join(";")}m` : "";
  return `echo -e "${seq}${text}\\033[0m"`;
}

function generatePython(codes: number[], text: string): string {
  const seq = codes.length ? `\\033[${codes.join(";")}m` : "";
  return `print(f"${seq}${text}\\033[0m")`;
}

function generateNode(codes: number[], text: string): string {
  const seq = codes.length ? `\\x1b[${codes.join(";")}m` : "";
  return `console.log(\`${seq}${text}\\x1b[0m\`);`;
}

// ─── 256-color palette grid ────────────────────────────────────────────────

function color256ToHex(n: number): string {
  if (n < 16) {
    const basic = [
      "#000000","#cc0000","#4e9a06","#c4a000","#3465a4","#75507b","#06989a","#d3d7cf",
      "#555753","#ef2929","#8ae234","#fce94f","#729fcf","#ad7fa8","#34e2e2","#eeeeec",
    ];
    return basic[n];
  }
  if (n >= 232) {
    const v = 8 + (n - 232) * 10;
    const h = v.toString(16).padStart(2, "0");
    return `#${h}${h}${h}`;
  }
  const idx = n - 16;
  const b = idx % 6;
  const g = Math.floor(idx / 6) % 6;
  const r = Math.floor(idx / 36);
  const toV = (x: number) => x === 0 ? 0 : 55 + x * 40;
  const toH = (x: number) => toV(x).toString(16).padStart(2, "0");
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

interface Palette256Props {
  selected: number | null;
  onSelect: (n: number) => void;
}

function Palette256({ selected, onSelect }: Palette256Props) {
  return (
    <div className="space-y-1">
      {/* Basic 16 */}
      <div className="grid grid-cols-16 gap-px" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
        {Array.from({ length: 16 }, (_, i) => (
          <button
            key={i}
            title={`Color ${i}`}
            onClick={() => onSelect(i)}
            className={`h-5 w-full rounded-sm ring-offset-1 transition-all ${selected === i ? "ring-2 ring-white" : "hover:scale-110"}`}
            style={{ backgroundColor: color256ToHex(i) }}
          />
        ))}
      </div>
      {/* 6×6×6 cube */}
      <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(36, minmax(0, 1fr))" }}>
        {Array.from({ length: 216 }, (_, i) => i + 16).map((n) => (
          <button
            key={n}
            title={`Color ${n}`}
            onClick={() => onSelect(n)}
            className={`h-3 w-full rounded-none transition-all ${selected === n ? "ring-1 ring-white ring-offset-1" : "hover:scale-110"}`}
            style={{ backgroundColor: color256ToHex(n) }}
          />
        ))}
      </div>
      {/* Grayscale ramp */}
      <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
        {Array.from({ length: 24 }, (_, i) => i + 232).map((n) => (
          <button
            key={n}
            title={`Color ${n}`}
            onClick={() => onSelect(n)}
            className={`h-4 w-full rounded-sm transition-all ${selected === n ? "ring-2 ring-white ring-offset-1" : "hover:scale-110"}`}
            style={{ backgroundColor: color256ToHex(n) }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Copy button ───────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    ToolEvents.resultCopied();
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-1.5 h-8 px-3 text-xs">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {label ?? "Copy"}
    </Button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function AnsiColorCodeGeneratorTool() {
  const [colorMode, setColorMode] = useState<ColorMode>("truecolor");
  const [sampleText, setSampleText] = useState("Hello, World!");

  // 8-color selections
  const [fg8Idx, setFg8Idx] = useState<number | null>(null);
  const [bg8Idx, setBg8Idx] = useState<number | null>(null);

  // 256-color selections
  const [fg256, setFg256] = useState<number | null>(null);
  const [bg256, setBg256] = useState<number | null>(null);

  // True-color selections
  const [fgHex, setFgHex] = useState("#22d3ee");
  const [bgHex, setBgHex] = useState<string | null>(null);
  const [bgEnabled, setBgEnabled] = useState(false);

  const [styles, setStyles] = useState<StyleState>({
    bold: false,
    dim: false,
    italic: false,
    underline: false,
    blink: false,
    strikethrough: false,
  });

  const toggleStyle = (key: StyleKey) =>
    setStyles((s) => ({ ...s, [key]: !s[key] }));

  const reset = () => {
    setFg8Idx(null);
    setBg8Idx(null);
    setFg256(null);
    setBg256(null);
    setFgHex("#22d3ee");
    setBgHex(null);
    setBgEnabled(false);
    setStyles({ bold: false, dim: false, italic: false, underline: false, blink: false, strikethrough: false });
  };

  // Derive codes
  const fgColor = colorMode === "truecolor" ? fgHex : colorMode === "256color" && fg256 !== null ? color256ToHex(fg256) : null;
  const bgColor = colorMode === "truecolor" && bgEnabled ? (bgHex ?? null) : colorMode === "256color" && bg256 !== null ? color256ToHex(bg256) : null;

  const fg8 = colorMode === "8color" && fg8Idx !== null ? ANSI_8_COLORS[fg8Idx] : null;
  const bg8 = colorMode === "8color" && bg8Idx !== null ? ANSI_8_COLORS[bg8Idx] : null;

  const codes = buildCodes(colorMode, fgColor, bgColor, fg8, bg8, styles);
  const escSeq = codesToEscSeq(codes);

  const previewFg = fg8?.hex ?? fgColor ?? undefined;
  const previewBg = bg8?.hex ?? bgColor ?? undefined;

  const previewStyle: React.CSSProperties = {
    color: previewFg,
    backgroundColor: previewBg,
    fontWeight: styles.bold ? "bold" : undefined,
    fontStyle: styles.italic ? "italic" : undefined,
    textDecoration: [
      styles.underline ? "underline" : "",
      styles.strikethrough ? "line-through" : "",
    ].filter(Boolean).join(" ") || undefined,
    opacity: styles.dim ? 0.55 : 1,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Color mode switcher */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Color Mode</h2>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5 h-8 px-3 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["8color", "256color", "truecolor"] as ColorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setColorMode(m); ToolEvents.toolUsed(m); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                colorMode === m
                  ? "bg-brand text-white border-brand"
                  : "bg-muted/30 border-border/50 hover:border-brand/50"
              }`}
            >
              {m === "8color" ? "8 Colors" : m === "256color" ? "256 Colors" : "True Color (RGB)"}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker panel */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
        <h2 className="font-semibold text-lg">Colors</h2>

        {colorMode === "8color" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Foreground (text) color</p>
              <div className="grid grid-cols-8 gap-1.5">
                {ANSI_8_COLORS.map((c, i) => (
                  <button
                    key={c.label}
                    title={c.label}
                    onClick={() => setFg8Idx(i === fg8Idx ? null : i)}
                    className={`h-8 rounded-md border-2 transition-all ${
                      fg8Idx === i ? "border-white scale-110 shadow-lg" : "border-transparent hover:border-white/50"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Background color</p>
              <div className="grid grid-cols-8 gap-1.5">
                {ANSI_8_COLORS.map((c, i) => (
                  <button
                    key={c.label}
                    title={c.label}
                    onClick={() => setBg8Idx(i === bg8Idx ? null : i)}
                    className={`h-8 rounded-md border-2 transition-all ${
                      bg8Idx === i ? "border-white scale-110 shadow-lg" : "border-transparent hover:border-white/50"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Click a color to select; click again to deselect.</p>
          </div>
        )}

        {colorMode === "256color" && (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Foreground (text) — selected: {fg256 !== null ? `#${fg256}` : "none"}</p>
              <Palette256 selected={fg256} onSelect={(n) => setFg256(fg256 === n ? null : n)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Background — selected: {bg256 !== null ? `#${bg256}` : "none"}</p>
              <Palette256 selected={bg256} onSelect={(n) => setBg256(bg256 === n ? null : n)} />
            </div>
            <p className="text-xs text-muted-foreground">Click a swatch to select; click again to deselect.</p>
          </div>
        )}

        {colorMode === "truecolor" && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Foreground (text) color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fgHex}
                  onChange={(e) => setFgHex(e.target.value)}
                  className="h-10 w-16 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <span className="font-mono text-sm">{fgHex.toUpperCase()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Background color</label>
                <button
                  onClick={() => setBgEnabled(!bgEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${bgEnabled ? "bg-brand" : "bg-muted"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${bgEnabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {bgEnabled && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgHex ?? "#1e1e1e"}
                    onChange={(e) => setBgHex(e.target.value)}
                    className="h-10 w-16 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-sm">{(bgHex ?? "#1e1e1e").toUpperCase()}</span>
                </div>
              )}
              {!bgEnabled && (
                <p className="text-xs text-muted-foreground">Toggle to add a background color.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Text styles */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="font-semibold text-lg mb-4">Text Styles</h2>
        <div className="flex flex-wrap gap-2">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleStyle(s.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                styles[s.key]
                  ? "bg-brand text-white border-brand"
                  : "bg-muted/30 border-border/50 hover:border-brand/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sample text input */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <label className="font-semibold text-lg block mb-3">Sample Text</label>
        <input
          type="text"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Enter text to preview…"
          className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      {/* Terminal preview */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Terminal Preview</h2>
          <CopyButton text={escSeq} label="Copy Escape Sequence" />
        </div>
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 font-mono text-sm">
          {/* Terminal title bar */}
          <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-zinc-800">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-zinc-500">bash</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-green-400">user@machine</span>
              <span className="text-zinc-500">~$</span>
              <span className="text-zinc-300">echo -e &quot;...styled text...&quot;</span>
            </div>
            <div className="mt-2 pl-0">
              <span
                style={previewStyle}
                className={styles.blink ? "animate-pulse" : ""}
              >
                {sampleText || "Hello, World!"}
              </span>
            </div>
          </div>
        </div>

        {/* Escape sequence display */}
        <div className="mt-4 rounded-lg bg-muted/30 border border-border/50 px-4 py-3 flex items-center justify-between gap-3">
          <code className="text-xs font-mono text-brand break-all">
            {escSeq || "(no styles applied — all defaults)"}
          </code>
        </div>
      </div>

      {/* Code snippets */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="font-semibold text-lg mb-4">Code Snippets</h2>
        <Tabs defaultValue="bash">
          <TabsList className="mb-4">
            <TabsTrigger value="bash">Bash / Shell</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="node">Node.js</TabsTrigger>
          </TabsList>

          {(["bash", "python", "node"] as const).map((lang) => {
            const code =
              lang === "bash"
                ? generateBash(codes, sampleText)
                : lang === "python"
                ? generatePython(codes, sampleText)
                : generateNode(codes, sampleText);
            return (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <pre className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 text-sm font-mono text-zinc-200 overflow-x-auto whitespace-pre-wrap break-all">
                    {code}
                  </pre>
                  <div className="absolute top-3 right-3">
                    <CopyButton text={code} />
                  </div>
                </div>
                {lang === "bash" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Use <code className="font-mono bg-muted px-1 rounded">echo -e</code> to interpret escape sequences. On macOS with Zsh, use <code className="font-mono bg-muted px-1 rounded">print -P</code> or install <code className="font-mono bg-muted px-1 rounded">coreutils</code>.
                  </p>
                )}
                {lang === "python" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Works in Python 3.x. For Windows compatibility add <code className="font-mono bg-muted px-1 rounded">import colorama; colorama.init()</code> before printing.
                  </p>
                )}
                {lang === "node" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Works in Node.js v12+. Use template literals with <code className="font-mono bg-muted px-1 rounded">\x1b</code> escape sequences. Set <code className="font-mono bg-muted px-1 rounded">FORCE_COLOR=1</code> if colors are stripped by CI.
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* ANSI code reference */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Reference</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Style Codes</p>
            <div className="space-y-1 text-xs font-mono">
              {[
                ["\\033[0m", "Reset all"],
                ["\\033[1m", "Bold"],
                ["\\033[2m", "Dim"],
                ["\\033[3m", "Italic"],
                ["\\033[4m", "Underline"],
                ["\\033[5m", "Blink"],
                ["\\033[9m", "Strikethrough"],
              ].map(([code, label]) => (
                <div key={code} className="flex gap-2">
                  <span className="text-brand">{code}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Color Formats</p>
            <div className="space-y-1 text-xs font-mono">
              {[
                ["\\033[3Nm", "8-color foreground (N=0–7)"],
                ["\\033[4Nm", "8-color background (N=0–7)"],
                ["\\033[9Nm", "Bright foreground (N=0–7)"],
                ["\\033[38;5;Nm", "256-color foreground"],
                ["\\033[48;5;Nm", "256-color background"],
                ["\\033[38;2;R;G;Bm", "True-color foreground"],
                ["\\033[48;2;R;G;Bm", "True-color background"],
              ].map(([code, label]) => (
                <div key={code} className="flex gap-2">
                  <span className="text-brand-accent shrink-0">{code}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
