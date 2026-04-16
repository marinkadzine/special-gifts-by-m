import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  ANDROID_APK_DOWNLOAD_URL,
  ANDROID_APP_VERSION,
  ANDROID_INSTALL_STEPS,
  ANDROID_RELEASE_DATE,
  ANDROID_RELEASE_NOTES,
  ANDROID_UPDATE_CHANNELS,
  ANDROID_UPDATE_STEPS,
  GITHUB_RELEASES_URL,
  LIVE_SITE_URL,
} from "@/lib/app-distribution";

export default function DownloadPage() {
  return (
    <main>
      <SiteHeader />
      <div className="space-y-12 pb-16 pt-8">
        <section className="shell">
          <div className="glass rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[var(--mauve)]">
              Download App
            </p>
            <div className="mt-4 grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h1 className="font-display text-4xl text-[var(--berry)] md:text-6xl">
                  Install or update the Android app from one trusted page
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--mauve)]">
                  Customers should always use this page when they need the latest Android APK,
                  install help, or update instructions. The web app stays available at{" "}
                  <a className="font-bold text-[var(--rose-deep)]" href={LIVE_SITE_URL}>
                    {LIVE_SITE_URL}
                  </a>{" "}
                  for anyone who prefers using the browser.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href={ANDROID_APK_DOWNLOAD_URL} className="button-primary text-center">
                    Download Android App
                  </a>
                  <a href={LIVE_SITE_URL} className="button-secondary text-center">
                    Open Web App
                  </a>
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-white/80 p-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
                  Current Android release
                </p>
                <p className="mt-4 font-display text-4xl text-[var(--berry)]">v{ANDROID_APP_VERSION}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--mauve)]">
                  Released on {ANDROID_RELEASE_DATE}
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--berry)]">
                  Use the same APK link every time. Each new GitHub Release replaces the latest app
                  download for customers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="shell grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.8rem] border border-white/40 bg-white/78 p-6 shadow-[var(--shadow)] lg:col-span-2">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              What customers should do
            </p>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl text-[var(--berry)]">First install</h2>
                <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
                  {ANDROID_INSTALL_STEPS.map((step, index) => (
                    <li key={step}>
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h2 className="font-display text-3xl text-[var(--berry)]">Future updates</h2>
                <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
                  {ANDROID_UPDATE_STEPS.map((step, index) => (
                    <li key={step}>
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/40 bg-white/78 p-6 shadow-[var(--shadow)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              Update notices
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--berry)]">
              {ANDROID_UPDATE_CHANNELS.map((channel) => (
                <li key={channel}>{channel}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-7 text-[var(--mauve)]">
              Direct APK apps do not update automatically like Google Play apps. Customers should
              use this page whenever you announce a new release.
            </p>
          </div>
        </section>

        <section className="shell">
          <div className="rounded-[1.8rem] border border-white/40 bg-white/78 p-6 shadow-[var(--shadow)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--mauve)]">
              Release notes
            </p>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-[var(--berry)] md:grid-cols-2">
              {ANDROID_RELEASE_NOTES.map((note) => (
                <li key={note} className="rounded-[1.2rem] bg-[var(--light-grey)] px-4 py-3">
                  {note}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={ANDROID_APK_DOWNLOAD_URL} className="button-primary text-center">
                Download Latest APK
              </a>
              <a href={GITHUB_RELEASES_URL} className="button-secondary text-center">
                View Release Page
              </a>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
