# AION Browser MMO

Ein **Browser-basiertes MMORPG** im Stil von AION. Erlebe eine epische Fantasy-Welt mit Echtzeit-Multiplayer, Klassenauswahl, Quests, Kämpfen und mehr – alles direkt in deinem Browser!

---

## 📖 **Inhaltsverzeichnis**
- [🎮 Features](#-features)
- [🚀 Schnellstart](#-schnellstart)
- [🎯 Spielanleitung](#-spielanleitung)
- [🛠️ Technische Details](#-technische-details)
- [📦 Abhängigkeiten](#-abhängigkeiten)
- [🎨 Klassen](#-klassen)
- [⚔️ Fähigkeiten](#-fähigkeiten)
- [📜 Quests](#-quests)
- [💡 Roadmap](#-roadmap)

---

## 🎮 **Features**

✅ **Multiplayer in Echtzeit** – Spiele mit Freunden oder anderen Spielern weltweit
✅ **3 Klassen zur Auswahl** – Krieger, Magier, Bogenschütze
✅ **Offene Spielwelt** – Erkunde eine große Karte mit NPCs, Monstern und Items
✅ **Kampfsystem** – Kämpfe gegen Monster und andere Spieler
✅ **Quest-System** – Vollende Aufgaben für Belohnungen
✅ **Inventar & Ausrüstung** – Sammle Items und verbessere deine Ausrüstung
✅ **Chat-System** – Kommuniziere mit anderen Spielern
✅ **Minimap** – Behalte den Überblick über die Spielwelt
✅ **Level-System** – Steige im Level auf und werde stärker
✅ **Responsive Design** – Spielt auf Desktop und Tablets

---

## 🚀 **Schnellstart**

### **1. Voraussetzungen**
- [Node.js](https://nodejs.org/) (Version 18 oder höher)
- [Git](https://git-scm.com/) (optional)

### **2. Installation**

#### **Option A: Mit Git klonen**
```bash
# Repository klonen
git clone https://github.com/freya871-sketch/Aion-browser.git
cd Aion-browser

# Abhängigkeiten installieren
npm install
```

#### **Option B: Manuell herunterladen**
1. Lade das Repository als ZIP-Datei herunter
2. Entpacke die Dateien
3. Öffne ein Terminal im Projektordner
4. Führe `npm install` aus

### **3. Server starten**
```bash
# Entwicklungsserver (mit Hot-Reload)
npm run dev

# Oder Produktionsserver
npm start
```

### **4. Spiel öffnen**
Öffne deinen Browser und gehe zu:
```
http://localhost:3000
```

> **💡 Tipp:** Für lokale Tests kannst du mehrere Browser-Fenster öffnen, um mehrere Spieler zu simulieren.

---

## 🎯 **Spielanleitung**

### **Steuerung**
| Taste | Aktion |
|-------|--------|
| **W / ↑** | Nach vorne bewegen |
| **A / ←** | Nach links bewegen |
| **S / ↓** | Nach hinten bewegen |
| **D / →** | Nach rechts bewegen |
| **1-5** | Fähigkeiten verwenden |
| **I** | Inventar öffnen |
| **C** | Charakterbildschirm öffnen |
| **Mausklick** | Ziel auswählen |

### **Spielablauf**
1. **Charakter erstellen**: Wähle einen Namen und eine Klasse
2. **Welt erkunden**: Bewege dich mit den Pfeiltasten oder WASD
3. **Monster bekämpfen**: Klicke auf ein Monster und nutze Fähigkeiten
4. **Items sammeln**: Gehe über Items, um sie aufzunehmen
5. **Quests abschließen**: Sprich mit NPCs und vollende Aufgaben
6. **Mit anderen Spielern interagieren**: Nutze den Chat oder kämpfe gemeinsam

---

## 🛠️ **Technische Details**

### **Frontend**
- **HTML5 Canvas** – Rendering der Spielwelt
- **CSS3** – Styling und Animationen
- **Vanilla JavaScript** – Spiel-Logik
- **Socket.IO Client** – Echtzeit-Kommunikation

### **Backend**
- **Node.js** – Server-Umgebung
- **Express** – Webserver
- **Socket.IO** – Echtzeit-Multiplayer

### **Architektur**
```
Client (Browser)
│
├── index.html       # Haupt-HTML
├── style.css        # Stile
├── game.js          # Spiel-Logik
└── sounds.js        # Soundeffekte (optional)

Server (Node.js)
│
├── server.js        # Haupt-Server
├── package.json     # Abhängigkeiten
└── ...
```

---

## 📦 **Abhängigkeiten**

| Paket | Version | Zweck |
|-------|---------|-------|
| express | ^4.18.2 | Webserver |
| socket.io | ^4.5.4 | Echtzeit-Kommunikation |
| nodemon | ^3.0.2 | Hot-Reload (Entwicklung) |

---

## 🎨 **Klassen**

| Klasse | Beschreibung | Stärken | Schwächen |
|--------|--------------|---------|----------|
| **Krieger** | Nahkämpfer mit hoher Lebensenergie | Hoher Schaden, Hohe Verteidigung | Langsam, Keine Fernangriffe |
| **Magier** | Zauberer mit mächtigen Magieangriffen | Hoher Magieschaden | Geringe Lebensenergie, Geringe Verteidigung |
| **Bogenschütze** | Fernkämpfer mit schnellen Angriffen | Schnelle Angriffe, Beweglich | Geringe Lebensenergie |

### **Klassen-Attribute**
| Klasse | Stärke | Geschicklichkeit | Intelligenz | Angriff | Verteidigung |
|--------|--------|----------------|-------------|---------|-------------|
| Krieger | 15 | 5 | 5 | 20 | 15 |
| Magier | 5 | 5 | 15 | 10 | 5 |
| Bogenschütze | 5 | 15 | 5 | 15 | 5 |

---

## ⚔️ **Fähigkeiten**

### **Krieger**
| Fähigkeit | Beschreibung | Manakosten | Abklingzeit |
|-----------|--------------|------------|-------------|
| Angriff | Standardangriff | 0 | 1s |
| Mächtiger Schlag | Starker Nahangriff | 10 | 5s |
| Schutzschild | Erhöht Verteidigung | 15 | 8s |
| Erdbeben | Schaden im Umkreis | 25 | 10s |
| Heilen | Stell HP wieder her | 15 | 10s |

### **Magier**
| Fähigkeit | Beschreibung | Manakosten | Abklingzeit |
|-----------|--------------|------------|-------------|
| Angriff | Standardzauber | 0 | 1s |
| Feuerball | Starker Feuerzauber | 15 | 5s |
| Eisblitz | Verlangsamt Ziel | 20 | 8s |
| Blitzschlag | Mächtiger Blitzzauber | 30 | 10s |
| Heilzauber | Stell HP wieder her | 10 | 10s |

### **Bogenschütze**
| Fähigkeit | Beschreibung | Manakosten | Abklingzeit |
|-----------|--------------|------------|-------------|
| Angriff | Standardpfeil | 0 | 1s |
| Doppelschuss | Zwei Pfeile gleichzeitig | 10 | 5s |
| Giftpfeil | Vergiftet Ziel | 15 | 8s |
| Scharfschuss | Kritischer Treffer | 25 | 10s |
| Erste Hilfe | Stell HP wieder her | 10 | 10s |

---

## 📜 **Quests**

| Quest | Beschreibung | Belohnung |
|-------|--------------|-----------|
| Goblins vertreiben | Töte 10 Goblins | 100 XP, 50 Gold |
| Sammler | Sammle 5 Heiltränke | 80 XP, 40 Gold |
| Erkundung | Besuche alle Ecken der Karte | 150 XP, 100 Gold |

---

## 💡 **Roadmap**

### **Geplant**
- [ ] **Dungeons** – Instanzierte Räume mit Bosskämpfen
- [ ] **Gilden** – Spieler können Gilden gründen
- [ ] **Handelssystem** – Items mit anderen Spielern handeln
- [ ] **PvP-Arena** – Kämpfe gegen andere Spieler
- [ ] **Mounts** – Reittiere für schnelles Reisen
- [ ] **Flugsystem** – Fliegen wie in AION
- [ ] **Crafting** – Erstelle eigene Ausrüstung
- [ ] **Pet-System** – Begleiter, die dich unterstützen
- [ ] **Dynamische Events** – Welt-Events wie Invasionen
- [ ] **Soundeffekte** – Hintergrundmusik und Soundeffekte

### **Ideas**
- [ ] **Saison-System** – Regelmäßige Events mit Belohnungen
- [ ] **Titel-System** – Errungenschaften und Titel
- [ ] **Wetter-System** – Dynamisches Wetter
- [ ] **Tag/Nacht-Zyklus** – Unterschiedliche Monster zu verschiedenen Zeiten
- [ ] **Fraktionen** – Wähle zwischen verschiedenen Fraktionen

---

## 🤝 **Mitwirken**

Falls du zum Projekt beitragen möchtest:

1. Fork das Repository
2. Erstelle einen neuen Branch (`git checkout -b feature/neues-feature`)
3. Führe deine Änderungen durch
4. Commit deine Änderungen (`git commit -m 'Neues Feature hinzugefügt'`)
5. Push zum Branch (`git push origin feature/neues-feature`)
6. Erstelle einen Pull Request

---

## 📜 **Lizenz**

Dieses Projekt steht unter der **MIT-Lizenz** – siehe [LICENSE](LICENSE) für Details.

---

## 🙏 **Danksagungen**

- Inspiriert von **AION: The Tower of Eternity**
- Dank an die **Socket.IO** Community für die großartige Bibliothek
- Dank an alle Mitwirkenden und Tester

---

**Viel Spaß im Spiel!** 🎮✨

Falls du Fragen oder Probleme hast, öffne bitte ein Issue im Repository.
