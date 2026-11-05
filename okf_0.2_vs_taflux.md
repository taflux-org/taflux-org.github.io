# taflux und OKF v0.2 - Einschätzung der Claude KI

> Grundlage: OKF v0.2 (Spezifikation) und der Stand von taflux (2026-10-01).

## Der Kern

- **OKF macht Vertrauen sichtbar, taflux macht es zur Bedingung.** OKF hält fest, wer etwas erzeugt und wer es geprüft hat, und überlässt die Konsequenz dem Consumer („advisory signals, not access control“). Bei taflux ist die menschliche Bestätigung Voraussetzung für Geltung und Zugriff – und für einen Agenten technisch gar nicht erreichbar.
- **OKF denkt in Dateien, taflux in Abschnitten.** In OKF hängen `verified`, `status` und `stale_after` am ganzen Concept; Quellen lassen sich einzelnen Aussagen nur per Fussnote zuordnen. In taflux trägt jeder Wissensbaustein (Abschnitt) seinen eigenen Zustand, und Quellen sind Relationen am Abschnitt. Darauf bauen die Automatismen auf: Ändert sich eine Quelle, stuft der Source Watcher genau diesen Abschnitt herab. **OKF zeichnet Herkunft auf, taflux reagiert auf sie.**

## Was taflux zu OKF hinzufügt

- **Verbindlichkeit** (`tier`): Vorgabe, Empfehlung, Information – bestimmt Rangfolge und Tonfall.
- **Vertraulichkeit** (`classification`): ein Suchbestand je Vertrauensstufe; in OKF nicht vorgesehen.
- **Aufbewahrungszweck**: Lehre, Geschichte, Referenz – OKF kennt nur `deprecated` („kept for links and history“).
- **Autonomiegrad**: abgestuft für jeden Wissensbaustein; OKF regelt Autonomie nur für Attested Computation.
- **Typisierte Kanten**: *ersetzt*, *Ausnahme von*, *gilt nur mit*, *beruht auf*, *betrifft* – OKF-Links sind untypisiert.
- **Leserkreis**: welche Menschen etwas sehen dürfen.

## Gleiche Felder, strengere Auslegung

| Feld | OKF | taflux |
|---|---|---|
| fehlender `status` | ⇒ `stable` | ungeprüft, nur geschlossenste Stufe |
| `verified` nach Textänderung | bleibt bestehen | verfällt |
| `machine-confirmed` | über *unverified* | zählt für Geltung nicht; `process:` darf nur herabstufen |
| Trust Tier | Hinweis | steuert den Zugriff |
| `stale_after` | absoluter Zeitpunkt, Warnung | Prüfintervall ab Bestätigung, Herabstufung |
| `sources[].last_modified` | Signal | Ereignis (Source Watcher) |
| fehlendes Link-Ziel | „noch nicht geschrieben“ | kann bewusst ausgelassen sein |

## Was bei taflux fehlt – und wie man es löst

| Lücke | Lösung | Einordnung |
|---|---|---|
| Quellensignale `author`, `usage_count`, `usage_window` | Beim Import erhalten, nicht auswerten. `author` ist fälschbar, `usage_count` misst Lebendigkeit, nicht Glaubwürdigkeit. | **bewusst weggelassen** |
| Attested Computation (§10) | Jetzt: lesen und Vertragsfelder unverändert erhalten, Autonomiegrad fest „nur Vorschlag“, nichts ausführen. Später: Executor, Receipt, Attester. | **bewusst ausgelassen, mögliche Erweiterung** |
| Fremde `human:`-Bestätigungen beim Import | Als Herkunftssignal erhalten; der Baustein startet trotzdem ungeprüft. | Regel festlegen |
| Bewusst ausgelassene Link-Ziele wirken im Export wie kaputte Links | Vermerk „ausgelassen“ am Link im Export. | ergänzen |
| Strengere Auslegung geht bei reinen OKF-Consumern verloren | Export-Regel: `status` immer setzen, nur gültige `human:`-Bestätigungen exportieren, `stale_after` ausrechnen. | ergänzen |
| Datei-Werte bei gemischten Abschnitten | Der strengste Wert gewinnt (`verified` nur, wenn alle Abschnitte bestätigt; frühestes `stale_after`). | Regel festlegen |
| Typisierte Kanten in OKF unsichtbar | Zusätzlich als Markdown-Link mit Typ im Text. | ergänzen |
| `log.md`, `okf_version` | Beim Bundle-Export erzeugen. | prüfen |
