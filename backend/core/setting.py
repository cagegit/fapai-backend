from pydantic import BaseSettings

class Settings(BaseSettings):
    
    POSTGRESQL_URI: str
    
    class Config:
        case_sensitive = True

settings = Settings() 
    