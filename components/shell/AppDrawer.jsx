"use client";

import { useState } from "react";
import { getLanguageName, supportedLanguages } from "../../lib/i18n/language";

export default function AppDrawer({
  open,
  telegramUser,
  language,
  t,
  onSelectLanguage,
  onClose,
  onResetEntrance,
  onResetTestData,
}) {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);

  if (!open) return null;

  const profileName =
    telegramUser?.username || telegramUser?.first_name || "SceneAgent";

  const telegramId = telegramUser?.id || "browser-preview";

  function safeResetEntrance() {
    if (typeof onResetEntrance === "function") {
      onResetEntrance();
    }
  }

  function safeResetTestData() {
    if (typeof onResetTestData === "function") {
      onResetTestData();
    }
  }

  function handleLanguageSelect(languageCode) {
    if (typeof onSelectLanguage === "function") {
      onSelectLanguage(languageCode);
    }

    setLanguageOpen(false);
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <aside style={styles.drawer} onClick={(event) => event.stopPropagation()}>
        <div style={styles.drawerTop}>
          <div style={styles.brandRow}>
            <div style={styles.brandMark}>PGM</div>

            <div>
              <h2 style={styles.brandTitle}>PixelGridMacro</h2>
              <p style={styles.brandSubtitle}>Mini App account</p>
            </div>
          </div>

          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <section style={styles.profileCard}>
          <div style={styles.avatarCircle}>👤</div>

          <div style={styles.profileInfo}>
            <h3 style={styles.profileName}>{profileName}</h3>
            <p style={styles.profileMeta}>Telegram ID: {telegramId}</p>
          </div>
        </section>

        <section style={styles.quickStats}>
          <div style={styles.statCard}>
            <strong>0</strong>
            <span>Available UGT</span>
          </div>

          <div style={styles.statCard}>
            <strong>0</strong>
            <span>Locked UGT</span>
          </div>

          <div style={styles.statCard}>
            <strong>0</strong>
            <span>Referrals</span>
          </div>
        </section>

        <section style={styles.menuSection}>
          <button
            style={styles.settingsHeader}
            onClick={() => setSettingsOpen((value) => !value)}
          >
            <span>⚙ {t("settings_title")}</span>
            <strong>{settingsOpen ? "−" : "+"}</strong>
          </button>

          {settingsOpen && (
            <div style={styles.settingsBody}>
              <button
                style={styles.settingsItem}
                onClick={() => setLanguageOpen((value) => !value)}
              >
                <span>{t("language_title")}</span>

                <span style={styles.settingsItemRight}>
                  <span style={styles.languageBadge}>
                    {String(language).toUpperCase()}
                  </span>
                  <span style={styles.chevron}>{languageOpen ? "⌃" : "⌄"}</span>
                </span>
              </button>

              {languageOpen && (
                <div style={styles.languageList}>
                  {supportedLanguages.map((languageCode) => {
                    const active = languageCode === language;

                    return (
                      <button
                        key={languageCode}
                        style={{
                          ...styles.languageOption,
                          ...(active ? styles.languageOptionActive : {}),
                        }}
                        onClick={() => handleLanguageSelect(languageCode)}
                      >
                        <span style={styles.languageCode}>
                          {languageCode.toUpperCase()}
                        </span>

                        <span style={styles.languageName}>
                          {getLanguageName(languageCode)}
                        </span>

                        {active && <span style={styles.activeMark}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={styles.disabledItem}>
                <span>Payment methods</span>
                <small>later</small>
              </div>

              <div style={styles.disabledItem}>
                <span>Theme / Background</span>
                <small>later</small>
              </div>

              <div style={styles.divider} />

              <button style={styles.dangerSoftButton} onClick={safeResetTestData}>
                Reset test data
              </button>

              <button style={styles.dangerButton} onClick={safeResetEntrance}>
                {t("profile_reset_entrance")}
              </button>
            </div>
          )}
        </section>

        <section style={styles.menuSection}>
          <h4 style={styles.sectionTitle}>Support</h4>

          <div style={styles.disabledItem}>
            <span>Support / Channel</span>
            <small>soon</small>
          </div>
        </section>

        <p style={styles.footerNote}>
          Profile and settings live here. Product rooms stay in the navigation.
        </p>
      </aside>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    background: "rgba(0,0,0,0.54)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "flex-start",
  },

  drawer: {
    width: "min(340px, calc(100% - 34px))",
    height: "100vh",
    overflowY: "auto",
    padding: "18px 14px 22px",
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at 0% 0%, rgba(139,92,246,0.24), transparent 34%), rgba(18,18,18,0.98)",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "24px 0 80px rgba(0,0,0,0.62)",
    color: "#ffffff",
  },

  drawerTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  brandMark: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #7c3aed, #ec4899, #22d3ee)",
    boxShadow:
      "0 0 20px rgba(236,72,153,0.45), 0 0 48px rgba(34,211,238,0.18)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.08em",
  },

  brandTitle: {
    margin: 0,
    fontSize: 18,
    letterSpacing: "-0.03em",
  },

  brandSubtitle: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontSize: 24,
    lineHeight: 1,
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 22,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.09)",
    marginBottom: 12,
  },

  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #1f2937, #111827)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 24,
    flexShrink: 0,
  },

  profileInfo: {
    minWidth: 0,
  },

  profileName: {
    margin: 0,
    fontSize: 16,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  profileMeta: {
    margin: "5px 0 0",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    wordBreak: "break-word",
  },

  quickStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 12,
  },

  statCard: {
    minHeight: 62,
    padding: 10,
    borderRadius: 16,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
  },

  menuSection: {
    borderRadius: 22,
    padding: 12,
    background: "rgba(20,20,20,0.88)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 12,
  },

  sectionTitle: {
    margin: "0 0 10px",
    color: "rgba(255,255,255,0.44)",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  settingsHeader: {
    width: "100%",
    padding: "12px 12px",
    border: 0,
    borderRadius: 16,
    background: "rgba(139,92,246,0.16)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
  },

  settingsBody: {
    paddingTop: 12,
  },

  settingsItem: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 15,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.045)",
    color: "rgba(255,255,255,0.82)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 8,
  },

  settingsItemRight: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },

  languageBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 42,
    padding: "7px 9px",
    borderRadius: 999,
    background: "rgba(34,211,238,0.14)",
    color: "#a5f3fc",
    border: "1px solid rgba(165,243,252,0.16)",
    fontSize: 12,
    fontWeight: 900,
  },

  chevron: {
    color: "rgba(255,255,255,0.46)",
    fontSize: 15,
    fontWeight: 900,
  },

  languageList: {
    display: "grid",
    gap: 7,
    padding: "0 0 10px",
  },

  languageOption: {
    width: "100%",
    padding: "10px 11px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.035)",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "42px 1fr 20px",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
    fontSize: 13,
    fontWeight: 800,
  },

  languageOptionActive: {
    background: "rgba(76,175,80,0.16)",
    color: "#ffffff",
    border: "1px solid rgba(76,175,80,0.36)",
  },

  languageCode: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 34,
    padding: "5px 6px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    fontSize: 11,
  },

  languageName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  activeMark: {
    color: "#86efac",
    fontSize: 14,
    fontWeight: 900,
    textAlign: "right",
  },

  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    margin: "12px 0",
  },

  dangerSoftButton: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.045)",
    color: "rgba(255,255,255,0.72)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 8,
  },

  dangerButton: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(248,113,113,0.22)",
    background: "rgba(248,113,113,0.09)",
    color: "#fecaca",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 800,
  },

  disabledItem: {
    padding: "11px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8,
  },

  footerNote: {
    margin: "14px 4px 0",
    color: "rgba(255,255,255,0.34)",
    fontSize: 11,
    lineHeight: 1.45,
  },
};
