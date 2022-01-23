from sqlalchemy import Boolean, Column, Integer, String, TIMESTAMP, DECIMAL,  Text
from sqlalchemy.sql import func

from .session import Base

# 用户模型
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_super = Column(Boolean, default=False)
    create_time = Column(TIMESTAMP, default=func.now(), server_default=func.now())
    update_time = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    
# 区域模型
class Area(Base):
      __tablename__ = "area"
      id = Column(Integer, primary_key=True, index=True)
      name = Column(String, nullable=False)
      create_time = Column(TIMESTAMP, default=func.now(), server_default=func.now())
      update_time = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
      
    
# 商品模型
class Good(Base):
      __tablename__ = "goods"
      id = Column(Integer, primary_key=True, index=True)
      title = Column(String, nullable=False)
      picture = Column(String, nullable=False)
      price = Column(DECIMAL, nullable=False)
      area_id = Column(Integer)
      create_time = Column(TIMESTAMP, default=func.now(), server_default=func.now())
      update_time = Column(TIMESTAMP, default=func.now(), onupdate=func.now()) 
      description = Column(String, nullable=True)  
      tags = Column(Text, nullable=True, server_default='{}')   
      
# 模版模型
class Model(Base):
     __tablename__ = "models"
     id = Column(Integer, primary_key=True, index=True)
     title = Column(String, nullable=False)
     bdw_info = Column(Text, nullable=False)
     pmgg_info = Column(Text, nullable=False)
     pmxz_info = Column(Text, nullable=False)
     description = Column(String, nullable=True)  
     create_time = Column(TIMESTAMP, default=func.now(), server_default=func.now())
     update_time = Column(TIMESTAMP, default=func.now(), onupdate=func.now()) 
       