# CSS-struktur

Den här katalogen är en säker första uppdelning av den ursprungliga `style.css`.

## Användning

Byt din befintliga stylesheet-länk till:

```html
<link rel="stylesheet" href="/css/style.css">
```

Om mappen placeras på annan sökväg justerar du bara `href`. `style.css` importerar samtliga filer i exakt samma ordning som reglerna låg i originalfilen.

## Viktigt

- Regelordningen är bevarad för att minimera risken för visuella förändringar.
- Filer under `overrides/` finns kvar eftersom originalet innehåller senare korrigeringar som medvetet skriver över tidigare regler.
- När sajten är verifierad kan nästa refaktor slå ihop dubletter per komponent och minska mängden `!important`.
- `style.css` använder CSS `@import` för enkel installation. I produktion kan ni senare bunta ihop filerna med exempelvis Vite/PostCSS för färre HTTP-anrop.

## Filordning

| # | Fil | Originalrader | Innehåll |
|---:|---|---:|---|
| 1 | `core/01-tokens-global.css` | 1-34 | Design tokens and global defaults |
| 2 | `components/02-header-navigation.css` | 35-122 | Header and navigation |
| 3 | `sections/03-hero-buttons.css` | 123-191 | Hero and shared buttons |
| 4 | `sections/04-content-cards-services.css` | 192-339 | Content, cards and service overview |
| 5 | `components/05-contact-forms.css` | 340-478 | Contact and forms |
| 6 | `components/06-floating-controls.css` | 479-501 | Floating controls |
| 7 | `pages/07-privacy-service-pages.css` | 502-694 | Privacy and legacy service page styles |
| 8 | `core/08-animations.css` | 695-734 | Animations |
| 9 | `responsive/09-core-responsive.css` | 735-888 | Core responsive layout |
| 10 | `components/10-before-after-sliders.css` | 889-1029 | Before-and-after sliders |
| 11 | `overrides/11-navigation-service-refinements.css` | 1030-1322 | Navigation and service refinements |
| 12 | `overrides/12-visual-wide-screen.css` | 1323-1551 | Visual effects and wide-screen adjustments |
| 13 | `components/13-uploads-motion-assets.css` | 1552-1624 | Uploads and motion assets |
| 14 | `responsive/14-adaptive-layout.css` | 1625-2050 | Adaptive layout |
| 15 | `overrides/15-header-footer-refinements.css` | 2051-2160 | Header and footer refinements |
| 16 | `overrides/16-device-fallbacks.css` | 2161-2326 | Device fallbacks |
| 17 | `overrides/17-final-surface-buttons.css` | 2327-2595 | Final surface and button cascade |
| 18 | `overrides/18-performance-reduced-motion.css` | 2596-2639 | Performance and reduced-motion safeguards |
| 19 | `overrides/19-interaction-content-polish.css` | 2640-2783 | Interaction and content polish |
| 20 | `overrides/20-responsive-shadows-density.css` | 2784-2945 | Responsive shadows, hamburger and mobile density |
| 21 | `components/21-header-social-buttons.css` | 2946-3037 | Header social button effects |
| 22 | `sections/22-service-card-expansion.css` | 3038-3218 | Expanding service cards |
| 23 | `sections/23-company-history-slider.css` | 3219-3534 | Company history slider and navigation spacing |
| 24 | `sections/24-home-fullwidth-history.css` | 3535-4208 | Home full-width sections and history embed/responsive rules |
| 25 | `themes/25-sharp-surfaces.css` | 4209-4445 | Sharp surface/card system and compact history |
| 26 | `sections/26-hero-quality-environment.css` | 4446-4765 | Centered hero, large-screen hero, quality/environment cards |
| 27 | `components/27-form-polish.css` | 4766-5306 | Form fields, checkboxes, uploads and service selection polish |
| 28 | `components/28-privacy-footer.css` | 5307-5702 | Privacy surfaces and footer system |
| 29 | `components/29-social-buttons-polish.css` | 5703-5880 | Social buttons polished version |
| 30 | `sections/30-history-status.css` | 5881-6053 | History step/status polish |
| 31 | `pages/31-clean-service-pages.css` | 6054-6559 | Clean service-page system |
| 32 | `components/32-links-service-cta.css` | 6560-6785 | Shared text links and service-page bottom CTA |
| 33 | `sections/33-social-history-header.css` | 6786-6982 | Social embeds, history mobile fixes and header centering |
| 34 | `components/34-mobile-menu-fullscreen.css` | 6983-7251 | Fullscreen mobile menu |
| 35 | `components/35-mobile-menu-morph.css` | 7252-7449 | Mobile menu hamburger-to-close morph and final polish |
| 36 | `components/36-mobile-menu-v10.css` | 7450-7531 | Red close icon and unified contact links |
| 37 | `components/37-header-final-layout.css` | 7532-7850 | Final desktop/mobile header placement |
| 38 | `sections/38-social-media-final-fix.css` | 7851-7915 | Final social media layout fix |

## Rekommenderad nästa städning

1. Konsolidera `header`/`nav` och mobilmeny till en slutlig komponentfil.
2. Konsolidera service-sidorna och ta bort legacy-regler som inte längre används.
3. Samla historia/tidslinje-regler och eliminera äldre mobilfixar som ersatts.
4. Flytta kvarvarande generella färg-, typografi- och surface-regler till `core/`.
5. Reducera `!important` först efter visuell regressionskontroll.
