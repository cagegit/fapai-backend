from typing import List, AnyStr

from core.setting import settings
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from db.session import engine, Base
from core.security import get_current_active_user
from routers.users import users_router
from routers.auth import auth_router
from routers.good import goods_router
from routers.area import areas_router
from routers.model import models_router
from fastapi_pagination import add_pagination
import uvicorn

app = FastAPI(title="REST API for Fapai", debug=True)

@app.on_event("startup")
async def start_event():
    # logger = logging.getLogger('uvicorn.access')
    # handler = logging.StreamHandler()
    # handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))    
    # logger.addHandler(handler)
    # fastapi_logger.handlers = logger.handlers
    # fastapi_logger.setLevel(logging.DEBUG)
    # fastapi_logger.debug('fuck')
    print('load engine .....')
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# @app.middleware("http")
# async def db_session_middleware(request: Request, call_next):
#     request.state.db = SessionLocal()
#     response = await call_next(request)
#     request.state.db.close()
#     return response


@app.get("/api/v1")
async def root():
    return {"message": "Hello World"}


# @app.get("/guis", response_model=List[Gui], response_model_by_alias=False, status_code=status.HTTP_200_OK)
# async def read_notes(skip: int = 0, take: int = 20):
#     query = guis.select().offset(skip).limit(take)
#     return await database.fetch_all(query)


# Routers
app.include_router(
    users_router,
    prefix="/api/v1",
    tags=["users"],
    dependencies=[Depends(get_current_active_user)],
)
app.include_router(
    goods_router,
    prefix="/api/v1",
    tags=["goods"],
    dependencies=[Depends(get_current_active_user)],
)
app.include_router(
    areas_router,
    prefix="/api/v1",
    tags=["areas"],
    dependencies=[Depends(get_current_active_user)],
)
app.include_router(
    models_router,
    prefix="/api/v1",
    tags=["models"],
    dependencies=[Depends(get_current_active_user)],
)
app.include_router(auth_router, prefix="/api", tags=["auth"])


add_pagination(app)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True, port=8080, debug=True, log_level='info')