# College Place Audio

A minimal website for College Place Audio.

Built as a static HTML/CSS/JavaScript site with slide-in About, Work, and Contact panels.

## Automatic deployment

The site can deploy to cPanel automatically through GitHub Actions whenever `main` is pushed.

Add these GitHub repository secrets before enabling the workflow:

- `CPANEL_FTP_SERVER` — the FTP server/host for the cPanel account
- `CPANEL_FTP_USERNAME` — the cPanel FTP username
- `CPANEL_FTP_PASSWORD` — the cPanel FTP password
- `CPANEL_FTP_REMOTE_DIR` — the live site folder, usually `public_html`

The workflow uploads the static site files and assets only. It does not delete remote files.
