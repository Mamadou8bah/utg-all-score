"use client";
import { useLanguage } from "@/components/language-provider";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotificationSettings, InstallPrompt } from "@/components/ui";
import { DataFeedback } from "@/components/data-feedback";
import { useCompetitionsBundle } from "@/lib/use-api-data";
import { ALERT_DEFAULTS, DEFAULT_SETTINGS, readSettings, saveSettings, type AlertKey, type DeviceSettings } from "@/lib/device-settings";
const labels: { key: AlertKey; en: string; fr: string; hint: string }[] = [
  {key:"matchStart",en:"Match kick-off",fr:"Coup d’envoi",hint:"Kick-off and the start of the second half"},
  {key:"goals",en:"Goals",fr:"Buts",hint:"When a goal is recorded"},
  {key:"halfTime",en:"Half-time",fr:"Mi-temps",hint:"Score at the break"},
  {key:"fullTime",en:"Full-time",fr:"Fin du match",hint:"Final whistle results"},
  {key:"lineups",en:"Lineups released",fr:"Compositions d’équipe",hint:"When a starting XI is published"},
  {key:"breakingNews",en:"News",fr:"Actualités",hint:"New match reports and campus stories"},
  {key:"announcements",en:"Official notices",fr:"Annonces officielles",hint:"Venue changes and official announcements"}
];
export default function SettingsClient() {
  const { t: translate } = useLanguage();
  const [settings, setSettings] = useState<DeviceSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const {competitions, loading, error, reload} = useCompetitionsBundle();
  const fr = settings.language === "fr";
  const t = (en:string, french:string) => fr ? french : en;
  useEffect(() => {
    setSettings(readSettings());
    try { const raw=JSON.parse(localStorage.getItem("favorite-competitions") || "[]"); if(Array.isArray(raw)) setFavorites(raw.filter((v):v is string=>typeof v === "string")); } catch {}
    setReady(true);
    const update=()=>setSettings(readSettings());
    window.addEventListener("storage",update);window.addEventListener("utg-settings-change",update);return()=>{window.removeEventListener("storage",update);window.removeEventListener("utg-settings-change",update);};
  }, []);
  async function update(next: DeviceSettings) {
    setSettings(next);
    try { await saveSettings(next);setMessage(next.language === "fr" ? "Préférences enregistrées sur cet appareil." : "Preferences saved on this device."); }
    catch {setMessage("Could not save all preferences. Check browser storage access and try again.");}
  }
  function toggleFavorite(id:string) {
    const next=favorites.includes(id)?favorites.filter(v=>v!==id):[...favorites,id];
    try {localStorage.setItem("favorite-competitions",JSON.stringify(next));setFavorites(next);window.dispatchEvent(new Event("utg-favorites-change"));setMessage(t("Followed competitions saved.","Compétitions suivies enregistrées."));}catch{setMessage("Could not save followed competitions.");}
  }
  async function clearScores() {
    try {
      if("caches" in window) for(const name of await caches.keys()) if(name.startsWith("utg-allscore-")) {
        const cache=await caches.open(name);for(const request of await cache.keys()) if(new URL(request.url).pathname.startsWith("/api/")) await cache.delete(request);
      }
      setMessage(t("Cached scores cleared. Fresh data will load when you reconnect.","Scores en cache effacés. Les données seront actualisées à la reconnexion."));
    } catch {setMessage("Could not clear cached scores.");}
  }
  return <div className="page-shell section-space settings-page">
    <header className="detail-topline"><Link href="/more" aria-label={translate("Back to More")} className="settings-back"><ArrowLeft size={20}/></Link><h1>{t("Settings","Paramètres")}</h1></header>
    <p className="settings-intro">{t("Preferences are saved on this device.","Les préférences sont enregistrées sur cet appareil.")}</p>
    <h2 className="panel-title">{t("Appearance","Apparence")}</h2>
    <label className="settings-row"><span>{t("Theme","Thème")}</span><select aria-label={translate("Theme")} value={settings.theme} disabled={!ready} onChange={e=>update({...settings,theme:e.target.value as DeviceSettings["theme"]})}><option value="light">{t("Light","Clair")}</option><option value="dark">{t("Dark","Sombre")}</option><option value="system">{t("Use device setting","Selon l’appareil")}</option></select></label>
    <label className="settings-row"><span>{t("Language","Langue")}</span><select aria-label={translate("Language")} value={settings.language} disabled={!ready} onChange={e=>update({...settings,language:e.target.value as DeviceSettings["language"]})}><option value="en">{translate("English")}</option><option value="fr">{translate("Français")}</option></select></label>
    <h2 className="panel-title">{t("Notifications","Notifications")}</h2>
    <div className="settings-push"><NotificationSettings /></div>
    <p className="settings-intro">{t("Choose the alerts you receive. Match alerts currently cover all competitions.","Choisissez vos alertes. Les alertes de match couvrent toutes les compétitions.")}</p>
    {labels.map(row=><div className="settings-row" key={row.key}><div><div>{fr?row.fr:row.en}</div><div className="list-item__meta">{translate(row.hint)}</div></div><button type="button" role="switch" aria-label={fr ? row.fr : row.en} aria-checked={settings.alerts[row.key]} disabled={!ready} className={`settings-toggle${settings.alerts[row.key]?" settings-toggle--on":""}`} onClick={()=>update({...settings,alerts:{...settings.alerts,[row.key]:!settings.alerts[row.key]}})} /></div>)}
    <h2 className="panel-title">{t("Followed competitions","Compétitions suivies")}</h2>
    <p className="settings-intro">{t("Your followed competitions appear first in the leagues list.","Vos compétitions suivies apparaissent en premier dans la liste.")}</p>
    {loading || error?<DataFeedback loading={loading} error={error} onRetry={reload}/>:competitions.length?competitions.map(c=><div className="settings-row" key={c.id}><div><div>{c.name}</div><div className="list-item__meta">{translate(c.type === "GENERAL" ? t("University","Université") : c.schoolName)}</div></div><button type="button" role="switch" aria-label={fr ? `Suivre ${c.name}` : `Follow ${c.name}`} aria-checked={favorites.includes(c.id)} className={`settings-toggle${favorites.includes(c.id)?" settings-toggle--on":""}`} onClick={()=>toggleFavorite(c.id)}/></div>):<div className="empty-state">{t("No competitions published yet.","Aucune compétition publiée.")}</div>}
    <h2 className="panel-title">{t("This device","Cet appareil")}</h2>
    <div className="settings-row"><div><div>{t("Install AllScore","Installer AllScore")}</div><div className="list-item__meta">{t("On iPhone: Share → Add to Home Screen.","Sur iPhone : Partager → Sur l’écran d’accueil.")}</div></div><InstallPrompt /></div>
    <div className="settings-row"><span>{t("Match timezone","Fuseau des matchs")}</span><span className="list-item__meta">{translate("Africa/Banjul (GMT)")}</span></div>
    <button type="button" className="list-item" onClick={clearScores}><div><div className="list-item__title">{t("Clear cached scores","Effacer les scores en cache")}</div><div className="list-item__meta">{t("Keep preferences, sign-in and the offline app.","Conserver les préférences, la connexion et l’application hors ligne.")}</div></div></button>
    <button type="button" className="list-item" disabled={!ready} onClick={()=>update({...DEFAULT_SETTINGS,alerts:{...ALERT_DEFAULTS}})}><div><div className="list-item__title">{t("Reset appearance and alert preferences","Réinitialiser l’apparence et les alertes")}</div><div className="list-item__meta">{t("Restore light mode, English and all alert types.","Rétablir le mode clair, l’anglais et toutes les alertes.")}</div></div></button>
    <h2 className="panel-title">{t("About UTG AllScore","À propos de UTG AllScore")}</h2>
    <div className="reference-panel">{t("University football scores, fixtures, tables and official campus updates. No account is needed to browse matches. Device preferences stay in this browser.","Scores de football universitaire, calendrier, classements et actualités officielles. Aucun compte nécessaire pour consulter les matchs. Les préférences restent dans ce navigateur.")}</div>
    <p className="settings-save-status" role="status" aria-live="polite">{translate(message)}</p>
  </div>;
}
