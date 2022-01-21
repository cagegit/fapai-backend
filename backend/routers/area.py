from fastapi import APIRouter, Request, Depends, Response, encoders
import typing as t
from db.session import get_db
from db.crud import  add_area, edit_area, delete_area, search_area, search_area_all
from db.schemas import AreaOut, Area
from db.customPage import Page

areas_router = router  = APIRouter()

@router.get(
    "/areas",
    response_model=t.List[AreaOut],
    response_model_exclude_none=True,
)
async def get_area_list(
    db=Depends(get_db)
):
    """
    Get all areas
    """
    areas = await search_area_all(db)
    return areas

@router.post(
    "/areas",
    response_model=Page[AreaOut],
    response_model_exclude_none=True,
)
async def area_list(
    db=Depends(get_db),
    name:str = None,
):
    """
    Get all areas
    """
    areas = await search_area(db,name)
    return areas


@router.post("/area")
async def add_area_to_db(
    area_in: Area,
    db=Depends(get_db),  
):
    """
    add area to db
    """
    area = await add_area(db, area_in)
    return area

@router.delete("/area/{id}")
async def delete_area_in_db(
    id: int,
    db=Depends(get_db),  
):
    """
    delete area in db
    """
    area = await delete_area(db, id)
    return area

@router.put("/area/{id}")
async def update_area_to_db(
    id: int,
    area: Area,
    db=Depends(get_db),  
):
    """
    update area in db
    """
    area_new = await edit_area(db, id, area)
    return area_new