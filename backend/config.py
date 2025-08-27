"""
Configuration settings for the Habit Tracker backend.

This file contains non-sensitive configuration constants. 
Sensitive values (API keys, secrets) are loaded from environment variables.

Supports multiple secret management approaches:
- Local development: .env files (default)
- Cloud platforms: Environment variables
- Enterprise: AWS Secrets Manager, Azure Key Vault, etc.
"""

import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Google Sheets Configuration
GOOGLE_SHEETS_ID = "1XNStkzcSwSxsPQ6-XRNL1wCjwfc1MQeEhDRJOPB2u1s"

# Google Calendar Configuration
GOOGLE_CALENDAR_CREDENTIALS_FILE = "google_calendar_credentials.json"
GOOGLE_CALENDAR_TOKEN_FILE = "google_calendar_token.json"

# ===================
# SECRET MANAGEMENT
# ===================

def get_secret(key: str, default: str = None, required: bool = True):
    """
    Flexible secret retrieval supporting multiple backends.
    
    Current priority order:
    1. Environment variables (includes .env file via load_dotenv())
    2. AWS Secrets Manager (if available)
    3. Azure Key Vault (if available)
    4. Default value (if provided)
    
    Args:
        key: Secret key name
        default: Default value if secret not found
        required: Whether to raise error if secret not found
    
    Returns:
        Secret value as string
    """
    
    # 1. Try environment variables first (includes .env file)
    value = os.getenv(key)
    if value:
        logger.debug(f"✅ Found {key} in environment variables")
        return value
    
    # 2. Try AWS Secrets Manager (if boto3 available)
    try:
        import boto3
        from botocore.exceptions import ClientError
        
        secret_name = os.getenv("AWS_SECRET_NAME", "habit-tracker/secrets")
        region = os.getenv("AWS_REGION", "us-east-1")
        
        session = boto3.session.Session()
        client = session.client(service_name='secretsmanager', region_name=region)
        
        try:
            response = client.get_secret_value(SecretId=secret_name)
            import json
            secrets = json.loads(response['SecretString'])
            if key in secrets:
                logger.info(f"✅ Found {key} in AWS Secrets Manager")
                return secrets[key]
        except ClientError as e:
            logger.debug(f"AWS Secrets Manager not available: {e}")
            
    except ImportError:
        logger.debug("boto3 not available, skipping AWS Secrets Manager")
    
    # 3. Try Azure Key Vault (if azure-keyvault available)
    try:
        from azure.keyvault.secrets import SecretClient
        from azure.identity import DefaultAzureCredential
        
        vault_url = os.getenv("AZURE_KEY_VAULT_URL")
        if vault_url:
            credential = DefaultAzureCredential()
            client = SecretClient(vault_url=vault_url, credential=credential)
            
            try:
                secret = client.get_secret(key.lower().replace('_', '-'))
                logger.info(f"✅ Found {key} in Azure Key Vault")
                return secret.value
            except Exception as e:
                logger.debug(f"Azure Key Vault lookup failed: {e}")
                
    except ImportError:
        logger.debug("azure-keyvault not available, skipping Azure Key Vault")
    
    # 4. Use default value if provided
    if default is not None:
        logger.debug(f"Using default value for {key}")
        return default
    
    # 5. Raise error if required and not found
    if required:
        raise ValueError(f"❌ Required secret '{key}' not found in any secret store")
    
    return None

# ===================
# SUPABASE CONFIGURATION
# ===================

SUPABASE_URL = "https://tprmeubgiatqbbwfkcdt.supabase.co"  # Public URL - safe to commit
SUPABASE_SERVICE_ROLE_KEY = get_secret("SUPABASE_SERVICE_ROLE_KEY", required=True)
SUPABASE_TABLE_NAME = "ht-calendar-events"

# ===================
# SERVER CONFIGURATION  
# ===================

API_HOST = get_secret("API_HOST", default="0.0.0.0", required=False)
API_PORT = int(get_secret("PORT", default=get_secret("API_PORT", default="8000", required=False), required=False))
FRONTEND_URL = get_secret("FRONTEND_URL", default="http://localhost:3000", required=False)

# ===================
# ENVIRONMENT CONFIGURATION
# ===================

ENVIRONMENT = get_secret("ENVIRONMENT", default="development", required=False)
DEBUG_MODE = get_secret("DEBUG_MODE", default="true", required=False).lower() == "true"
DEFAULT_DATA_SOURCE = get_secret("DEFAULT_DATA_SOURCE", default="supabase", required=False)

# ===================
# OPTIONAL SECRETS (for future features)
# ===================

# Google Calendar OAuth (optional)
GOOGLE_CLIENT_ID = get_secret("GOOGLE_CLIENT_ID", required=False)
GOOGLE_CLIENT_SECRET = get_secret("GOOGLE_CLIENT_SECRET", required=False)

# Database connection string (if using direct PostgreSQL)
DATABASE_URL = get_secret("DATABASE_URL", required=False)

# External API keys (for future integrations)
STRIPE_API_KEY = get_secret("STRIPE_API_KEY", required=False)
SENDGRID_API_KEY = get_secret("SENDGRID_API_KEY", required=False)

# API Configuration - Environment-specific CORS
if ENVIRONMENT == "production":
    CORS_ORIGINS = [
        os.getenv("FRONTEND_URL", "https://your-app.vercel.app"),
        "https://your-custom-domain.com"  # Add your production domains
    ]
elif ENVIRONMENT == "staging":
    CORS_ORIGINS = [
        os.getenv("FRONTEND_URL", "https://staging-your-app.vercel.app"),
        "http://localhost:3000"  # Still allow local development
    ]
else:  # development
    CORS_ORIGINS = [
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",  # Alternative localhost
    ]

# Debug Settings
VERBOSE_LOGGING = DEBUG_MODE

# ===================
# CONFIGURATION SUMMARY (at startup)
# ===================

def print_config_summary():
    """Print configuration summary at startup (non-sensitive info only)"""
    print(f"🔧 Configuration Summary:")
    print(f"   Environment: {ENVIRONMENT}")
    print(f"   Debug Mode: {DEBUG_MODE}")
    print(f"   Data Source: {DEFAULT_DATA_SOURCE}")
    print(f"   API Port: {API_PORT}")
    print(f"   Supabase: {'✅ Connected' if SUPABASE_SERVICE_ROLE_KEY else '❌ Not configured'}")
    
    # Show which secret management backends are available
    secret_backends = ["Environment Variables (.env)"]
    try:
        import boto3
        secret_backends.append("AWS Secrets Manager")
    except ImportError:
        pass
    
    try:
        from azure.keyvault.secrets import SecretClient
        secret_backends.append("Azure Key Vault")
    except ImportError:
        pass
        
    print(f"   Secret Backends: {', '.join(secret_backends)}")

# Print summary when config is imported (only in non-test environments)
if ENVIRONMENT != "test" and __name__ != "__main__":
    print_config_summary()
