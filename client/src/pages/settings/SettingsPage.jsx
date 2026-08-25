import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiOutlineMoon, HiOutlineSun, HiOutlineComputerDesktop, HiBell, HiInformationCircle, HiCog6Tooth, HiCheckCircle } from 'react-icons/hi2';

const SETTINGS_KEY = 'bms_settings';

const defaultSettings = {
  theme: 'system',
  notifyLowStock: true,
  notifyNewSale: true,
  notifyNewEmployee: true,
};

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }
}

// Settings card section wrapper
const SettingsSection = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/20">
      <div className="w-8 h-8 rounded-xl bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center ring-1 ring-primary-500/20 flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Toggle switch component
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
    aria-pressed={checked}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch { return defaultSettings; }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      applyTheme(settings.theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const themeOptions = [
    { value: 'light',  label: 'Light Mode',       icon: HiOutlineSun },
    { value: 'dark',   label: 'Dark Mode',         icon: HiOutlineMoon },
    { value: 'system', label: 'System Default',    icon: HiOutlineComputerDesktop },
  ];

  const notificationToggles = [
    { key: 'notifyLowStock',    label: 'Low Stock Alerts',    desc: 'Get notified when a product falls below minimum stock threshold.' },
    { key: 'notifyNewSale',     label: 'New Sale Alerts',     desc: 'Get notified each time a new sale transaction is recorded.' },
    { key: 'notifyNewEmployee', label: 'New Employee Alerts', desc: 'Get notified when a new employee account is created.' },
  ];

  return (
    <div className="space-y-5 max-w-3xl animate-fade-in">
      <PageHeader
        title="System Settings"
        description="Configure application appearance, notifications, and display preferences."
      />

      {/* Appearance */}
      <SettingsSection icon={HiCog6Tooth} title="Appearance" description="Choose your preferred interface theme">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map(({ value, label, icon: Icon }) => {
            const isActive = settings.theme === value;
            return (
              <button
                key={value}
                onClick={() => update('theme', value)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                <span className="text-sm font-semibold">{label}</span>
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-500/20 px-2 py-0.5 rounded-full">Active</span>
                )}
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={HiBell} title="Notification Preferences" description="Control which events trigger in-app notifications">
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
          {notificationToggles.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="pr-8">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <Toggle checked={settings[key]} onChange={() => update(key, !settings[key])} />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* System Info */}
      <SettingsSection icon={HiInformationCircle} title="System Information" description="Details about this BMS installation">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Version',      value: '1.0.0 Enterprise' },
            { label: 'Environment',  value: 'Production' },
            { label: 'Last Updated', value: new Date().toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{label}</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Save bar */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 px-5 py-4 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">Changes are applied immediately after saving.</p>
        <Button
          onClick={handleSave}
          leftIcon={saved ? <HiCheckCircle className="w-4 h-4" /> : undefined}
          variant={saved ? 'success' : 'primary'}
        >
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
