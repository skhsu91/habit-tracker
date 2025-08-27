# 🤖 Agent Workflow & Coordination

*Git workflow guidelines and coordination strategies for multi-agent development*

## 🔄 **Essential Git Workflow for Multi-Agent Coordination**

### **At Session Start:**
```bash
# 1. ALWAYS start with fresh main branch
git checkout main
git pull origin main

# 2. Check current work status (if file exists)
cat docs/.work_status.md || echo "No active work tracking file"

# 3. Check recent activity to avoid conflicts
git log --oneline -10

# 4. Create your descriptive feature branch
git checkout -b feature/your-descriptive-task-name
```

#### **During Development:**
```bash
# Frequent commits with descriptive messages
git add .
git commit -m "feat/fix/docs: specific change description"

# Push regularly to backup work
git push origin feature/your-branch-name
```

#### **Before Creating PR:**
```bash
# 1. Ensure you're up to date
git checkout main
git pull origin main
git checkout feature/your-branch-name
git rebase main

# 2. Update status documents if needed
# - Update PROJECT_STATUS.md if it's a major feature
# - Update local .work_status.md (optional)

# 3. Final commit
git add .
git commit -m "feat/fix: [description of changes]"
git push origin feature/your-branch-name
```

#### **After PR Creation:**
```bash
# If you're the one merging (with approvals):
gh pr merge [pr-number] --squash --delete-branch

# After ANY PR is merged (yours or others):
git checkout main
git pull origin main
git branch -d feature/old-branch-name  # Clean up local branches
```

### **🚨 Critical Git Rules for Multi-Agent Work:**

1. **NEVER work directly on main** - Always use feature branches
2. **ALWAYS pull main before starting** - Get latest changes first
3. **Update WORK_STATUS.md immediately** - Claim tasks to avoid conflicts
4. **Rebase before PR** - Keep clean history and resolve conflicts early
5. **Pull main after any PR merge** - Stay synchronized with team changes

### **📱 Quick Status Commands:**
```bash
# Check recent activity
git log --oneline -10

# See if main has new changes
git fetch && git log HEAD..origin/main --oneline

# Check for local changes before switching branches  
git status

# Optional: Check local work status (if using .work_status.md)
cat docs/.work_status.md 2>/dev/null || echo "No local work status file"
```

## 🔍 **Conflict Prevention Strategy**

### **High-Risk Files (Coordinate Before Editing):**
- `docs/PROJECT_STATUS.md` - Update only for major features
- `backend/config.py` - Central configuration
- `frontend/src/App.tsx` - Main app structure
- `backend/main.py` - Core API routes

### **Safe for Parallel Work:**
- Individual components in `frontend/src/components/`
- Separate files in `backend/data_sources/`
- Different documentation files in `docs/setup/` or `docs/prds/`
- Isolated utility functions

### **If You Encounter Conflicts:**
1. **Don't guess** - Ask in project channel or leave detailed PR comments
2. **Coordinate directly** - Tag the other agent working on related files
3. **Use small PRs** - Easier to resolve conflicts and review changes

---

*This document provides real-time coordination. For high-level context, see [PROJECT_STATUS.md](PROJECT_STATUS.md)*
