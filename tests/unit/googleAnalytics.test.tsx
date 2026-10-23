import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CONSENT_KEY, CONSENT_TTL_MS } from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/ga";

vi.mock("next/script", () => ({
  default: (props: { src?: string; id?: string; children?: React.ReactNode }) => (
    <script data-testid="gtag-script" data-src={props.src} id={props.id}>
      {props.children}
    </script>
  ),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { ManageCookiesButton } from "@/components/shared/ManageCookiesButton";
import { setConsentChoice } from "@/components/shared/consentStore";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: { root: Root; container: HTMLElement }[] = [];
function render(ui: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  mounted.push({ root, container });
  return { container, unmount: () => act(() => root.unmount()) };
}
function cleanup() {
  while (mounted.length) {
    const m = mounted.pop()!;
    act(() => m.root.unmount());
    m.container.remove();
  }
}
const screen = {
  getByRole(role: string, opts: { name?: string | RegExp } = {}) {
    const sel = role === "dialog" ? "[role=dialog]" : role === "button" ? "button" : "a";
    const found = [...document.querySelectorAll<HTMLElement>(sel)].filter((e) =>
      opts.name === undefined ? true : typeof opts.name === "string" ? e.textContent?.trim() === opts.name : opts.name.test(e.textContent ?? ""),
    );
    if (found.length !== 1) throw new Error("getByRole " + role + " : " + found.length + " trouvé(s)");
    return found[0];
  },
  queryByRole(role: string, opts: { name?: string } = {}) {
    if (role === "dialog") return document.querySelector("[role=dialog]");
    return [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === opts.name) ?? null;
  },
};
const fireEvent = { click: (el: HTMLElement) => act(() => el.dispatchEvent(new MouseEvent("click", { bubbles: true }))) };

function setHost(hostname: string) {
  vi.stubGlobal("location", { ...window.location, hostname });
}

function storeConsent(choice: "accepted" | "refused") {
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, at: Date.now() }));
}

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GoogleAnalytics", () => {
  it("l'identifiant est bien G-SSZ093WHH7 (zéro)", () => {
    expect(GA_MEASUREMENT_ID).toBe("G-SSZ093WHH7");
  });

  it("ne charge rien sans choix, ni après un refus, même en production sur le bon domaine", () => {
    vi.stubEnv("NODE_ENV", "production");
    setHost("allianceconsultants.net");
    const { container, unmount } = render(<GoogleAnalytics />);
    expect(container.querySelector("script")).toBeNull();
    unmount();
    storeConsent("refused");
    const again = render(<GoogleAnalytics />);
    expect(again.container.querySelector("script")).toBeNull();
  });

  it("ne charge rien en développement, même après accord", () => {
    vi.stubEnv("NODE_ENV", "development");
    setHost("allianceconsultants.net");
    storeConsent("accepted");
    const { container } = render(<GoogleAnalytics />);
    expect(container.querySelector("script")).toBeNull();
  });

  it("ne charge rien hors des bons domaines, même après accord en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    setHost("localhost");
    storeConsent("accepted");
    const { container } = render(<GoogleAnalytics />);
    expect(container.querySelector("script")).toBeNull();
  });

  it("charge gtag.js avec la configuration sans signaux publicitaires après accord", () => {
    vi.stubEnv("NODE_ENV", "production");
    setHost("www.allianceconsultants.net");
    storeConsent("accepted");
    const { container } = render(<GoogleAnalytics />);
    const scripts = container.querySelectorAll("script");
    expect(scripts).toHaveLength(2);
    expect(scripts[0].getAttribute("data-src")).toBe(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
    expect(scripts[1].textContent).toContain(`gtag('config', '${GA_MEASUREMENT_ID}'`);
    expect(scripts[1].textContent).toContain("cookie_expires: 34128000");
    expect(scripts[1].textContent).toContain("allow_google_signals: false");
    expect(scripts[1].textContent).toContain("allow_ad_personalization_signals: false");
  });
});

describe("CookieConsent", () => {
  it("s'affiche au premier passage avec deux boutons et un lien vers la politique", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accepter" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Refuser" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /politique de confidentialité/i }).getAttribute("href")).toContain("/privacy");
  });

  it("mémorise le choix puis disparaît ; « Gérer mes cookies » le rouvre", () => {
    render(
      <>
        <CookieConsent />
        <ManageCookiesButton />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Refuser" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(CONSENT_KEY)!).choice).toBe("refused");
    fireEvent.click(screen.getByRole("button", { name: "Gérer mes cookies" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Accepter" }));
    expect(JSON.parse(window.localStorage.getItem(CONSENT_KEY)!).choice).toBe("accepted");
  });

  it("le retrait de l'accord efface les cookies _ga du document", () => {
    document.cookie = "_ga=GA1.1.1; path=/";
    document.cookie = "_ga_SSZ093WHH7=GS1; path=/";
    document.cookie = "autre=1; path=/";
    storeConsent("accepted");
    render(<CookieConsent />);
    expect(screen.queryByRole("dialog")).toBeNull();
    // réouverture puis refus
    render(<ManageCookiesButton />);
    fireEvent.click(screen.getByRole("button", { name: "Gérer mes cookies" }));
    fireEvent.click(screen.getByRole("button", { name: "Refuser" }));
    expect(document.cookie).not.toContain("_ga");
    expect(document.cookie).toContain("autre=1");
    document.cookie = "autre=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
});

const flag = () => (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`];
const tick = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });

describe("consentStore", () => {
  it("pose le drapeau ga-disable à true au refus et à false à l'acceptation", () => {
    setConsentChoice("refused");
    expect(flag()).toBe(true);
    setConsentChoice("accepted");
    expect(flag()).toBe(false);
  });

  it("garde le choix en mémoire quand localStorage lève une exception", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage")!;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    try {
      render(<CookieConsent />);
      expect(screen.queryByRole("dialog")).not.toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Refuser" }));
      expect(screen.queryByRole("dialog")).toBeNull();
    } finally {
      Object.defineProperty(window, "localStorage", original);
      setConsentChoice("accepted"); // écriture réussie : vide le repli en mémoire (état partagé entre tests)
    }
  });
});

describe("CookieConsent : validité et réouverture", () => {
  it("un choix de plus de 182 jours ré-affiche le bandeau, un plus récent non", () => {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: "accepted", at: Date.now() - CONSENT_TTL_MS + 60_000 }));
    render(<CookieConsent />);
    expect(screen.queryByRole("dialog")).toBeNull();
    cleanup();
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: "accepted", at: Date.now() - CONSENT_TTL_MS - 1000 }));
    render(<CookieConsent />);
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("Échap ferme le bandeau rouvert sans changer le choix et rend le focus au bouton", async () => {
    storeConsent("accepted");
    render(
      <>
        <CookieConsent />
        <ManageCookiesButton />
      </>,
    );
    const manage = screen.getByRole("button", { name: "Gérer mes cookies" });
    manage.focus();
    fireEvent.click(manage);
    expect(screen.queryByRole("dialog")).not.toBeNull();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    await tick();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(CONSENT_KEY)!).choice).toBe("accepted");
    expect(document.activeElement).toBe(manage);
  });

  it("le bouton Fermer ferme sans changer le choix ; absent au premier passage", async () => {
    render(<CookieConsent />);
    expect(screen.queryByRole("button", { name: "Fermer" })).toBeNull();
    cleanup();
    storeConsent("refused");
    render(
      <>
        <CookieConsent />
        <ManageCookiesButton />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Gérer mes cookies" }));
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    await tick();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(CONSENT_KEY)!).choice).toBe("refused");
  });
});
