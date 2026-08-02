# Anthropology Portfolio

A clean, responsive, single-page portfolio website for an anthropologist —
built with plain **HTML, CSS, and JavaScript** (no build step, no dependencies).
Deploys instantly on Vercel, Netlify, or GitHub Pages.

## Structure

```
.
├── index.html        # All page content and section markup
├── css/
│   └── styles.css    # All styling + light/dark theme (edit colors at the top)
├── js/
│   └── script.js     # Nav, theme toggle, scroll reveal, contact form
└── README.md
```

## Features

- Sticky navigation with a mobile hamburger menu
- Light / dark mode toggle (remembers your choice)
- Smooth scrolling and fade-in-on-scroll animations
- Sections: Hero, About, Research, Fieldwork, Publications, Teaching, Contact
- Responsive layout for phone, tablet, and desktop
- Accessible markup and a `prefers-reduced-motion` fallback

## How to customize

Everything is placeholder content — replace it with your own:

1. **Your name & tagline** — search `index.html` for `Your Name` and `YN`
   (the portrait initials) and replace them.
2. **About, focus areas, education** — edit the `#about` section in `index.html`.
3. **Research projects** — edit the cards in the `#research` section.
4. **Fieldwork** — edit the timeline items in `#fieldwork` (dates and places).
5. **Publications** — edit the list in `#publications`.
6. **Teaching** — edit the cards in `#teaching`.
7. **Contact details** — update the email, institution, and location in
   `#contact`, and the social links in the footer.
8. **Colors / branding** — edit the CSS variables at the top of
   `css/styles.css` (`--accent`, `--bg`, etc.) to change the whole palette.
9. **Add a real photo** — replace the `.portrait-frame` block in `index.html`
   with an `<img src="images/you.jpg" alt="Your Name" />` and style as needed.

## Contact form

The form currently validates and confirms **client-side only** — it does not
send email yet. To receive real messages, connect a form backend such as
[Formspree](https://formspree.io), [Getform](https://getform.io), or a Vercel
serverless function, and point the form's `action` at it.

## Running locally

Just open `index.html` in a browser. Or serve it:

```bash
# Python
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploying on Vercel

This is a static site, so no configuration is needed — Vercel serves the files
as-is. Connect this GitHub repo to a Vercel project (or run `vercel` from the
project folder) and it will deploy automatically on every push.
