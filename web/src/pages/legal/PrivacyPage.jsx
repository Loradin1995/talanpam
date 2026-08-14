import LegalPageShell from './LegalPageShell';

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Politik Konfidansyalite" subtitle="Kijan nou jere done pèsonèl ou">
      <p><strong>1. Done nou kolekte.</strong> Imèl, done idantifikasyon (KYC : non, dat nesans, pyès idantite), istwa tranzaksyon ak jwèt, ak done teknik debaz (adrès IP, tip aparèy) pou sekirite kont ou.</p>
      <p><strong>2. Poukisa nou kolekte yo.</strong> Pou kreye e sekirize kont ou, verifye laj/idantite selon obligasyon legal, trete depo/retrè, anpeche fwod, e amelyore platfòm nan.</p>
      <p><strong>3. Pataj done.</strong> Nou pa vann done pèsonèl ou. Nou ka pataje enfòmasyon ak otorite konpetan si lalwa mande sa, oswa ak founisè peman pou trete tranzaksyon.</p>
      <p><strong>4. Estokaj dokiman KYC.</strong> Dokiman idantite yo estoke sou sèvè prive, aksesib sèlman pa pwopriyetè kont lan ak pèsonèl admin otorize — yo pa janm piblik.</p>
      <p><strong>5. Konsèvasyon.</strong> Nou konsève done ou pandan tout tan kont ou aktif, e pou yon peryòd apre fèmti kont si obligasyon legal (pa egzanp kont finansye) mande sa.</p>
      <p><strong>6. Dwa ou.</strong> Ou ka mande pou wè, korije, oswa mande sipresyon done pèsonèl ou (sof si obligasyon legal anpeche sa), lè w kontakte sipò a.</p>
      <p style={{ marginTop: 20, padding: 14, background: '#FEF9E7', borderRadius: 10, fontSize: 13, color: '#7D6608' }}>
        ⚠️ Dokiman sa a se yon modèl jeneral — li dwe revize pa yon avoka anvan itilizasyon ofisyèl, e adapte selon lwa pwoteksyon done ki aplikab (pa egzanp lwa lokal an Ayiti ak/oswa nan peyi dyaspora yo vize).
      </p>
    </LegalPageShell>
  );
}
