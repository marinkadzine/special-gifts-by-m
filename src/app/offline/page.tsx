import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="shell flex min-h-[70vh] items-center py-10">
      <section className="glass w-full rounded-[2rem] p-8 md:p-12">
        <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-[var(--mauve)]">
          You&apos;re offline
        </p>
        <h1 className="mt-3 font-display text-5xl text-[var(--berry)] md:text-6xl">
          The app is still here, but the internet stepped out.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--mauve)]">
          Reconnect to keep browsing the full catalogue and placing orders. If you have already visited
          some pages, parts of the store may still open from your device cache.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="button-primary text-center">
            Try Home Again
          </Link>
          <Link href="/checkout" className="button-secondary text-center">
            Open Checkout
          </Link>
        </div>
      </section>
    </main>
  );
}
