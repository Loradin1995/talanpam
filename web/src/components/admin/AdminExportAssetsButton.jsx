import { useState } from 'react';
import JSZip from 'jszip';
import { ASSET_LIST } from '@/lib/assetsRegistry';
import { Download, Loader2 } from 'lucide-react';

export default function AdminExportAssetsButton() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setError('');
    setProgress(0);
    setDone(false);

    const zip = new JSZip();
    const imgFolder = zip.folder('images');
    const sndFolder = zip.folder('sounds');

    let completed = 0;

    for (const asset of ASSET_LIST) {
      try {
        const res = await fetch(asset.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const folder = asset.folder === 'sounds' ? sndFolder : imgFolder;
        folder.file(asset.filename, blob);
      } catch (e) {
        // Skip failed assets but continue
        console.warn(`Failed to fetch ${asset.filename}:`, e.message);
      }
      completed++;
      setProgress(Math.round((completed / ASSET_LIST.length) * 100));
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mondialito-assets.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError('Erreur lors de la création du zip: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: exporting ? '#BDC3C7' : '#5DADE2',
          color: '#fff', border: 'none', borderRadius: 10,
          padding: '10px 18px', fontSize: 13, fontWeight: 700,
          cursor: exporting ? 'not-allowed' : 'pointer', minHeight: 40,
        }}
      >
        {exporting ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Download size={16} />}
        {exporting ? `Export... ${progress}%` : 'Exporter les assets (.zip)'}
      </button>
      {done && !exporting && (
        <p style={{ color: '#58D68D', fontSize: 12, fontWeight: 600, marginTop: 8 }}>
          ✓ Export terminé — vérifiez vos téléchargements.
        </p>
      )}
      {error && (
        <p style={{ color: '#EC7063', fontSize: 12, fontWeight: 600, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}