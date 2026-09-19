'use client';

import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  githubId: number;
  username: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('http://localhost:4000/auth/me', {
          credentials: 'include', // Send cookies with the request
        });

        if (!res.ok) {
          throw new Error('Authentication failed. Please log in again.');
        }

        const data = await res.json();
        setUser(data.user ?? data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching user data from the server.');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:4000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/';
    } catch (err) {
      console.error('Error occurred while logging out:', err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-slate-400">در حال دریافت اطلاعات توسعه‌دهنده...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-6 max-w-md text-center">
          <h2 className="text-red-400 font-semibold mb-2">خطا در احراز هویت</h2>
          <p className="text-sm text-slate-300 mb-4">{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-sm transition-colors"
          >
            بازگشت به صفحه اصلی
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Bar */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-14 h-14 rounded-full ring-2 ring-indigo-500/50 object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-50">
                {user.displayName || user.username}
              </h1>
              <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800 text-slate-300 hover:text-red-400 rounded-lg text-sm transition-all"
          >
            خروج از حساب
          </button>
        </header>

        {/* Intelligence Cards Placeholder */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
            <span className="text-xs font-mono text-slate-400">شناسه سیستمی (ID)</span>
            <p className="text-sm font-mono text-indigo-400 truncate">{user.id}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
            <span className="text-xs font-mono text-slate-400">GitHub ID</span>
            <p className="text-lg font-semibold text-slate-200">{user.githubId}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-2">
            <span className="text-xs font-mono text-slate-400">ایمیل ثبت‌شده</span>
            <p className="text-sm font-medium text-slate-200 truncate">{user.email || 'عدم ثبت ایمیل عمومی'}</p>
          </div>
        </section>

        {/* Phase 3 Teaser */}
        <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3">
          <h3 className="text-base font-semibold text-slate-300">موتور تحلیل داده (Phase 3) در حال آماده‌سازی است</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            در فاز بعد، با اتصال به صف‌های BullMQ و تحلیل عمیق ریپازیتوری‌های گیت‌هاب، گراف ارتباطی و استک فنی شما در این بخش مصورسازی خواهد شد.
          </p>
        </div>
      </div>
    </main>
  );
}