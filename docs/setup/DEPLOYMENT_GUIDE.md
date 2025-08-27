# 🚀 Deployment Guide

## 🎯 **Secret Management Options**

### **Option 1: Environment Variables (Default - Current Setup)**
```bash
# Required
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
ENVIRONMENT=production
DEBUG_MODE=false
FRONTEND_URL=https://your-app.vercel.app
PORT=8000  # Most platforms set automatically
```

### **Option 2: AWS Secrets Manager (Enterprise)**
```bash
# Install: pip install -r requirements-enterprise.txt
# Environment variables for AWS access:
AWS_SECRET_NAME=habit-tracker/secrets
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Create secret in AWS:
aws secretsmanager create-secret \
  --name habit-tracker/secrets \
  --secret-string '{"SUPABASE_SERVICE_ROLE_KEY":"your_key_here"}'
```

### **Option 3: Azure Key Vault (Enterprise)**
```bash
# Install: pip install -r requirements-enterprise.txt
# Environment variables:
AZURE_KEY_VAULT_URL=https://your-vault.vault.azure.net/

# Create secrets in Azure:
az keyvault secret set --vault-name your-vault \
  --name supabase-service-role-key \
  --value "your_key_here"
```

### **Option 4: Mixed Approach (Recommended for Growth)**
```bash
# Current secrets in environment variables
SUPABASE_SERVICE_ROLE_KEY=xxx

# Future secrets in dedicated secret manager
AWS_SECRET_NAME=habit-tracker/future-secrets
AZURE_KEY_VAULT_URL=https://vault.azure.net/
```

## 🌐 **Platform-Specific Deployment**

### **1. Vercel (Frontend + Backend)**

#### **Frontend (React)**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy frontend
cd frontend
vercel

# 3. Set environment variables
vercel env add REACT_APP_API_URL production
# Value: https://your-backend.railway.app
```

#### **Backend (FastAPI on Railway)**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway up

# 3. Set environment variables
railway variables set SUPABASE_SERVICE_ROLE_KEY="your_key_here"
railway variables set SUPABASE_URL="https://your-project.supabase.co"
railway variables set ENVIRONMENT="production"
railway variables set DEBUG_MODE="false"
```

### **2. Single Platform Deployment (Vercel)**

#### **Full-Stack Vercel with API Routes**
```bash
# Create vercel.json in project root
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "backend/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/main.py" },
    { "src": "/(.*)", "dest": "/frontend/build/$1" }
  ]
}
```

### **3. Heroku Deployment**

#### **Procfile**
```bash
# Create Procfile in project root
web: cd backend && python main.py
```

#### **Environment Variables**
```bash
heroku config:set SUPABASE_SERVICE_ROLE_KEY="your_key_here"
heroku config:set SUPABASE_URL="https://your-project.supabase.co"
heroku config:set ENVIRONMENT="production"
heroku config:set DEBUG_MODE="false"
heroku config:set FRONTEND_URL="https://your-app.herokuapp.com"
```

### **4. Docker Deployment**

#### **Dockerfile**
```dockerfile
# Create Dockerfile in project root
FROM python:3.11-slim

# Backend setup
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ ./backend/
COPY frontend/build/ ./frontend/build/

# Environment variables will be set by deployment platform
EXPOSE 8000

CMD ["python", "backend/main.py"]
```

#### **docker-compose.yml (for local production testing)**
```yaml
version: '3.8'
services:
  habit-tracker:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - ENVIRONMENT=production
      - DEBUG_MODE=false
    env_file:
      - .env.production
```

## 🔐 **Security Best Practices**

### **1. Environment Variable Security**
```bash
# ✅ DO: Use platform environment variable systems
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# ❌ DON'T: Put secrets in code or config files
SUPABASE_SERVICE_ROLE_KEY = "actual_key_here"  # NEVER!
```

### **2. CORS Configuration**
```python
# Production CORS - only allow your domains
CORS_ORIGINS = [
    "https://your-app.vercel.app",
    "https://your-custom-domain.com"
]
```

### **3. Supabase RLS (Row Level Security)**
```sql
-- In Supabase, enable RLS for your tables
ALTER TABLE "ht-calendar-events" ENABLE ROW LEVEL SECURITY;

-- Create policies for your application
CREATE POLICY "Allow authenticated access" ON "ht-calendar-events"
FOR ALL USING (auth.uid() IS NOT NULL);
```

## 📋 **Pre-Deployment Checklist**

### **Code Preparation:**
- [ ] All secrets moved to environment variables
- [ ] CORS origins configured for production domains
- [ ] Debug mode disabled in production
- [ ] Error handling for missing environment variables

### **Environment Variables Set:**
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_URL` 
- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG_MODE=false`
- [ ] `FRONTEND_URL` (your production domain)

### **Database Setup:**
- [ ] Supabase project configured
- [ ] Table schema matches application
- [ ] Row Level Security enabled (if needed)
- [ ] API keys rotated for production

### **Testing:**
- [ ] Test environment variables locally with `.env.production`
- [ ] Verify CORS configuration
- [ ] Test API endpoints in production environment
- [ ] Confirm frontend can connect to production backend

## 🔧 **Environment-Specific Configuration**

### **Development** (`.env`)
```bash
SUPABASE_SERVICE_ROLE_KEY=your_dev_key
SUPABASE_URL=https://your-project.supabase.co
ENVIRONMENT=development
DEBUG_MODE=true
FRONTEND_URL=http://localhost:3000
```

### **Staging** (Platform env vars)
```bash
SUPABASE_SERVICE_ROLE_KEY=your_staging_key
SUPABASE_URL=https://your-staging-project.supabase.co
ENVIRONMENT=staging
DEBUG_MODE=false
FRONTEND_URL=https://staging-your-app.vercel.app
```

### **Production** (Platform env vars)
```bash
SUPABASE_SERVICE_ROLE_KEY=your_production_key
SUPABASE_URL=https://your-production-project.supabase.co
ENVIRONMENT=production
DEBUG_MODE=false
FRONTEND_URL=https://your-app.vercel.app
```

## 🚨 **Common Deployment Issues**

### **Issue: "Supabase connection failed"**
```bash
# Check environment variables are set
echo $SUPABASE_SERVICE_ROLE_KEY
# Should output your key, not empty

# Verify URL format
echo $SUPABASE_URL
# Should be: https://your-project.supabase.co
```

### **Issue: "CORS error"**
```python
# Update CORS_ORIGINS in config.py to include your production domain
CORS_ORIGINS = [
    "https://your-actual-domain.com"  # Must match exactly
]
```

### **Issue: "Port binding failed"**
```python
# Use environment PORT variable
API_PORT = int(os.getenv("PORT", "8000"))
```

## 🎯 **Recommended Deployment Stack**

**For Beginners:**
- **Frontend**: Vercel (React hosting)
- **Backend**: Railway (Python FastAPI)
- **Database**: Supabase (PostgreSQL)

**For Scale:**
- **Frontend**: Vercel or Cloudflare Pages
- **Backend**: AWS ECS or Google Cloud Run
- **Database**: Supabase Pro or AWS RDS

---

*Keep your secrets secure and your deployments automated!*
