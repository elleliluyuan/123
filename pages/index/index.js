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

  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = [];
    const today = new Date();
    
    // 获取当前宠物的记录
    const records = this.getPetRecords();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const isToday = currentDate.toDateString() === today.toDateString();
      
      // 检查这一天是否有记录
      const dayRecords = records.filter(record => record.date === dateStr);
      const hasRecord = dayRecords.length > 0;
      
      // 根据记录状态选择图标
      let recordIcon = '';
      if (hasRecord) {
        const record = dayRecords[0]; // 取第一条记录
        if (record.healthScore >= 80) {
          recordIcon = '👍';
        } else if (record.healthScore >= 60) {
          recordIcon = '😐';
        } else {
          recordIcon = '😟';
        }
      }
      
      calendarDays.push({
        date: dateStr,
        day: currentDate.getDate(),
        isToday: isToday,
        hasRecord: hasRecord,
        recordIcon: recordIcon
      });
    }
    
    this.setData({
      calendarDays: calendarDays
    });
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

  goToRecord() {
    // 保存当前选中的宠物ID到全局数据
    getApp().globalData = getApp().globalData || {};
    getApp().globalData.selectedPetId = this.data.currentPetId;
    
    wx.navigateTo({
      url: `/pages/record/index?selectedPetId=${this.data.currentPetId}`
    });
  }
});