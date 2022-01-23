
from fastapi import HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_pagination.ext.async_sqlalchemy import paginate
import typing as t
from db.schemas import GoodSearchParmas
from db import models, schemas

# ------------- 用户 ---------
async def get_user(db: AsyncSession, user_id: int):
    q = await db.execute(select(models.User).filter(models.User.id == user_id))
    user = q.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


async def get_user_by_phone(db: AsyncSession, phone: str) -> schemas.UserBase:
    print(phone)
    q = await db.execute(select(models.User).filter(models.User.phone == phone))
    # print(q.scalars().all())
    return q.scalars().first()
# 查找用户列表
async def get_users(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> t.List[schemas.UserOut]:
    q = await db.execute(select(models.User).offset(skip).limit(limit))
    return q.scalars().all()

# ------------- 商品 ---------
async def get_good_by_id(db: AsyncSession, good_id: int):
    q = await db.execute(select(models.Good).filter(models.Good.id == good_id))
    good = q.scalars().first()
    if not good:
        raise HTTPException(status_code=404, detail="商品不存在")
    return good

async def get_good_by_title(db: AsyncSession, title: str) -> schemas.GoodOut:
    print(title)
    q = await db.execute(select(models.Good).filter(models.Good.title == title))
    return q.scalars().first()

# 获取全部商品
async def get_goods(
    db: AsyncSession,
    params: t.Optional[GoodSearchParmas] = None
) -> t.Any:
    if params:
        params = params.dict()
        print(params)
        search_args = []
        for x in params:
            if params[x]:
                value = params[x]
                if x == 'title' or x == 'description':
                    value = f'%{value}%'
                    search_args.append(getattr(models.Good,x).like(value))
                else:
                    search_args.append(getattr(models.Good,x)==value)    
        # print(search_args)        
        return await paginate(db, select(models.Good).filter(and_(*search_args)))
    else:    
        return await paginate(db, select(models.Good))
    # return result.scalars().all()

# 获取全部商品不分页
async def get_goods_all(
    db: AsyncSession,
    title: str = None
) -> t.List[schemas.GoodOut]:
    if title:    
        result = await db.execute(select(models.Good).filter(models.Good.title.like(f'%{title}%')))
    else:    
        result = await db.execute(select(models.Good))
    return result.scalars().all()

# 货品添加
async def add_good(db: AsyncSession, good: schemas.GoodIn):
    old_good = await get_good_by_title(db, good.title)
    if old_good:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="商品名称重复",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(good)    
    db_good = models.Good(
        title=good.title,
        picture=good.picture,
        price=good.price,
        area_id=good.area_id,
        description=good.description,
        tags=None
    )
    db.add(db_good)
    await db.commit()
    await db.refresh(db_good)
    return db_good

# 货品编辑
async def edit_good(
    db: AsyncSession, good_id: int, good: schemas.GoodEdit
) -> schemas.GoodOut:
    db_good = await get_good_by_id(db, good_id)
    update_data = good.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_good, key, value)
    db.add(db_good)
    await db.commit()
    await db.refresh(db_good)
    return db_good

# 货品删除
async def delete_good(
    db: AsyncSession, good_id: int
) -> schemas.GoodOut:
    db_good = await get_good_by_id(db, good_id)
    await db.delete(db_good)
    await db.commit()
    return db_good

# ------------- 区域 ---------
# 查询单个区域
async def get_area_by_id(db: AsyncSession, area_id: int):
    q = await db.execute(select(models.Area).filter(models.Area.id == area_id))
    area = q.scalars().first()
    if not area:
        raise HTTPException(status_code=404, detail="区域不存在")
    return area

async def get_area_by_name(db: AsyncSession, area_name: str):
    q = await db.execute(select(models.Area).filter(models.Area.name == area_name))
    return q.scalars().first()

# 区域新增
async def add_area(db: AsyncSession, area: schemas.Area):
    old_area = await get_area_by_name(db, area.name)
    if old_area:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="区域名称重复",
            headers={"WWW-Authenticate": "Bearer"},
        )  
    db_area = models.Area(
        name=area.name
    )
    db.add(db_area)
    await db.commit()
    await db.refresh(db_area)
    return db_area

# 区域编辑
async def edit_area(
    db: AsyncSession, area_id: int, area: schemas.Area
) -> schemas.GoodOut:
    db_area = await get_area_by_id(db, area_id)
    update_data = area.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_area, key, value)
    db.add(db_area)
    await db.commit()
    await db.refresh(db_area)
    return db_area

# 区域查询
async def search_area(
    db: AsyncSession,
    name:str = None
) -> t.Any:
    if name:       
        return await paginate(db, select(models.Area).filter(models.Area.name.like(f'%{name}%')))
    else:    
        return await paginate(db, select(models.Area))
    
# 全部区域
async def search_area_all (
    db: AsyncSession
) -> t.Any:
    result = await db.execute(select(models.Area).limit(1000))  
    return result.scalars().all()

# 区域删除
async def delete_area(
    db: AsyncSession, area_id: int
) -> schemas.AreaOut:
    db_area = await get_area_by_id(db, area_id)
    await db.delete(db_area)
    await db.commit()
    return db_area

# ------------- 模版 -------------
# 查询单个模版
async def get_model_by_id(db: AsyncSession, id: int):
    q = await db.execute(select(models.Model).filter(models.Model.id == id))
    model = q.scalars().first()
    if not model:
        raise HTTPException(status_code=404, detail="模版不存在")
    return model

async def get_model_by_title(db: AsyncSession, title: str):
    q = await db.execute(select(models.Model).filter(models.Model.title == title))
    return q.scalars().first()

# 模版新增
async def add_model(db: AsyncSession, model: schemas.Model):
    old_model = await get_model_by_title(db, model.title)
    if old_model:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="模版名称重复",
            headers={"WWW-Authenticate": "Bearer"},
        )  
    db_model = models.Model(
        title=model.title,
        bdw_info=model.bdw_info,
        pmxz_info=model.pmxz_info,
        pmgg_info=model.pmgg_info,
        description=model.description
    )
    db.add(db_model)
    await db.commit()
    await db.refresh(db_model)
    return db_model

# 模型编辑
async def edit_model(
    db: AsyncSession, model_id: int, model: schemas.Model
) -> schemas.ModelOut:
    db_model = await get_model_by_id(db, model_id)
    update_data = model.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_model, key, value)
    db.add(db_model)
    await db.commit()
    await db.refresh(db_model)
    return db_model

# 全部模型
async def search_model_all(
    db: AsyncSession
) -> t.List[schemas.ModelOut]:
    result = await db.execute(select(models.Model).limit(1000))  
    return result.scalars().all()

# 模型删除
async def delete_model(
    db: AsyncSession, model_id: int
) -> schemas.AreaOut:
    db_model = await get_model_by_id(db, model_id)
    await db.delete(db_model)
    await db.commit()
    return db_model