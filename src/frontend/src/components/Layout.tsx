import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { Dumbbell, Plus, TrendingUp, History } from 'lucide-react';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { SiCaffeine } from 'react-icons/si';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 dark:from-orange-700 dark:via-orange-600 dark:to-amber-600 text-white overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/hero-fitness.dim_1200x600.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        
        <div className="relative container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl group-hover:bg-white/30 transition-all">
                <Dumbbell className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">WORKOUT TRACKER</h1>
                <p className="text-xs text-white/90 font-medium">Track Your Progress</p>
              </div>
            </Link>
            
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 py-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-orange-500 [&.active]:text-white"
                activeProps={{ className: 'active' }}
              >
                <History className="h-4 w-4" />
                History
              </Link>
              <Link
                to="/add"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-orange-500 [&.active]:text-white"
                activeProps={{ className: 'active' }}
              >
                <Plus className="h-4 w-4" />
                Add Workout
              </Link>
              <Link
                to="/progression"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-orange-500 [&.active]:text-white"
                activeProps={{ className: 'active' }}
              >
                <TrendingUp className="h-4 w-4" />
                Progression
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Workout Tracker. All rights reserved.
            </p>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              Built with <SiCaffeine className="h-4 w-4 text-orange-500 group-hover:text-orange-600 transition-colors" /> using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
