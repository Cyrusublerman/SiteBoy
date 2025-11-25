# Remove Reference Files from Git (Keep Locally)

## 🎯 Goal
Remove reference directories from Git tracking while keeping them on your local filesystem for Cursor/IDE access.

## ✅ What This Does

**Before:**
- Reference files: ✅ On your computer, ✅ In Git repo
- Result: Slow Git operations, large repo

**After:**
- Reference files: ✅ On your computer, ❌ NOT in Git repo
- Result: Fast Git operations, small repo, Cursor still has access!

---

## 📋 Step-by-Step Process

### Step 1: Check What's Tracked (Already Done!)
Your `.gitignore` is now updated to ignore reference directories.

### Step 2: Remove from Git (Keep Local Files)

Run these commands:

```bash
# Remove reference/ from Git tracking (KEEPS local files)
git rm -r --cached reference/

# Remove project-specific reference directories
git rm -r --cached "projects/Synthetic Biophilia/reference/"

# Check what will be removed
git status
```

**Important:** `--cached` flag means **"remove from Git, keep local files"**

### Step 3: Commit the Removal

```bash
# Commit the removal
git add .gitignore
git commit -m "chore: remove reference directories from Git tracking

- Reference files now ignored via .gitignore
- Files remain locally for development
- Reduces repo size significantly"
```

### Step 4: Verify It Worked

```bash
# These should NOT show any files:
git ls-files reference/
git ls-files "projects/Synthetic Biophilia/reference/"

# But files should still exist locally:
ls -la reference/
ls -la "projects/Synthetic Biophilia/reference/"
```

---

## 🔍 What Happens Next?

### For You (Local Development):
- ✅ Reference files stay on your computer
- ✅ Cursor can access them
- ✅ You can browse, edit, reference them
- ✅ Git ignores them (won't commit/push)

### For Collaborators (After They Pull):
- ⚠️ They won't get your reference files
- 💡 They can add their own reference files locally
- ✅ No issues since they're personal dev resources

### For Future You:
- ✅ New files in `reference/` automatically ignored
- ✅ Can add/remove reference files freely
- ✅ Never accidentally commit them

---

## 🚫 What If I Need to Share a Reference File?

If a specific reference file is actually needed by the project:

### Option 1: Move to Documentation
```bash
# Move important docs to a tracked location
mv reference/important-doc.md blog/docs/
git add blog/docs/important-doc.md
git commit -m "docs: add important reference document"
```

### Option 2: External Repository
```bash
# Create separate repo for reference materials
cd ..
mkdir SiteBoy-Reference
cp -r SiteBoy/reference/* SiteBoy-Reference/
cd SiteBoy-Reference
git init
git add .
git commit -m "Reference materials archive"
```

### Option 3: Cloud Storage
- Upload to Google Drive / Dropbox
- Share link in README.md
- Team members download separately

---

## ⚡ Quick Commands Reference

```bash
# Remove from Git, keep locally
git rm -r --cached reference/

# Commit the changes
git commit -m "chore: remove reference from tracking"

# Verify not tracked
git ls-files reference/  # Should show nothing

# Verify still exists locally
ls reference/  # Should show your files
```

---

## 🆘 Troubleshooting

### "fatal: pathspec 'reference/' did not match any files"
**Cause:** Already removed or not tracked
**Solution:** That's fine! Skip to next step

### "error: the following files have changes:"
**Cause:** Uncommitted changes in reference files
**Solution:** Run `git commit -a -m "save changes"` first, then retry

### "I accidentally deleted the local files!"
**Before you committed:**
```bash
git restore reference/
```

**After you committed:**
```bash
# Get them from previous commit
git checkout HEAD~1 -- reference/
# Then remove from tracking again
git rm -r --cached reference/
git commit -m "chore: properly remove reference from tracking"
```

### Files still showing up in Git?
```bash
# Force remove from Git cache
git rm -rf --cached reference/
git commit -m "chore: force remove reference from tracking"
```

---

## 📊 Expected Results

### Repo Size Before:
```bash
du -sh .git
# ~20-22GB
```

### Repo Size After (eventually, after gc):
```bash
git gc --aggressive --prune=now
du -sh .git
# Much smaller! (depends on reference size)
```

### Git Operations Before:
- `git status`: 5-10 seconds
- `git push`: Minutes (if reference was modified)
- `git clone`: Hours for new developers

### Git Operations After:
- `git status`: < 1 second
- `git push`: Seconds
- `git clone`: Minutes (not hours!)

---

## ✅ Confirmation Checklist

After running commands, verify:

- [ ] `git ls-files reference/` shows nothing
- [ ] `ls reference/` shows your files (still exist locally)
- [ ] `.gitignore` contains `reference/`
- [ ] `git status` doesn't show reference files
- [ ] Cursor can still access reference files
- [ ] Git operations are faster

---

## 🎓 Why This Works

### .gitignore
Tells Git: "Don't track new files in these directories"

### git rm --cached
Tells Git: "Stop tracking these existing files (but don't delete them)"

### Together
- Git stops tracking reference files ✅
- Files stay on your computer ✅
- Cursor can still access them ✅
- Repo becomes much smaller ✅

---

## 💡 Pro Tips

1. **Do this BEFORE cleaning up other large files** - Get reference out first
2. **Keep a backup** before first time: `cp -r reference/ ../reference-backup/`
3. **Document what's in reference** in a README so team knows what's available
4. **Use relative symlinks** if you need reference files accessible from multiple projects

---

## 🚀 Next Steps After This

Once reference files are removed from Git:

1. Consider doing the same for large media files (see `RESTRUCTURE_QUICKSTART.md`)
2. Clean up old Git history (optional): `git gc --aggressive --prune=now`
3. Continue developing - reference files stay accessible locally!

---

## 📞 Summary

**One command does it:**
```bash
git rm -r --cached reference/
```

**Then commit:**
```bash
git commit -m "chore: remove reference from tracking"
```

**Result:**
- Files stay on your computer ✅
- Cursor can access them ✅
- Git ignores them ✅
- Smaller, faster repo ✅

**That's it!** 🎉

