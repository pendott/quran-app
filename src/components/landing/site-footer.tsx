import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Quran Class</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
            Scheduling, payments, live classes, and progress for Quran recitation schools.
          </p>
        </div>
        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="font-semibold text-slate-900">Product</p>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>
                <Link href="/#features" className="hover:text-slate-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Roles</p>
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>
                <Link href="/login?callbackUrl=%2Fadmin" className="hover:text-slate-900">
                  Admin
                </Link>
              </li>
              <li>
                <Link href="/login?callbackUrl=%2Fteacher" className="hover:text-slate-900">
                  Teacher
                </Link>
              </li>
              <li>
                <Link href="/login?callbackUrl=%2Fstudents" className="hover:text-slate-900">
                  Student / Parent
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Quran Class. All rights reserved.
      </div>
    </footer>
  );
}
