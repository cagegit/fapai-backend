from fastapi import APIRouter, Request, Depends, Response, encoders
import typing as t
from db.session import get_db
from db.crud import  get_users, get_user_by_phone
from db.schemas import UserCreate, UserEdit, User, UserOut
from core.security import get_current_active_superuser, get_current_active_user, edit_user

users_router = router  = APIRouter()

@router.get(
    "/users",
    response_model=t.List[User],
    response_model_exclude_none=True,
)
async def users_list(
    response: Response,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Get all users
    """
    users = await get_users(db)
    # This is necessary for react-admin to work
    response.headers["Content-Range"] = f"0-9/{len(users)}"
    return users

@router.put(
    "/user/{user_id}", 
    response_model=User, 
    response_model_exclude_none=True
)
async def user_edit(
    request: Request,
    user_id: int,
    user: UserEdit,
    db=Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    """
    Update existing user
    """
    return await edit_user(db, user_id, user)

@router.get(
    "/me",
    response_model=User,
    response_model_exclude_none=True,
)
async def get_me(
    current_user=Depends(get_current_active_user),
):
    """
    获取当前用户
    """
    return current_user