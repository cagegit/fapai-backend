from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from db import models,session, schemas
from db.crud import get_user_by_phone, get_user

SECRET_KEY = "36ebb843a93cd47b736dee01e303adf4121b1e92bc4a41a12a6a152fad97cfab"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

AC_TOKEN = 'access_token'
RF_TOKEN = 'refresh_token'

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# redis_con = redis.Redis(**REDIS_CFG)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def authenticate_user(db, phone: str, password: str):
    user = await get_user_by_phone(db, phone)
    print(user.hashed_password)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


# 生成访问token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    to_encode.update({"scope": AC_TOKEN})
    to_encode.update({"iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# 生成刷新token
def create_refresh_token(user_phone: str):
    payload = {
        'exp' : datetime.utcnow() + timedelta(days=10), # 十天
        'iat' : datetime.utcnow(),
        'scope': RF_TOKEN,
        'sub': user_phone
    }
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# 刷新token
def refresh_the_token(refresh_token:str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload['scope'] == RF_TOKEN and payload['sub']:
            return create_access_token(data={"sub": payload['sub']}) 
        else:    
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="refresh token校验失败",
                headers={"WWW-Authenticate": "Bearer"},
            )         
    except jwt.ExpiredSignatureError:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="refresh token已过期",
                headers={"WWW-Authenticate": "Bearer"},
            )         
    except JWTError:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )    


async def get_current_user(db=Depends(session.get_db),token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="token校验失败",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        if phone is None:
            raise credentials_exception
        token_data = schemas.TokenData(phone=phone)
    except JWTError:
        raise credentials_exception
    user = await get_user_by_phone(db, phone=token_data.phone)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_super:
        raise HTTPException(
            status_code=403, detail="没有足够的权限"
        )
    return current_user

# 注册用户
async def sign_up_new_user(db, phone: str, password: str):
    user = await get_user_by_phone(db, phone)
    if user:
        return False  # User already exists
    new_user = await create_user(
        db,
        schemas.UserCreate(
            name=phone,
            phone=phone,
            password=password,
            is_active=True,
            is_super=False,
        ),
    )
    return new_user

# 新增用户
async def create_user(db: AsyncSession, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        phone=user.phone,
        is_active=user.is_active,
        is_super=user.is_super,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
# 编辑用户
async def edit_user(
    db: AsyncSession, user_id: int, user: schemas.UserEdit
) -> schemas.User:
    db_user = await get_user(db, user_id)
    update_data = user.dict(exclude_unset=True)

    if "password" in update_data:
        update_data["hashed_password"] =  get_password_hash(user.password)
        del update_data["password"]
    for key, value in update_data.items():
        setattr(db_user, key, value)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user