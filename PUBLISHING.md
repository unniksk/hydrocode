# 🚀 Publishing HydroCode to VS Code Marketplace

Step-by-step guide to publish your extension.

---

## Step 1: Create a Microsoft Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Microsoft account (or create one)
3. Create a **Publisher**:
   - Publisher ID: `UnniKrishnan` (must match `package.json` → `"publisher"`)
   - Display name: `Unni Krishnan`

---

## Step 2: Create a Personal Access Token (PAT)

1. Go to https://dev.azure.com → your organization
2. Click your profile icon → **Personal access tokens**
3. Click **+ New Token**
4. Set:
   - Name: `vsce-hydrocode`
   - Organization: **All accessible organizations**
   - Scopes: **Marketplace → Manage** ✅
5. Copy the token (you only see it once!)

---

## Step 3: Install vsce & Login

```bash
npm install -g @vscode/vsce

# Login with your publisher ID
vsce login UnniKrishnan
# Paste your PAT when prompted
```

---

## Step 4: Add an Icon (Required for Marketplace)

Create or add a 128x128 PNG icon at `media/icon.png`.

You can use any water/droplet icon. Make sure the path matches `package.json`:
```json
"icon": "media/icon.png"
```

---

## Step 5: Compile TypeScript

```bash
cd hydrocode
npm install
npm run compile
```

---

## Step 6: Package the Extension

```bash
vsce package
# Creates: hydrocode-1.0.0.vsix
```

Test it locally first:
```
In VS Code: Extensions → "..." → Install from VSIX → select the .vsix file
```

---

## Step 7: Publish!

```bash
vsce publish
```

Or publish a specific version:
```bash
vsce publish 1.0.0
```

---

## Step 8: Verify

Your extension will be live at:
```
https://marketplace.visualstudio.com/items?itemName=UnniKrishnan.hydrocode
```

May take **5–10 minutes** to appear.

---

## 🔄 Updating the Extension

1. Update version in `package.json` (e.g., `1.0.1`)
2. Update `CHANGELOG.md`
3. Run `npm run compile`
4. Run `vsce publish`

---

## 📋 Checklist Before Publishing

- [ ] `package.json` has correct `publisher`, `name`, `version`
- [ ] `media/icon.png` exists (128x128px PNG)
- [ ] `README.md` has good description and screenshots
- [ ] TypeScript compiles without errors (`npm run compile`)
- [ ] Tested locally via VSIX install
- [ ] Logged in with `vsce login UnniKrishnan`

---

*Happy publishing, Unni! 💧*
