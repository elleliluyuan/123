//index.js
Page({
  data: {
    // 宠物数据
    pets: [
      { 
        id: 'pet1', 
        name: '腿腿', 
        emoji: '🐕',
        age: '2岁',
        gender: '公',
        weight: '4.5kg',
        phrase: '热爱自然的拉屎大王'
      },
      { 
        id: 'pet2', 
        name: '大包', 
        emoji: '🐶',
        age: '3岁',
        gender: '母',
        weight: '6.2kg',
        phrase: '优雅的便便艺术家'
      }
    ],
    currentPetId: 'pet1',
    currentPet: {},
    
    // 日历相关
    calendarDays: [],
    calendarInitialized: false, // 添加标志位
    
    // 周总结
    weeklySummary: '本周记录正常，继续保持！'
  },

  onLoad(options) {
    console.log('首页加载开始');
    
    // 检查是否有从其他页面传来的宠物ID
    const selectedPetId = getApp().globalData?.selectedPetId || options.selectedPetId || 'pet1';
    
    this.setData({
      currentPetId: selectedPetId,
      currentPet: this.getPetById(selectedPetId)
    });
    
    this.initCalendar();
  },

  onShow() {
    console.log('首页显示');
    
    // 检查全局数据中的宠物ID
    const globalPetId = getApp().globalData?.selectedPetId;
    if (globalPetId && globalPetId !== this.data.currentPetId) {
      this.setData({
        currentPetId: globalPetId,
        currentPet: this.getPetById(globalPetId)
      });
      this.initCalendar();
    } else if (this.data.calendarInitialized) {
      // 如果日历已经初始化且没有切换宠物，只更新记录数据
      this.updateCalendarRecords();
    } else {
      // 如果日历还没有初始化，先初始化
      this.initCalendar();
    }
    
    // 清除全局数据，避免重复使用
    if (globalPetId) {
      getApp().globalData.selectedPetId = null;
    }
  },

  // 根据ID获取宠物信息
  getPetById(petId) {
    return this.data.pets.find(pet => pet.id === petId) || this.data.pets[0];
  },

  // 选择宠物
  selectPet(e) {
    const petId = e.currentTarget.dataset.petId;
    if (petId && petId !== this.data.currentPetId) {
      console.log('切换宠物到:', petId);
      
      this.setData({
        currentPetId: petId,
        currentPet: this.getPetById(petId)
      });
      
      // 重新初始化日历
      this.initCalendar();
    }
  },

  // 添加宠物
  addPet() {
    console.log('点击添加宠物按钮');
    
    // 先显示一个测试提示
    wx.showToast({
      title: '准备跳转...',
      icon: 'none',
      duration: 1000
    });
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/add-pet/index',
        success: () => {
          console.log('跳转到添加宠物页面成功');
        },
        fail: (error) => {
          console.error('跳转失败:', error);
          wx.showModal({
            title: '跳转失败',
            content: '错误信息: ' + JSON.stringify(error),
            showCancel: false
          });
        }
      });
    }, 1000);
  },

  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentMonth = `${year}年${month + 1}月`;
    
    // 生成日历数据
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const calendarDays = [];
    
    // 添加上个月的日期
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthNum = month === 0 ? 12 : month;
    const prevMonthDays = new Date(prevYear, prevMonthNum, 0).getDate(); // 上个月的实际天数
    
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = `${prevYear}-${prevMonthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      calendarDays.push({
        day: day.toString(),
        date: dateStr,
        isToday: false,
        hasRecord: this.hasRecordForDate(dateStr),
        isAbnormal: this.isAbnormalDate(dateStr),
        poopIcon: this.getPoopIcon(dateStr),
      });
    }
    
    // 添加当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      // 修复时区问题：使用本地日期字符串
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      
      const dayData = {
        day: day.toString(),
        date: dateStr,
        isToday,
        hasRecord: this.hasRecordForDate(dateStr),
        isAbnormal: this.isAbnormalDate(dateStr),
        poopIcon: this.getPoopIcon(dateStr),
      };
      
      calendarDays.push(dayData);
    }
    
    // 添加下个月的日期来填满5行
    const totalCells = calendarDays.length;
    const remainingCells = 35 - totalCells; // 5行 × 7列 = 35个格子
    
    // 计算下个月的信息
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonthNum = month === 11 ? 1 : month + 2;
    const nextMonthDate = new Date(nextYear, nextMonthNum - 1, 1);
    const nextMonthDays = new Date(nextYear, nextMonthNum, 0).getDate(); // 下个月的实际天数
    
    for (let day = 1; day <= remainingCells; day++) {
      // 确保不超过下个月的实际天数
      const actualDay = day <= nextMonthDays ? day : day - nextMonthDays;
      const actualMonth = day <= nextMonthDays ? nextMonthNum : nextMonthNum + 1;
      const actualYear = actualMonth > 12 ? nextYear + 1 : nextYear;
      const finalMonth = actualMonth > 12 ? 1 : actualMonth;
      
      const dateStr = `${actualYear}-${finalMonth.toString().padStart(2, '0')}-${actualDay.toString().padStart(2, '0')}`;
      
      calendarDays.push({
        day: actualDay.toString(),
        date: dateStr,
        isToday: false,
        hasRecord: this.hasRecordForDate(dateStr),
        isAbnormal: this.isAbnormalDate(dateStr),
        poopIcon: this.getPoopIcon(dateStr),
      });
    }
    
    this.setData({
      calendarDays,
      currentMonth,
      calendarInitialized: true // 标记日历已初始化
    });
  },

  // 更新日历记录数据（不重新生成日历结构）
  updateCalendarRecords() {
    const calendarDays = this.data.calendarDays.map(day => ({
      ...day,
      hasRecord: this.hasRecordForDate(day.date),
      isAbnormal: this.isAbnormalDate(day.date),
      poopIcon: this.getPoopIcon(day.date)
    }));
    
    this.setData({
      calendarDays
    });
  },

  // 检查某天是否有记录
  hasRecordForDate(dateStr) {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      const hasRecord = records.some(record => {
        // 优先使用date字段，如果没有date字段才使用timestamp
        let recordDate;
        if (record.date) {
          recordDate = record.date;
        } else if (record.timestamp) {
          recordDate = record.timestamp.split('T')[0];
        } else {
          recordDate = '';
        }
        
        // 检查日期和宠物ID是否匹配
        return recordDate === dateStr && record.petId === this.data.currentPetId;
      });
      
      return hasRecord;
    } catch (error) {
      console.error('检查记录出错:', error);
      return false;
    }
  },

  // 检查某天是否异常
  isAbnormalDate(dateStr) {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      const dayRecords = records.filter(record => {
        // 优先使用date字段，如果没有date字段才使用timestamp
        let recordDate;
        if (record.date) {
          recordDate = record.date;
        } else if (record.timestamp) {
          recordDate = record.timestamp.split('T')[0];
        } else {
          recordDate = '';
        }
        
        return recordDate === dateStr && record.petId === this.data.currentPetId;
      });
      
      return dayRecords.some(record => record.healthScore < 60);
    } catch (error) {
      console.error('检查异常状态出错:', error);
      return false;
    }
  },

  // 获取便便图标
  getPoopIcon(dateStr) {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      const dayRecords = records.filter(record => {
        // 优先使用date字段，如果没有date字段才使用timestamp
        let recordDate;
        if (record.date) {
          recordDate = record.date;
        } else if (record.timestamp) {
          recordDate = record.timestamp.split('T')[0];
        } else {
          recordDate = '';
        }
        
        return recordDate === dateStr && record.petId === this.data.currentPetId;
      });

      // 如果有记录，显示💩图标和次数
      if (dayRecords.length > 0) {
        return dayRecords.length === 1 ? '💩' : `💩×${dayRecords.length}`;
      }

      return '';
    } catch (error) {
      console.error('获取图标出错:', error);
      return '';
    }
  },

  // 获取当前宠物的记录
  getPetRecords() {
    try {
      const allRecords = wx.getStorageSync('poopRecords') || [];
      return allRecords.filter(record => record.petId === this.data.currentPetId);
    } catch (error) {
      console.error('获取宠物记录失败:', error);
      return [];
    }
  },

  // 查看某天的记录
  viewDayRecord(e) {
    const date = e.currentTarget.dataset.date;
    const records = this.getPetRecords().filter(record => record.date === date);
    
    if (records.length > 0) {
      // 显示记录详情
      const record = records[0];
      wx.showModal({
        title: `${date} 的记录`,
        content: `形态: ${this.getShapeLabel(record.shape)}\n颜色: ${this.getColorLabel(record.color)}\n健康评分: ${record.healthScore}分`,
        showCancel: false
      });
    } else {
      wx.showToast({
        title: '这一天没有记录',
        icon: 'none'
      });
    }
  },

  // 获取形态标签
  getShapeLabel(shape) {
    const shapeMap = {
      'perfect': '完美',
      'normal': '正常',
      'soft': '偏软',
      'hard': '偏硬',
      'watery': '稀状',
      'mucous': '带粘液'
    };
    return shapeMap[shape] || shape;
  },

  // 获取颜色标签
  getColorLabel(color) {
    const colorMap = {
      'brown': '棕色',
      'dark-brown': '深棕',
      'light-brown': '浅棕',
      'yellow': '黄色',
      'green': '绿色',
      'black': '黑色',
      'red': '红色',
      'gray-white': '灰白'
    };
    return colorMap[color] || color;
  },

  // 切换频道
  switchChannel(e) {
    const channel = e.currentTarget.dataset.channel;

    if (channel === 'home') {
      // 首页频道，已经在当前页面
      this.setData({
        currentChannel: 'home'
      });
    } else if (channel === 'record') {
      // 记录频道，跳转到记录页面
      this.goToRecord();
    } else if (channel === 'ai') {
      // AI频道，跳转到AI对话页面
      wx.showToast({
        title: 'AI功能开发中',
        icon: 'none'
      });
    }
  },

  goToRecord() {
    // 保存当前选中的宠物ID到全局数据
    getApp().globalData = getApp().globalData || {};
    getApp().globalData.selectedPetId = this.data.currentPetId;
    
    // 使用 switchTab 跳转到 tabBar 页面
    wx.switchTab({
      url: '/pages/record/index'
    });
  }
});