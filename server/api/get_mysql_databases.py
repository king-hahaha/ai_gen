import mysql.connector
from flask import Flask, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/api/mysql_databases', methods=['GET'])
def get_mysql_databases():
    try:
        # 连接到 MySQL 数据库，请根据实际情况修改连接信息
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Aa751164'
        )
        cursor = connection.cursor()
        
        # 查询数据库
        cursor.execute('SHOW DATABASES')
        databases = cursor.fetchall()
        
        # 筛选以 nubrm 开头的数据库
        nubrm_databases = [db[0] for db in databases if db[0].startswith('nubrm')]
        
        cursor.close()
        connection.close()
        print('成功获取数据库列表:', nubrm_databases)
        return jsonify({'databases': nubrm_databases})
    except Exception as e:
        print('接口执行出错:', str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000)