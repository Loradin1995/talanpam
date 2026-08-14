import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Save } from 'lucide-react';

const DEFAULT_SETTINGS = [
  { key: 'moncash_number', label: 'Numéro MonCash (destinataire)', value: '', category: 'payments' },
  { key: 'moncash_name', label: 'Nom du compte MonCash', value: 'Mondialito', category: 'payments' },
  { key: 'min_deposit', label: 'Dépôt minimum (HTG)', value: '500', category: 'payments' },
  { key: 'site_name', label: 'Nom du site', value: 'Mondialito', category: 'general' },
  { key: 'maintenance_mode', label: 'Mode maintenance (true/false)', value: 'false', category: 'general' },
];

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.admin.settings().then(list => {
      const map = {};
      list.forEach(s => { map[s.key] = s; });
      setSettings(map);
    });
  }, []);

  const getValue = (key) => settings[key]?.value ?? (DEFAULT_SETTINGS.find(s => s.key === key)?.value || '');

  const handleSave = async (key, label, category, value) => {
    const updated = await api.admin.saveSetting(key, value, label, category);
    setSettings(s => ({ ...s, [key]: updated }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h3 style={{ color: '#fff', marginBottom: 16, fontSize: 16 }}>Paramètres / Param</h3>
      {saved && (
        <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid #00e676', borderRadius: 8, padding: '8px 14px', marginBottom: 12, color: '#00e676', fontSize: 13 }}>
          ✓ Enregistré avec succès
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {DEFAULT_SETTINGS.map(({ key, label, category }) => {
          const currentVal = getValue(key);
          return (
            <SettingRow key={key} settingKey={key} label={label} category={category} defaultValue={currentVal} onSave={(v) => handleSave(key, label, category, v)} />
          );
        })}
      </div>
    </div>
  );
}

function SettingRow({ settingKey, label, category, defaultValue, onSave }) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => { setValue(defaultValue); }, [defaultValue]);

  const catColor = { payments: '#ffd700', general: '#ff6b00', game: '#00e676', challenge: '#9c27b0' };

  return (
    <div style={{ background: '#0d1226', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <span style={{ background: `${catColor[category]}20`, color: catColor[category], borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 700, marginBottom: 6, display: 'inline-block' }}>
            {category}
          </span>
          <label style={{ display: 'block', color: '#ddd', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{ width: '100%', background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 10px', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={() => onSave(value)}
          style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
        >
          <Save size={13} /> Sauvegarder
        </button>
      </div>
    </div>
  );
}