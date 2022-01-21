from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from core import config

# engine = create_engine(
#     config.SQLALCHEMY_DATABASE_URI,
# )
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
engine = create_async_engine(config.SQLALCHEMY_DATABASE_URI, future=True, echo=True, pool_pre_ping=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()


# Dependency
# def get_db():
#     db = async_session()
#     try:
#         yield db
#     finally:
#         db.close()

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
        # await session.commit()