// pages/record/index.js
Page({
  data: {
    // 日期时间相关
    datetimeRange: [[], []], // 日期和时间选项
    datetimeIndex: [0, 0],   // 当前选中的索引
    displayDateTime: '',     // 显示的日期时间
    recordDate: '',          // 实际日期
    recordTime: '',          // 实际时间
    
    // 选择项
    selectedShape: null,
    selectedColor: null,
    amountValue: 50,         // 便便量滑杆值 (0-100)
    amountLabel: '正常',     // 便便量标签
    selectedEnvironment: null, // 便便环境
    selectedSymptom: null,   // 异常症状（单选）
    selectedFactor: null,    // 影响因素（单选）
    notes: '',
    
    // 便便形态选项
    poopShapes: [
      { value: 'perfect', label: '完美', icon: '✨', description: '成型，湿润' },
      { value: 'normal', label: '正常', icon: '👍', description: '略软，易捡' },
      { value: 'soft', label: '偏软', icon: '🍮', description: '稍微偏软' },
      { value: 'hard', label: '偏硬', icon: '🪨', description: '比较干燥' },
      { value: 'watery', label: '稀状', icon: '💧', description: '不成型' },
      { value: 'mucous', label: '带粘液', icon: '🔸', description: '有粘液' }
    ],
    
    // 颜色选项
    colorOptions: [
      { value: 'brown', label: '棕色', color: '#8B4513' },
      { value: 'dark-brown', label: '深棕', color: '#654321' },
      { value: 'light-brown', label: '浅棕', color: '#D2691E' },
      { value: 'yellow', label: '黄色', color: '#FFD700' },
      { value: 'green', label: '绿色', color: '#32CD32' },
      { value: 'black', label: '黑色', color: '#000000' },
      { value: 'red', label: '红色', color: '#FF0000' },
      { value: 'gray-white', label: '灰白', color: '#F5F5F5' }
    ],
    
    // 便便环境选项
    environmentOptions: [
      { value: 'indoor', label: '室内', icon: '🏠' },
      { value: 'outdoor', label: '室外', icon: '🌳' }
    ],

    // 异常症状选项
    symptomOptions: [
      '腹泻', '便秘', '呕吐', '食欲不振', '精神萎靡', 
      '排便困难', '排便疼痛', '血便', '粘液便', '异食癖', '其他'
    ],

    // 影响因素选项
    factorOptions: [
      '新食物', '药物', '运动', '压力', '换环境', 
      '生病', '疫苗', '驱虫', '其他'
    ]
  },

  onLoad() {
    this.initDateTime();
  },

  // 初始化日期时间选择器
  initDateTime() {
    const now = new Date();
    const dates = [];
    const times = [];
    
    // 生成日期选项 (只显示过去和今天)
    for (let i = 0; i < 30; i++) { // 过去30天
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.unshift(`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`);
    }

    // 生成时间选项
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 5) { // 每5分钟一个选项
        times.push(`${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`);
      }
    }

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const defaultDateStr = `${currentYear}年${currentMonth + 1}月${currentDay}日`;
    const defaultTimeStr = `${currentHour.toString().padStart(2, '0')}:${(Math.floor(currentMinute / 5) * 5).toString().padStart(2, '0')}`;

    const dateIndex = dates.indexOf(defaultDateStr);
    const timeIndex = times.indexOf(defaultTimeStr);

    this.setData({
      datetimeRange: [dates, times],
      datetimeIndex: [dateIndex !== -1 ? dateIndex : dates.length - 1, timeIndex !== -1 ? timeIndex : 0],
      displayDateTime: `${defaultDateStr} ${defaultTimeStr}`,
      recordDate: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`,
      recordTime: defaultTimeStr
    });
  },

  // 日期时间选择器改变
  onDateTimeChange(e) {
    const val = e.detail.value;
    const dates = this.data.datetimeRange[0];
    const times = this.data.datetimeRange[1];

    const selectedDate = dates[val[0]];
    const selectedTime = times[val[1]];

    // 提取日期部分，格式化为 YYYY-MM-DD
    const dateMatch = selectedDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    let formattedDate = '';
    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2].padStart(2, '0');
      const day = dateMatch[3].padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    this.setData({
      datetimeIndex: val,
      displayDateTime: `${selectedDate} ${selectedTime}`,
      recordDate: formattedDate,
      recordTime: selectedTime
    });
  },

  // 选择形状
  selectShape(e) {
    this.setData({
      selectedShape: e.currentTarget.dataset.value
    });
  },

  // 选择颜色
  selectColor(e) {
    this.setData({
      selectedColor: e.currentTarget.dataset.value
    });
  },

  // 便便量滑杆改变
  onAmountChange(e) {
    const value = e.detail.value;
    let label = '';
    if (value < 30) {
      label = '偏少';
    } else if (value > 70) {
      label = '偏多';
    } else {
      label = '正常';
    }
    this.setData({
      amountValue: value,
      amountLabel: label
    });
  },

  // 选择便便环境
  selectEnvironment(e) {
    this.setData({
      selectedEnvironment: e.currentTarget.dataset.value
    });
  },

  // 选择异常症状（单选）
  selectSymptom(e) {
    const symptom = e.currentTarget.dataset.symptom;
    const newSymptom = this.data.selectedSymptom === symptom ? null : symptom;
    this.setData({
      selectedSymptom: newSymptom
    });
  },

  // 选择影响因素（单选）
  selectFactor(e) {
    const factor = e.currentTarget.dataset.factor;
    const newFactor = this.data.selectedFactor === factor ? null : factor;
    this.setData({
      selectedFactor: newFactor
    });
  },

  // 备注输入
  onNotesInput(e) {
    this.setData({
      notes: e.detail.value
    });
  },

  // 跳转到首页
  goToHome() {
    wx.navigateBack();
  },

  // 取消记录
  cancelRecord() {
    wx.showModal({
      title: '确认取消',
      content: '确定要放弃本次记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.goToHome();
        }
      }
    });
  },

  // 保存记录
  saveRecord() {
    const { selectedShape, selectedColor, selectedEnvironment, recordDate, recordTime } = this.data;
    
    // 验证必填项
    if (!selectedShape || !selectedColor || !selectedEnvironment) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 构建记录数据
    const record = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      date: recordDate,
      time: recordTime,
      shape: selectedShape,
      color: selectedColor,
      amount: this.data.amountValue,
      amountLabel: this.data.amountLabel,
      environment: selectedEnvironment,
      symptoms: this.data.selectedSymptom ? [this.data.selectedSymptom] : [],
      factors: this.data.selectedFactor ? [this.data.selectedFactor] : [],
      notes: this.data.notes,
      healthScore: this.calculateHealthScore()
    };
    
    console.log('保存记录:', record);

    // 保存到本地存储
    this.saveRecordToStorage(record);

    // 显示成功提示
    wx.showToast({
      title: '记录保存成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          this.goToHome();
        }, 1500);
      }
    });
  },

  // 保存记录到本地存储
  saveRecordToStorage(newRecord) {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      records.unshift(newRecord);
      wx.setStorageSync('poopRecords', records);
    } catch (error) {
      console.error('保存记录失败:', error);
    }
  },

  // 计算健康评分
  calculateHealthScore() {
    let score = 100;
    const { selectedShape, selectedColor, selectedSymptom, selectedFactor, amountValue } = this.data;
    
    // 形态评分 (40%权重)
    if (selectedShape === 'perfect') {
      score -= 0;
    } else if (selectedShape === 'normal') {
      score -= 5;
    } else if (selectedShape === 'soft' || selectedShape === 'hard') {
      score -= 15;
    } else { // watery, mucous
      score -= 25;
    }
    
    // 颜色评分 (30%权重)
    if (selectedColor === 'brown' || selectedColor === 'dark-brown') {
      score -= 0;
    } else if (selectedColor === 'light-brown') {
      score -= 5;
    } else { // yellow, green, black, red, gray-white
      score -= 20;
    }
    
    // 便便量评分 (10%权重)
    if (amountValue < 20 || amountValue > 80) {
      score -= 10;
    } else if (amountValue < 30 || amountValue > 70) {
      score -= 5;
    }

    // 异常症状评分 (15%权重)
    if (selectedSymptom) {
      score -= 6;
    }
    
    // 影响因素评分 (5%权重)
    if (selectedFactor === '生病' || selectedFactor === '压力') {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }
});