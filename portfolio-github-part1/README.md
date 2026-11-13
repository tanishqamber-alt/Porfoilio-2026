# tanishq.design — portfolio

Static site, ready for GitHub Pages. No build step.

## Publish with GitHub Pages
1. Put all of these files at the **top level** of the repository (not inside a sub-folder), including the hidden `.nojekyll` file.
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, Save.
3. After a minute the site is live at `https://<username>.github.io/<repository>/` (or `https://<username>.github.io/` if the repository is named `<username>.github.io`).

The pages work at any of those addresses, and on a custom domain. To use tanishq.design here instead of Netlify, add it under **Settings → Pages → Custom domain** and point the domain's DNS to GitHub Pages.

## Notes
- `.nojekyll` must stay: it stops GitHub's Jekyll processor from touching the files.
- Old-address forwarding (`/loan-against-property` → `/work/loan-against-property`) and the icon caching rules are Netlify features; they are not used on GitHub Pages.
