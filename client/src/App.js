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
        const response = await fetch('http://localhost:8000/api/tables');
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
  const targetDbs = [
    { label: '风险数据集市', value: 'RISK_DATA_MART' },
    { label: '风险数据仓库', value: 'RISK_DATA_WAREHOUSE' },
    { label: '风险分析平台', value: 'RISK_ANALYSIS_PLATFORM' },
  ];

  const onFinish = (values) => {
    console.log('配置提交:', values);
    // 这里可以添加数据同步API调用
  };

  return (
    <div className={styles.container}>
      <img src="/bank-logo.png" alt="辽宁振兴银行" className={styles.logo} />
      <h1 className={styles.title}>银行风险数据同步配置</h1>
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
