# College Place Audio

A minimal website for College Place Audio.

Built as a static HTML/CSS/JavaScript site with slide-in About, Work, and Contact panels.

## Automatic deployment

The site can deploy to cPanel automatically through GitHub Actions whenever `main` is pushed.

Add these GitHub repository secrets before enabling the workflow:

- `CPANEL_SSH_HOST` — the cPanel server/host, for example `6155903.refreshmobile.ca`
- `CPANEL_SSH_USERNAME` — the cPanel username, for example `collegeplace`
- `CPANEL_SSH_PASSWORD` — the cPanel account password
- `CPANEL_SSH_PORT` — the SSH/SFTP port, usually `22`
- `CPANEL_SSH_REMOTE_DIR` — the live site folder, usually `public_html`

The workflow uploads the static site files and assets only. It does not delete remote files.

## Local checks

Run `./scripts/check-site.sh` before pushing to confirm the core static files and deployment settings are present.
