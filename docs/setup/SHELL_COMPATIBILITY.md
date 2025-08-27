# 🐚 Shell Compatibility Guide

## 🎯 **Overview**

This project supports multiple shells (bash, zsh, fish, etc.) by using POSIX-compliant scripts and shell-agnostic commands.

## 🚀 **Quick Start (Any Shell)**

### **🔧 One-Time Setup:**
```sh
# Clone and setup everything
git clone https://github.com/skhsu91/habit-tracker.git
cd habit-tracker
./scripts/setup.sh
```

### **🎬 Start Development:**
```sh
# Start both backend and frontend
./scripts/dev-start.sh

# Stop all servers
./scripts/dev-stop.sh
```

## 🐚 **Shell-Specific Solutions**

### **✅ Zsh (macOS default)**
Works perfectly with our POSIX scripts:
```zsh
# Our scripts handle zsh automatically
./scripts/dev-start.sh
```

### **✅ Bash (Linux default)**
Native compatibility:
```bash
# All commands work as-is
./scripts/dev-start.sh
```

### **✅ Fish Shell**
Compatible with our POSIX scripts:
```fish
# Scripts work, but for manual commands use fish syntax:
set -x SUPABASE_SERVICE_ROLE_KEY "your-key-here"
```

### **✅ Windows (Git Bash/WSL)**
Use our scripts in Git Bash or WSL:
```sh
# In Git Bash or WSL
./scripts/dev-start.sh
```

## 🔧 **Shell-Agnostic Techniques Used**

### **1. POSIX Shebang:**
```sh
#!/bin/sh
# Works across all POSIX-compliant shells
```

### **2. Virtual Environment Activation:**
```sh
# Shell-agnostic (works with bash, zsh, etc.)
if [ -f "venv/bin/activate" ]; then
    . venv/bin/activate  # Note: dot notation, not 'source'
elif [ -f "venv/Scripts/activate" ]; then
    . venv/Scripts/activate  # Windows compatibility
fi
```

### **3. Command Existence Check:**
```sh
# POSIX-compliant
command_exists() {
    command -v "$1" >/dev/null 2>&1
}
```

### **4. File Existence Check:**
```sh
# Instead of bash-specific [[ ]]
if [ -f "filename" ]; then
    echo "File exists"
fi
```

### **5. Conditional Execution:**
```sh
# POSIX-compliant
test -f docs/.work_status.md && cat docs/.work_status.md || echo "File not found"
```

## ⚠️ **Common Shell Pitfalls Avoided**

### **❌ Bash-specific (avoid):**
```bash
# These cause issues in zsh/fish:
source venv/bin/activate  # Use '. venv/bin/activate' instead
[[ condition ]]           # Use '[ condition ]' instead
$'string\n'              # Use printf instead
```

### **✅ Shell-agnostic (use):**
```sh
# These work everywhere:
. venv/bin/activate      # POSIX-compliant
[ condition ]            # POSIX test
printf "string\n"        # POSIX output
```

## 🔍 **Environment Variable Management**

### **Shell-Agnostic .env Loading:**
Our scripts use `python-dotenv` to load environment variables, avoiding shell-specific export syntax:

```python
# In config.py - works regardless of shell
import os
from dotenv import load_dotenv

load_dotenv()  # Loads .env automatically
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
```

### **Manual Environment Variables (if needed):**
```sh
# POSIX-compliant (works in any shell)
export VARIABLE_NAME="value"

# Shell-specific alternatives:
# Zsh/Bash: export VAR="value"
# Fish: set -x VAR "value"
# PowerShell: $env:VAR="value"
```

## 📋 **Troubleshooting**

### **Issue: "source: command not found"**
```sh
# ❌ Don't use:
source venv/bin/activate

# ✅ Use instead:
. venv/bin/activate
```

### **Issue: "[[: command not found"**
```sh
# ❌ Don't use:
if [[ condition ]]; then

# ✅ Use instead:
if [ condition ]; then
```

### **Issue: Script permission denied**
```sh
# Make scripts executable:
chmod +x scripts/*.sh
```

### **Issue: Different shell syntax errors**
Use our provided scripts instead of manual commands:
```sh
# Instead of complex shell-specific commands:
./scripts/dev-start.sh  # Handles all shell differences
```

## 🎯 **Best Practices**

### **1. Use Our Scripts:**
- ✅ `./scripts/setup.sh` - Initial setup
- ✅ `./scripts/dev-start.sh` - Start development
- ✅ `./scripts/dev-stop.sh` - Stop servers

### **2. Document Shell-Agnostic Commands:**
When adding new commands to documentation, use `sh` syntax:
```sh
# ✅ Good
git checkout main && git pull origin main

# ❌ Avoid shell-specific
git checkout main; and git pull origin main  # Fish-specific
```

### **3. Test Across Shells:**
Before committing scripts, test in multiple shells:
```sh
# Test in different shells
bash ./scripts/dev-start.sh
zsh ./scripts/dev-start.sh
sh ./scripts/dev-start.sh
```

## 🔗 **References**

- **POSIX Standard**: Ensures maximum compatibility
- **Shell Scripts**: Located in `scripts/` directory
- **Environment Variables**: Managed via Python `python-dotenv`
- **Documentation**: All shell commands use POSIX syntax

---

*By following these guidelines, the project works seamlessly across all major shells and operating systems.*
