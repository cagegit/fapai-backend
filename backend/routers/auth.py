from fastapi.param_functions import Security
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from db.session import get_db
from core import security

auth_router = router = APIRouter()
security_info = HTTPBearer()

@router.post("/token")
async def login(
    db=Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await security.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_200_OK,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = security.create_access_token(
        data={"sub": user.phone},
        expires_delta=access_token_expires,
    )
    refresh_token = security.create_refresh_token(user.phone)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/signup")
async def signup(
    db=Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await security.sign_up_new_user(db, form_data.username,form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="账号已存在",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = security.create_access_token(
        data={"sub": user.phone},
        expires_delta=access_token_expires,
    )
    
    refresh_token = security.create_refresh_token(user.phone)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.get("/refresh_token")
def refresh_token(
    credentials: HTTPAuthorizationCredentials = Security(security_info)
):
    refresh_token = credentials.credentials
    print(refresh_token)
    new_access_token = security.refresh_the_token(refresh_token)
    return {"access_token": new_access_token}