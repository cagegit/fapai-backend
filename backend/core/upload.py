from pickletools import optimize
from PIL import Image
from typing import Any, List
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
from qcloud_cos import CosServiceError
from qcloud_cos import CosClientError
from qcloud_cos.cos_threadpool import SimpleThreadPool
from core.config import TENCENT_secret_id, TENCENT_secret_key, TENCENT_region
import os


token = None 

config = CosConfig(Region=TENCENT_region, SecretId=TENCENT_secret_id, SecretKey=TENCENT_secret_key, Token=token)  # 获取配置对象
client = CosS3Client(config)

# 图片质量
PIC_QUALITY = 90
# 最大宽度
PIC_MAX_WIDTH = 800

# 压缩图片
def compress_and_resize_image(files: List[str], max_w=PIC_MAX_WIDTH, quality=PIC_QUALITY):
    """
     压缩图片
    """
    for input_path in files:
        im = Image.open(input_path)
        w,h = im.size
        out = None
        if w > max_w:
            max_h = int(h*max_w/w)
            out = im.resize((max_w,max_h), Image.ANTIALIAS)
        if out:     
            out.save(input_path,optimize=True,quality=quality)
        else:
            im.save(input_path,optimize=True,quality=quality) 
    
def upload_to_tencent_os(files: List[str]):
    # 存储桶名称
    bucket = 'fap-1258569581'
    # 创建上传的线程池
    pool = SimpleThreadPool()
    for file_name in files:
        # 防止文件名重复
        srcKey = file_name
        cosObjectKey = os.path.split(file_name)[1]
        # 判断COS上文件是否存在
        exists = False
        try:
            client.head_object(Bucket=bucket, Key=cosObjectKey)
            # print(response)
            exists = True
        except CosServiceError as e:
            if e.get_status_code() == 404:
                exists = False
            else:
                print("Error happened, reupload it.")
        except CosClientError as e:
            print(e)        
        if not exists:
            print("File %s not exists in cos, upload it", srcKey)
            pool.add_task(client.upload_file, bucket, cosObjectKey, srcKey)
    pool.wait_completion()
    result = pool.get_result()
    # if not result['success_all']:
    #     print("Not all files upload sucessed. you should retry")
    return result    

# 上传单个文件
def upload_single_file(file_name:str):
     # 存储桶名称
    bucket = 'fap-1258569581'
    srcKey = file_name
    cosObjectKey = os.path.split(file_name)[1]
    response = client.upload_file(
        Bucket=bucket,
        Key=cosObjectKey,
        LocalFilePath=srcKey,
        EnableMD5=False,
        progress_callback=None
    )  
    return response      
        
if __name__ == '__main__':
    print('main')
    # compress_and_resize_image(r'/Users/cage/Downloads/sj_banner.jpeg',r'/Users/cage/Downloads/sj_banner_new.jpeg')