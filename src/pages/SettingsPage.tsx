// Settings Page
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input } from '../components/ui';
import { Moon, Sun, Bell, Shield, Palette, LogOut, User, Mail, Key, Trash, Info, Github } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUIStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export function SettingsPage() {
  const { user, profile, isGhost, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme, setTheme } = useUIStore();
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm('This will permanently delete your account and all data. Are you sure?')) {
      if (confirm('Type "DELETE" to confirm:')) {
        // In real app, call a Supabase Edge Function to delete user
        alert('Account deletion would be implemented via Supabase Edge Function');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-6 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-title1 font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-body text-[var(--color-text-secondary)] mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card variant="glass">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[var(--color-pillar-vision)]" />
            <h2 className="text-headline font-semibold text-[var(--color-text-primary)]">Profile</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-[var(--color-pillar-vision)]/20 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[var(--color-pillar-vision)]">
                  {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || (isGhost ? 'G' : 'U')}
                </span>
              )}
            </div>
            <div className="flex-1">
              <Input
                label="Display Name"
                value={profile?.display_name || ''}
                onChange={e => updateProfile({ display_name: e.target.value })}
                placeholder="Your name"
              />
              <p className="mt-1 text-caption text-[var(--color-text-muted)]">
                {isGhost ? 'Ghost Mode' : user?.email}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card variant="glass">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[var(--color-pillar-skills)]" />
            <h2 className="text-headline font-semibold text-[var(--color-text-primary)]">Appearance</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                theme === 'light'
                  ? 'border-[var(--color-pillar-skills)] bg-[var(--color-pillar-skills)]/10'
                  : 'border-[var(--color-border-light)] hover:border-[var(--color-border-medium)]'
              )}
            >
              <Sun className="h-8 w-8 text-[var(--color-text-secondary)]" />
              <span className="text-body font-medium text-[var(--color-text-primary)]">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                theme === 'dark'
                  ? 'border-[var(--color-pillar-skills)] bg-[var(--color-pillar-skills)]/10'
                  : 'border-[var(--color-border-light)] hover:border-[var(--color-border-medium)]'
              )}
            >
              <Moon className="h-8 w-8 text-[var(--color-text-secondary)]" />
              <span className="text-body font-medium text-[var(--color-text-primary)]">Dark</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card variant="glass">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--color-pillar-health)]" />
            <h2 className="text-headline font-semibold text-[var(--color-text-primary)]">Notifications</h2>
          </div>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-body text-[var(--color-text-primary)]">Daily Reminders</p>
              <p className="text-caption text-[var(--color-text-muted)]">Get notified for prayers, habits, and check-ins</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={e => setNotifications(e.target.checked)}
              className="h-5 w-5 rounded border-[var(--color-border-medium)] bg-[var(--color-bg-primary)] text-[var(--color-pillar-skills)] focus:ring-[var(--color-pillar-skills)]"
            />
          </label>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card variant="glass">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--color-pillar-addiction)]" />
            <h2 className="text-headline font-semibold text-[var(--color-text-primary)]">Privacy & Security</h2>
          </div>
          
          <div className="space-y-3">
            {isGhost ? (
              <SettingsRow icon={Shield} label="Account" value="Ghost Mode" />
            ) : (
              <>
            <SettingsRow icon={Mail} label="Email" value={user?.email || 'Not set'} />
            <SettingsRow icon={Key} label="Password" value="••••••••" action={<Button variant="ghost" size="sm">Change</Button>} />
            <SettingsRow icon={Trash} label="Delete Account" value="Permanently remove all data" action={<Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete</Button>} />
              </>
            )}
          </div>
        </div>
      </Card>

      {/* About */}
      <Card variant="glass">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[var(--color-pillar-projects)]" />
            <h2 className="text-headline font-semibold text-[var(--color-text-primary)]">About</h2>
          </div>
          
          <div className="space-y-3 text-body text-[var(--color-text-secondary)]">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-[var(--color-text-primary)] font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Built with</span>
              <span className="text-[var(--color-text-primary)]">React + Capacitor + Supabase</span>
            </div>
            <a href="https://github.com/Fsociety-T/MirorV3" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-[var(--color-pillar-skills)] hover:underline">
              <span>Source Code</span>
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <Button variant="destructive" fullWidth onClick={handleSignOut} disabled={loading} leftIcon={<LogOut className="h-5 w-5" />}>
        {loading ? 'Signing out...' : 'Sign Out'}
      </Button>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, value, action }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-tertiary)]/50">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[var(--color-text-muted)]" />
        <div>
          <p className="text-body text-[var(--color-text-primary)]">{label}</p>
          <p className="text-caption text-[var(--color-text-muted)]">{value}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
