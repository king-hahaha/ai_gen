import mysql.connector
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, Request, Body
from pydantic import BaseModel

class SyncRequest(BaseModel):
    source_table: str
    target_db: str

app = FastAPI()

# 允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL数据库配置
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Aa751164',
    'database': 'ha'
}

@app.get("/api/tables")
async def get_tables():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES")
        tables = [{'value': table[0], 'label': table[0]} for table in cursor.fetchall()]
        cursor.close()
        connection.close()
        return {"tables": tables}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "Welcome to the Database Service. Please use /api/tables endpoint."}

@app.post("/api/sync_table")
async def sync_table(data: SyncRequest):
    try:
        # 获取源表结构
        print(f"接收参数: source_table={data.source_table}, target_db={data.target_db}")
        source_table = data.source_table
        target_db = data.target_db
        src_conn = mysql.connector.connect(**db_config)
        src_cursor = src_conn.cursor()
        src_cursor.execute(f"SHOW CREATE TABLE {source_table}")
        create_table_sql = src_cursor.fetchone()[1]
        
        # 获取源数据
        src_cursor.execute(f"SELECT * FROM {source_table}")
        data = src_cursor.fetchall()
        
        # 连接到目标数据库
        target_config = db_config.copy()
        target_config['database'] = target_db
        tgt_conn = mysql.connector.connect(**target_config)
        tgt_cursor = tgt_conn.cursor()
        
        # 创建目标表
        tgt_cursor.execute(create_table_sql)
        
        # 插入数据
        if data:
            columns = len(data[0])
            placeholders = ','.join(['%s']*columns)
            insert_sql = f"INSERT INTO {source_table} VALUES ({placeholders})"
            tgt_cursor.executemany(insert_sql, data)
            tgt_conn.commit()
        
        return {"status": "success", "message": f"表 {source_table} 已同步到数据库 {target_db}"}
    except Exception as e:
        print(f"接收参数: source_table={data.source_table}, target_db={data.target_db}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
    print(f"FastAPI实例ID: {id(app)}")
    print("已注册路由:", app.routes)