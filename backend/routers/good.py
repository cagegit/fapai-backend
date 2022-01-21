from fastapi import APIRouter,  Depends, UploadFile, File, Header, HTTPException
from fastapi.responses import StreamingResponse
from starlette import status
import typing as t
from db.session import get_db
from db.crud import  get_goods, add_good, edit_good, delete_good, get_goods_all
from db.schemas import GoodIn, GoodOut, GoodEdit, GoodSearchParmas
from db.customPage import Page
from tempfile import NamedTemporaryFile
from core.upload import compress_and_resize_image, upload_to_tencent_os, upload_single_file
import time
import os 
from io import BytesIO
import xlsxwriter

goods_router = router  = APIRouter()
# 最大文件大小不超过5M
MAX_FILE_SIZE = 5_000_000
# 最大文件上传个数
MAX_FILE_COUNT = 5

@router.post(
    "/goods",
    response_model=Page[GoodOut],
    response_model_exclude_none=True,
)
async def goods_list(
    db=Depends(get_db),
    params: t.Optional[GoodSearchParmas] = None,
):
    """
    Get all goods
    """
    goods = await get_goods(db, params)
    # This is necessary for react-admin to work
    # response.headers["Content-Range"] = f"0-9/{len(goods)}"
    return goods


@router.post("/good")
async def add_good_db(
    good_in: GoodIn,
    db=Depends(get_db),  
):
    """
    add good to db
    """
    good = await add_good(db, good_in)
    return good

@router.delete("/good/{good_id}")
async def delete_good_in_db(
    good_id: int,
    db=Depends(get_db),  
):
    """
    delete good in db
    """
    good = await delete_good(db, good_id)
    return good

@router.put("/good/{good_id}")
async def update_good_to_db(
    good_id: int,
    good: GoodEdit,
    db=Depends(get_db),  
):
    """
    update good in db
    """
    good = await edit_good(db, good_id, good)
    return good

# 上传文件大小不超过10M
@router.post("/uploadfiles")
async def create_upload_files(files: t.List[UploadFile] = File(...)):
    # print(files)
    if len(files) > MAX_FILE_COUNT:
        raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail='单次最大文件上传个数不超过5个！'
            )
    # 检查文件类型
    for f in files:
        if f.content_type not in ['image/jpg','image/jpeg','image/png']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail='仅支持jpg、jpeg、png格式的文件！'
            )
    # 判断文件大小
    temp_files = []
    for f in files:
        real_file_size = 0
        file_names = f.filename.split('.')
        file_prefix = str(int(round(time.time() * 1000))) + '_' + file_names[0]
        file_suffix = file_names[1]
        temp = NamedTemporaryFile(suffix=f'.{file_suffix}', prefix=file_prefix, delete=False)
        for chunk in f.file:
            real_file_size += len(chunk)
            if real_file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail='上传文件大小不超过5M'
                ) 
            temp.write(chunk)
        temp_files.append(temp.name)           
        temp.close()        
    print(temp_files) 
    # 压缩处理图片
    compress_and_resize_image(temp_files)  
    # 上传到腾讯云
    results = upload_to_tencent_os(temp_files) 
    print(results) 
    clear_tmep_files(temp_files)
    if not results['success_all']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail='图片上传失败，请重试！'
        )
    return {"success": True, "data":[os.path.split(file_name)[1] for file_name in temp_files]}

# 上传单个文件
@router.post("/uploadfile")
async def create_upload_files(u_file: UploadFile = File(...)):
    # print(files)
    # 检查文件类型
    if u_file.content_type not in ['image/jpg','image/jpeg','image/png']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail='仅支持jpg、jpeg、png格式的文件！'
        )
    # 判断文件大小
    temp_files = []
    real_file_size = 0
    file_names = u_file.filename.split('.')
    file_prefix = str(int(round(time.time() * 1000))) + '_' + file_names[0]
    file_suffix = file_names[1]
    temp = NamedTemporaryFile(suffix=f'.{file_suffix}', prefix=file_prefix, delete=False)
    for chunk in u_file.file:
        real_file_size += len(chunk)
        if real_file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail='上传文件大小不超过5M'
            ) 
        temp.write(chunk)
    temp_files.append(temp.name)           
    temp.close() 
               
    print(temp_files) 
    # 压缩处理图片
    compress_and_resize_image(temp_files)  
    # 上传到腾讯云
    result = upload_single_file(temp_files[0]) 
    print(result) 
    clear_tmep_files(temp_files)
    if not result['ETag']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail='图片上传失败，请重试！'
        )
    return {"success": True, "data": os.path.split(temp_files[0])[1]}



# 清除临时上传文件
def clear_tmep_files(temp_files: t.List[str]):
    try: 
        for file_path in temp_files: 
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        print(e)  
        
# 导出文件        
@router.get("/output_xlsx", response_description='xlsx')
async def output_xlsx(db=Depends(get_db),title:str = None, area_id:int = None):
    output = BytesIO()
    workbook = xlsxwriter.Workbook(output)
    worksheet = workbook.add_worksheet('output')
    worksheet.write(0, 0, '序号')
    worksheet.write(0, 1, '标题')
    worksheet.write(0, 2, '价格')
    worksheet.write(0, 3, '描述')
    params = None
    if title:
        params = title
    goods = await get_goods_all(db, params)
    row = 1
    for item in goods:
        worksheet.write(row, 0, item.id)
        worksheet.write(row, 1, item.title)
        worksheet.write(row, 2, item.price)
        worksheet.write(row, 3, item.description)
        row += 1
    workbook.close()
    output.seek(0)
    timestamp = str(int(time.time()*1000))
    headers = {
        'Content-Disposition': f'attachment; filename="{timestamp}_goods.xlsx"'
    }
    return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)        