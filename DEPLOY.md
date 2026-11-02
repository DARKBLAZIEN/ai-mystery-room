# Deploy for free with Render and MongoDB Atlas

This setup runs the React site and Express API together as one Render web service. MongoDB Atlas stores case data. The service uses Render's free plan, which may sleep after inactivity and take a little while to wake on the next visit.

## 1. Prepare MongoDB Atlas

1. In MongoDB Atlas, create an M0 free cluster (or use an existing cluster).
2. Under **Database Access**, create a database user with read and write access to the database used by this app. Use a new strong password.
3. Under **Network Access**, add your current IP address for development, if Atlas hasn't already added it. Later, after creating the Render service, copy its outbound IP ranges from **Render → your service → Connect → Outbound** and add each CIDR range to the Atlas IP access list. Render uses a set of shared outbound ranges, so allowlist the ranges shown for your service's region rather than opening Atlas to every IP.
4. Choose **Connect** on the cluster, then **Drivers**, and copy the connection string. Replace the password placeholder and include a database name, for example `mystery-room`, before any query string.

## 2. Put the project on GitHub

Render deploys from a Git repository. Create a new empty GitHub repository, then open PowerShell in this project folder and run (replace the URL with your repository URL):

```powershell
git init
git add .
git status
```

Check that `.env` is not listed. It is ignored by `.gitignore`; never commit API keys or database credentials. Then commit and push:

```powershell
git commit -m "Prepare mystery room for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If Git asks, configure your GitHub sign-in or credential manager and retry the push.

## 3. Create the Render service

1. Sign in at [Render](https://render.com/) and choose **New** → **Blueprint**.
2. Connect GitHub if prompted, select the repository, and deploy the Blueprint. Render reads the root `render.yaml`; it creates a free Node web service, builds the workspaces, and serves the frontend and API from the same URL.
3. During setup, enter `MONGODB_URI` (the Atlas connection string) and `GEMINI_API_KEY` when Render prompts for the secret values. Do not add either value to `render.yaml` or GitHub.
4. If the service cannot connect to Atlas on its first start, open the Render service's **Connect → Outbound** panel, add all listed IP ranges to Atlas **Network Access**, wait for Atlas to apply the change, then redeploy in Render. The Blueprint health check uses `/api/health`.
5. Open the `onrender.com` URL shown on the Render service page. The first visit after inactivity can take longer because the free service may have spun down.

## 4. Confirm it works

Open `https://YOUR-SERVICE.onrender.com/api/health`. A healthy response looks like:

```json
{"status":"ok","database":"connected"}
```

Then open the site's root URL and create a case. Case generation uses Gemini; cases are saved to Atlas.

## Updating the app

Push later changes to the connected GitHub branch. Render automatically rebuilds and deploys them.

## Notes

- The free Render service can sleep when idle, and free usage limits can change. Check Render's current [free plan details](https://render.com/docs/free).
- Keep `MONGODB_URI` and `GEMINI_API_KEY` in the Render dashboard's secret environment variables. If either has ever been exposed, rotate it before deploying.
- The local `.env` file is for development only. Render uses the variables entered for the deployed service.
