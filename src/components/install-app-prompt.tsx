"use client";

import { useEffect, useState } from "react";
import { ANDROID_APK_DOWNLOAD_URL, DOWNLOAD_PAGE_URL } from "@/lib/app-distribution";

const DISMISS_KEY = "sgm-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function getInitialVisibilityState() {
  if (typeof window === "undefined") {
    return {
      isVisible: false,
      showIosInstructions: false,
    };
  }

  if (window.localStorage.getItem(DISMISS_KEY) || isStandaloneMode()) {
    return {
      isVisible: false,
      showIosInstructions: false,
    };
  }

  const showIosInstructions = isIosDevice();

  return {
    isVisible: showIosInstructions,
    showIosInstructions,
  };
}

export function InstallAppPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visibilityState, setVisibilityState] = useState(getInitialVisibilityState);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.localStorage.getItem(DISMISS_KEY) || isStandaloneMode()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisibilityState({
        isVisible: true,
        showIosInstructions: false,
      });
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(DISMISS_KEY, "installed");
      setInstallPrompt(null);
      setVisibilityState({
        isVisible: false,
        showIosInstructions: false,
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      window.localStorage.setItem(DISMISS_KEY, "installed");
      setVisibilityState({
        isVisible: false,
        showIosInstructions: false,
      });
    } else {
      setInstallPrompt(null);
    }
  }

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_KEY, "dismissed");
    setVisibilityState({
      isVisible: false,
      showIosInstructions: false,
    });
  }

  if (!visibilityState.isVisible) {
    return null;
  }

  return (
    <div className="mt-6 rounded-[1.5rem] border border-white/40 bg-white/72 p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
        Install Special Gifts by M
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--berry)]">
        Use the web app in your browser, or install it on your phone for quick full-screen access,
        easier repeat ordering, and a more app-like experience.
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--mauve)]">
        Need the Android APK or future app updates? Use the live download page below.
      </p>
      {visibilityState.showIosInstructions ? (
        <p className="mt-3 text-sm leading-7 text-[var(--mauve)]">
          On iPhone or iPad, tap the Share button in Safari and choose <strong>Add to Home Screen</strong>.
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {installPrompt ? (
          <button type="button" className="button-primary text-center" onClick={handleInstall}>
            Install App
          </button>
        ) : null}
        <a href={DOWNLOAD_PAGE_URL} className="button-secondary text-center">
          Download Page
        </a>
        <a href={ANDROID_APK_DOWNLOAD_URL} className="button-secondary text-center">
          Android APK
        </a>
        <button type="button" className="button-secondary text-center" onClick={handleDismiss}>
          {visibilityState.showIosInstructions ? "Hide Tips" : "Maybe Later"}
        </button>
      </div>
    </div>
  );
}
