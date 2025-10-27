// pages/record/index.js
Page({
  data: {
    // 宠物选择
    selectedPetId: 'pet1',
    pets: [
      { 
        id: 'pet1', 
        name: '腿腿', 
        emoji: '🐕',
        avatar: '/images/tuitui.jpg',
        age: '2岁',
        gender: '公',
        weight: '4.5kg',
        cutePhrase: '热爱自然的拉屎大王'
      },
      { 
        id: 'pet2', 
        name: '大包', 
        emoji: '🐶',
        avatar: '/images/dabao.jpg',
        age: '1岁',
        gender: '母',
        weight: '3.2kg',
        cutePhrase: '优雅的便便小公主'
      }
    ],
    
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

    onLoad(options) {
    console.log('记录页面加载开始');
    
    // 加载宠物数据
    this.loadPetsFromStorage();
    
    // 检查是否有从首页传来的宠物ID
    const selectedPetId = getApp().globalData?.selectedPetId || options.selectedPetId || 'pet1';
    
    this.setData({
      selectedPetId: selectedPetId
    });
    
    this.initDateTime();
  },

  onShow() {
    console.log('记录页面显示');
    
    // 重新加载宠物数据（可能有新添加的宠物）
    this.loadPetsFromStorage();
    
    // 检查全局数据中的宠物ID
    const app = getApp();
    const globalPetId = app.globalData?.selectedPetId;
    
    if (globalPetId && globalPetId !== this.data.selectedPetId) {
      this.setData({
        selectedPetId: globalPetId
      });
      
      // 清除全局数据，避免重复使用
      app.globalData.selectedPetId = null;
    }
  },

  // 从本地存储加载宠物数据
  loadPetsFromStorage() {
    try {
      const storedPets = wx.getStorageSync('pets') || [];
      if (storedPets.length > 0) {
        // 合并默认宠物和存储的宠物
        const defaultPets = [
          { 
            id: 'pet1', 
            name: '腿腿', 
            emoji: '🐕',
            avatar: '/images/tuitui.jpg',
            age: '2岁',
            gender: '公',
            weight: '4.5kg',
            cutePhrase: '热爱自然的拉屎大王'
          },
          { 
            id: 'pet2', 
            name: '大包', 
            emoji: '🐶',
            avatar: '/images/dabao.jpg',
            age: '1岁',
            gender: '母',
            weight: '3.2kg',
            cutePhrase: '优雅的便便小公主'
          }
        ];
        
        // 过滤掉重复的宠物（基于ID）
        const allPets = [...defaultPets];
        storedPets.forEach(pet => {
          if (!allPets.find(p => p.id === pet.id)) {
            // 转换新宠物的数据格式以匹配记录页需要的格式
            const recordPagePet = {
              id: pet.id,
              name: pet.name,
              emoji: pet.emoji || '🐕',
              avatar: pet.avatar || '',
              age: pet.birthDate ? this.calculateAge(pet.birthDate) : '未知',
              gender: pet.gender || '未知',
              weight: pet.weight || '未知',
              cutePhrase: pet.phrase || '可爱的小宝贝'
            };
            allPets.push(recordPagePet);
          }
        });
        
        this.setData({
          pets: allPets
        });
        
        console.log('记录页加载宠物数据:', allPets);
      }
    } catch (error) {
      console.error('记录页加载宠物数据失败:', error);
    }
  },

  // 计算年龄
  calculateAge(birthDate) {
    if (!birthDate) return '未知';
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays}天`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}个月`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${years}岁${remainingMonths}个月`;
      } else {
        return `${years}岁`;
      }
    }
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

  // 选择宠物
  selectPet(e) {
    const petId = e.currentTarget.dataset.petId;
    if (petId) {
      this.setData({
        selectedPetId: petId
      });
    }
  },

  // 切换频道
  switchChannel(e) {
    const channel = e.currentTarget.dataset.channel;

    if (channel === 'home') {
      // 首页频道，传递当前选中的宠物ID
      const selectedPetId = this.data.selectedPetId;
      console.log('切换频道到首页，当前选中的宠物ID:', selectedPetId);
      
      // 使用全局数据存储选中的宠物ID
      getApp().globalData = getApp().globalData || {};
      getApp().globalData.selectedPetId = selectedPetId;
      
      wx.reLaunch({
        url: `/pages/index/index?selectedPetId=${selectedPetId}`
      });
    } else if (channel === 'record') {
      // 记录频道，已经在当前页面
      console.log('已在记录页面');
    } else if (channel === 'ai') {
      // AI频道，跳转到AI对话页面（已无系统tabBar）
      wx.navigateTo({
        url: '/pages/ai/index',
        fail: (err) => {
          console.error('记录页跳转问AI失败，改用 reLaunch：', err);
          wx.reLaunch({ url: '/pages/ai/index' });
        }
      });
    }
  },

  // 跳转到首页
  goToHome() {
    // 保存当前选中的宠物ID到全局数据
    getApp().globalData = getApp().globalData || {};
    getApp().globalData.selectedPetId = this.data.selectedPetId;
    getApp().globalData.recordAdded = true; // 标记有新记录添加
    
    // 非 tabBar，改为 reLaunch 返回首页
    wx.reLaunch({
      url: '/pages/index/index'
    });
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

  // 添加记录（加号按钮）
  addRecord() {
    console.log('加号按钮被点击，刷新当前页面');
    // 刷新当前页面，重置表单
    this.setData({
      selectedShape: '',
      selectedColor: '',
      selectedEnvironment: '',
      amountValue: 3,
      amountLabel: '中等',
      selectedSymptom: '',
      selectedFactor: '',
      notes: '',
      recordDate: this.getCurrentDate(),
      recordTime: this.getCurrentTime()
    });
    
    wx.showToast({
      title: '开始新记录',
      icon: 'success',
      duration: 1000
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
      petId: this.data.selectedPetId || 'pet1',
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
    
    console.log('保存记录，宠物ID:', this.data.selectedPetId, '记录数据:', record);

    // 保存到本地存储
    this.saveRecordToStorage(record);

    // 根据健康评分显示不同结果
    const healthScore = record.healthScore;
    if (healthScore >= 80) {
      this.showCongratulationsDialog();
    } else {
      this.showAIAnalysisDialog(record);
    }
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
  },

  // 显示恭喜对话框
  showCongratulationsDialog() {
    wx.showModal({
      title: '🎉 太棒了！',
      content: '您的狗狗便便状况很好！继续保持良好的饮食和运动习惯，您的狗狗会越来越健康的！',
      showCancel: false,
      confirmText: '继续记录',
      success: () => {
        this.goToHome();
      }
    });
  },

  // 显示AI分析对话框
  showAIAnalysisDialog(record) {
    const analysis = this.generateAnalysis(record);
    wx.showModal({
      title: '🔍 健康分析',
      content: analysis,
      confirmText: '问AI',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          // 直接进入问AI页面继续对话
          wx.navigateTo({
            url: '/pages/ai/index',
            fail: () => wx.reLaunch({ url: '/pages/ai/index' })
          });
        } else {
          this.goToHome();
        }
      }
    });
  },

  // 生成健康分析
  generateAnalysis(record) {
    const shapeLabel = this.data.poopShapes.find(s => s.value === record.shape)?.label || record.shape;
    const colorLabel = this.data.colorOptions.find(c => c.value === record.color)?.label || record.color;
    const environmentLabel = this.data.environmentOptions.find(e => e.value === record.environment)?.label || record.environment;
    
    // 一句话总结
    let summary = this.generateSummary(record, shapeLabel, colorLabel);
    
    // 生成完整的记录分析描述
    let recordDescription = this.generateRecordDescription(record, shapeLabel, colorLabel, environmentLabel);
    
    // 详细分析
    let analysis = summary + '\n\n';
    analysis += '📋 记录分析：\n' + recordDescription + '\n\n';
    
    // 原因分析和建议
    const suggestions = this.generateSuggestions(record, shapeLabel, colorLabel);
    if (suggestions) {
      analysis += '💡 专业建议：\n' + suggestions;
    }
    
    return analysis;
  },

  // 生成记录描述
  generateRecordDescription(record, shapeLabel, colorLabel, environmentLabel) {
    let descriptions = [];
    
    // 基本信息
    descriptions.push(`便便形态：${shapeLabel}`);
    descriptions.push(`便便颜色：${colorLabel}`);
    descriptions.push(`便便量：${record.amountLabel}`);
    descriptions.push(`排便环境：${environmentLabel}`);
    
    // 添加异常症状
    if (record.symptoms.length > 0) {
      descriptions.push(`异常症状：${record.symptoms.join('、')}`);
    }
    
    // 添加影响因素
    if (record.factors.length > 0) {
      descriptions.push(`影响因素：${record.factors.join('、')}`);
    }
    
    return descriptions.join('\n');
  },

  // 生成一句话总结
  generateSummary(record, shapeLabel, colorLabel) {
    const healthScore = record.healthScore;
    
    if (healthScore >= 90) {
      return '🎉 宝贝的便便状况非常健康！';
    } else if (healthScore >= 80) {
      return '😊 宝贝的便便状况良好，继续保持！';
    } else if (healthScore >= 70) {
      return '⚠️ 宝贝的便便有轻微异常，需要关注。';
    } else if (healthScore >= 60) {
      return '🚨 宝贝的便便状况不太理想，建议调整。';
    } else {
      return '❗ 宝贝的便便异常明显，建议及时就医。';
    }
  },

  // 生成建议
  generateSuggestions(record, shapeLabel, colorLabel) {
    let causes = [];  // 可能原因
    let suggestions = [];  // 护理建议
    let warnings = [];  // 重要提醒
    
    // 根据形态给建议
    if (record.shape === 'watery') {
      causes.push('消化不良');
      causes.push('食物过敏');
      causes.push('肠胃炎');
      suggestions.push('减少食量');
      suggestions.push('提供清淡易消化食物');
      suggestions.push('多补充水分');
    } else if (record.shape === 'hard') {
      causes.push('缺水');
      causes.push('纤维不足');
      causes.push('运动量不够');
      suggestions.push('增加饮水量');
      suggestions.push('适当增加运动');
      suggestions.push('可添加少量南瓜或红薯');
    } else if (record.shape === 'mucous') {
      causes.push('肠道炎症');
      causes.push('寄生虫感染');
      warnings.push('建议就医检查');
      warnings.push('暂时给予清淡饮食');
    }
    
    // 根据颜色给建议
    if (record.color === 'red') {
      causes.push('可能含血');
      warnings.push('建议立即就医检查');
    } else if (record.color === 'black') {
      causes.push('可能是上消化道出血');
      warnings.push('建议尽快就医');
    } else if (record.color === 'green') {
      causes.push('食物消化过快');
      causes.push('胆汁分泌异常');
    } else if (record.color === 'gray-white') {
      causes.push('可能是胆道问题');
      warnings.push('建议就医检查');
    }
    
    // 根据症状给建议
    if (record.symptoms.includes('腹泻')) {
      suggestions.push('注意补充电解质');
      suggestions.push('避免脱水');
    } else if (record.symptoms.includes('便秘')) {
      suggestions.push('可适当按摩腹部');
      suggestions.push('增加运动量');
    } else if (record.symptoms.includes('呕吐')) {
      suggestions.push('建议禁食12小时');
      suggestions.push('之后少量多餐');
    }
    
    // 根据影响因素给建议
    if (record.factors.includes('新食物')) {
      suggestions.push('暂停新食物');
      suggestions.push('逐步重新引入');
    } else if (record.factors.includes('压力')) {
      suggestions.push('创造安静舒适的环境');
    }
    
    // 组装建议内容
    let result = [];
    
    if (causes.length > 0) {
      result.push('🔍 可能原因：\n• ' + causes.join('\n• '));
    }
    
    if (suggestions.length > 0) {
      result.push('🏥 护理建议：\n• ' + suggestions.join('\n• '));
    }
    
    if (warnings.length > 0) {
      result.push('⚠️ 重要提醒：\n• ' + warnings.join('\n• '));
    }
    
    if (result.length === 0) {
      return null;
    }
    
    return result.join('\n\n');
  }
});