from fastapi import APIRouter, Request, Depends, Response, encoders
import typing as t
from db.session import get_db
from db.crud import  add_model, edit_model, delete_model, search_model_all
from db.schemas import ModelOut, Model

models_router = router  = APIRouter()

@router.get(
    "/models",
    response_model=t.Dict[str, t.List[ModelOut]],
    response_model_exclude_none=True,
)
async def get_area_list(
    db=Depends(get_db)
):
    """
    Get all models
    """
    models = await search_model_all(db)
    return {'data': models}


@router.post("/model")
async def add_model_to_db(
    model_in: Model,
    db=Depends(get_db),  
):
    """
    add model to db
    """
    model = await add_model(db, model_in)
    return model

@router.delete("/model/{id}")
async def delete_model_in_db(
    id: int,
    db=Depends(get_db),  
):
    """
    delete model in db
    """
    model = await delete_model(db, id)
    return model

@router.put("/model/{id}")
async def update_model_to_db(
    id: int,
    area: Model,
    db=Depends(get_db),  
):
    """
    update model in db
    """
    model_new = await edit_model(db, id, area)
    return model_new