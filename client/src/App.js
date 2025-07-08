import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button } from 'antd';
import styles from './App.module.css';
import syncStyles from './SyncForm.module.css';

function App() {
  const [form] = Form.useForm();
  
  // 银行风险数据表选项
  const [sourceTables, setSourceTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/tables');
        const data = await response.json();
        if (data.tables) {
          setSourceTables(data.tables);
        }
      } catch (error) {
        console.error('获取表清单失败:', error);
      }
    };
    fetchTables();
  }, []);
  
  // 目标结果库选项
  const [targetDbs, setTargetDbs] = useState([]);

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/mysql_databases');
        const data = await response.json();
        if (data.databases) {
          setTargetDbs(data.databases.map(db => ({ label: db, value: db })));
        }
      } catch (error) {
        console.error('获取目标结果库失败:', error);
      }
    };
    fetchDatabases();
  }, []);

  const onFinish = async (values) => {
    try {
      const response = await fetch('http://localhost:8001/api/sync_table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_table: values.sourceTable,
          target_db: values.targetDb
        })
      });
      const result = await response.json();
      if (result.error) {
        console.error('同步失败:', result.error);
      } else {
        console.log('同步成功:', result.message);
      }
    } catch (error) {
      console.error('同步请求失败:', error);
    }
  };

  return (
    <div className={styles.container}>
      <img src="/bank-logo.png" alt="辽宁振兴银行" className={styles.logo} />
      <h1 className={styles.title}>风险数据同步配置</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item 
          name="sourceTable" 
          label="选择源系统数据表"
          rules={[{ required: true, message: '请选择数据表' }]}
        >
          <Select options={sourceTables} placeholder="请选择数据表" className={syncStyles.input} />
        </Form.Item>
        
        <Form.Item 
          name="timeRange" 
          label="选择同步时间范围"
          rules={[{ required: true, message: '请选择时间范围' }]}
        >
          <DatePicker.RangePicker showTime style={{ width: '100%' }} className={syncStyles.input} />
        </Form.Item>
        
        <Form.Item 
          name="targetDb" 
          label="选择目标结果库"
          rules={[{ required: true, message: '请选择目标库' }]}
        >
          <Select options={targetDbs} placeholder="请选择目标库" className={syncStyles.input} />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" className={syncStyles.primaryBtn}>
            开始同步
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default App;
