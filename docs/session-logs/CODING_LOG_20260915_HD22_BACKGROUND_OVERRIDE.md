# Coding Log — HD-22 Background Override

## Root cause
`styles.css` defined `--bg:#F4F6F8`, but `hd20-overhaul.css`, loaded later, declared `body{background:linear-gradient(...)}`. Therefore changing the base token alone did not alter the rendered page background.

## Change
Appended to `styles.css`:
```css
html,body{background:#F4F6F8!important}
```
This intentionally wins the later non-important gradient declaration while preserving all other HD-20 visual and functional rules.

## Safety
No JavaScript, canonical stores, Action/Audit linkage, maturity return, Supabase synchronization, or server writes were changed.
