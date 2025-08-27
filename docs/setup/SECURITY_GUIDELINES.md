# 🔐 Security Guidelines

## 🚨 CRITICAL: Never Commit Sensitive Information

### **What NOT to Commit:**
- API keys (service role keys, client secrets)
- Database passwords 
- OAuth tokens
- Service account credentials
- Any authentication secrets

### **✅ Security Protocol for Sensitive Data:**

#### **1. Move to Environment Variables**
```python
# ❌ WRONG - Never do this:
API_KEY = "sk_live_actual_secret_key_here"

# ✅ CORRECT - Use environment variables:
API_KEY = os.getenv("API_KEY")
```

#### **2. Create .env File (Gitignored)**
```bash
# backend/.env - Contains actual secrets (NEVER COMMIT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_CLIENT_SECRET=your_actual_secret_here
```

#### **3. Create .env.example Template (Safe to Commit)**
```bash
# backend/.env.example - Template for team members (SAFE TO COMMIT)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

#### **4. Update Config Files**
```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file

# Safe public values
SUPABASE_URL = "https://yourproject.supabase.co"  # Public URL

# Sensitive values from environment
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Secret
```

#### **5. Verify .gitignore**
```bash
# Ensure these are in .gitignore:
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*credentials*.json
*client_secret*.json
```

### **🔄 Setup Process for Team Members:**
1. **Copy template**: `cp .env.example .env`
2. **Fill in secrets**: Edit `.env` with actual values
3. **Never commit**: The `.env` file stays local only

### **✅ Benefits:**
- ✅ **Secure**: No secrets in version control
- ✅ **Easy setup**: Template guides new developers
- ✅ **Version controlled**: Non-sensitive config tracked
- ✅ **Deployment ready**: Environment variables work in production

### **🚨 If You Accidentally Commit Secrets:**
1. **Immediately rotate** the compromised credentials
2. **Remove from git history** using `git filter-branch` or `BFG Repo-Cleaner`
3. **Update all team members** about the incident
4. **Review and improve** the security process

---

*Security is everyone's responsibility. When in doubt, use environment variables!*
