from datetime import datetime
from db.models import Area
from pydantic import BaseModel
import typing as t


class UserBase(BaseModel):
    phone: str
    is_active: bool = True
    is_super: bool = False
    name: str = None


class UserOut(UserBase):
    pass


class UserCreate(UserBase):
    password: str

    class Config:
        orm_mode = True


class UserEdit(UserBase):
    password: t.Optional[str] = None

    class Config:
        orm_mode = True


class User(UserBase):
    id: int

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    phone: str = None
    
    
class GoodBase(BaseModel):
    title: str
    picture: str
    price: float
    area_id: int
    # create_time: datetime = None
    description: t.Optional[str]
    
class GoodIn(GoodBase):
    class Config:
        orm_mode = True  
    
class GoodOut(GoodBase):
    id: int
    class Config:
        orm_mode = True 
              
class GoodEdit(GoodBase):
    class Config:
        orm_mode = True         
        
        
# 商品搜索参数
class GoodSearchParmas(GoodBase):
    title: t.Optional[str] = None
    picture: t.Optional[str] = None
    price: t.Optional[float] = None
    area_id: t.Optional[int] = None
    
    class Config:
        orm_mode = True
        
# 区域schema        
class AreaBase(BaseModel):
    name: str   
    
class AreaOut(AreaBase):
    id:int
    class Config:
        orm_mode = True  
        
class Area(AreaBase):
    class Config:
        orm_mode = True          
        
 # 模版       
class ModelBase(BaseModel):
    # id: int
    title: str
    bdw_info: str
    pmxz_info: str
    pmgg_info: str
    description: t.Optional[str]           
    
class Model(ModelBase):
    class Config:
        orm_mode = True     
        
class ModelOut(ModelBase):
    id:int
    class Config:
        orm_mode = True    
        
class ModelList():
    data: t.List[ModelOut]            