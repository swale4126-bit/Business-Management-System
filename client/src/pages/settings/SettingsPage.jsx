import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { HiOutlineMoon, HiOutlineSun, HiOutlineComputerDesktop, HiBell, HiInformationCircle } from 'react-icons/hi2';

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
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch { return defaultSettings; }
  });

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      applyTheme(settings.theme);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const themeOptions = [
    { value: 'light',  label: 'Light Mode',         icon: HiOutlineSun },
    { value: 'dark',   label: 'Dark Mode',           icon: HiOutlineMoon },
    { value: 'system', label: 'System Preference',   icon: HiOutlineComputerDesktop },
  ];

  const toggleClass = (active) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader title="System Settings" subtitle="Configure application preferences and display options." />

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <HiOutlineSun className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Appearance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => update('theme', value)}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                settings.theme === value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className="w-7 h-7" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <HiBell className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'notifyLowStock',    label: 'Low Stock Alerts',    desc: 'Get notified when a product falls below minimum stock.' },
            { key: 'notifyNewSale',     label: 'New Sale Alerts',      desc: 'Get notified when a new sale is recorded.' },
            { key: 'notifyNewEmployee', label: 'New Employee Alerts',  desc: 'Get notified when a new employee is added.' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => update(key, !settings[key])}
                className={toggleClass(settings[key])}
                aria-pressed={settings[key]}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <HiInformationCircle className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">System Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Version</p>
            <p className="font-semibold text-gray-900 dark:text-white">1.0.0 (BMS Enterprise)</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Environment</p>
            <p className="font-semibold text-gray-900 dark:text-white">Production</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
            <p className="font-semibold text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}
