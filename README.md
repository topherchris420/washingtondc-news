# DC4 News - Washington DC Local News

A responsive local covert News website for Washington DC. Features real-time DC news, weather updates, and trending stories.

## Features

- **Live DC News** - Real-time news powered by GNews API
- **Weather Widget** - Current conditions for Washington DC
- **Breaking News Ticker** - Scrolling breaking news updates
- **Trending Stories** - Most-viewed content sidebar
- **Newsletter Signup** - Daily news delivered to your inbox
- **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

Then visit `http://localhost:8080`

## Project Structure

```
├── index.html          # Main HTML file with embedded CSS/JS
├── public/
│   └── washingtondc.png  # Favicon/logo
├── dist/               # Built production files
└── package.json        # Build configuration
```


## COVCOM Architecture (Covert Communication)

The hidden command flow now uses a small COVCOM layer (`src/lib/covcom.ts`) to centralize, type, and make it easy to extend covert triggers.

- **Signal normalization**: incoming input is normalized before matching.
- **Channel registry**: each covert channel defines aliases + a resolver.
- **Action protocol**: channels return typed actions (`redirect`, `open-contact`, or `none`) consumed by UI.
- **UI decoupling**: `DCNewsLanding` calls `resolveCovcomSignal(...)` instead of embedding ad-hoc checks.

Current channels:
- `library-access` via `137` or `library`
- `contact-channel` via `contact` or `signal`

## 🔧 Building

```bash
npm install
npm run build
```

Output goes to `dist/` folder.
