// pages/index/index.js
Page({
  data: {
    currentPetId: 'pet1',
    currentChannel: 'home',
    currentPet: {},
    pets: [
      { 
        id: 'pet1', 
        name: '腿腿', 
        emoji: '🐕',
        age: '2岁',
        gender: '公',
        weight: '4.5kg',
        cutePhrase: '热爱自然的拉屎大王'
      },
      { 
        id: 'pet2', 
        name: '大包', 
        emoji: '🐶',
        age: '1岁',
        gender: '母',
        weight: '3.2kg',
        cutePhrase: '优雅的便便小公主'
      }
    ],
    calendarDays: [],
    currentMonth: '',
    weeklySummary: '本周记录正常，继续保持！'
  },

  onLoad(options) {
    console.log('页面加载开始，参数:', options);
    
    const selectedPetId = options.selectedPetId || 'pet1';
    console.log('设置当前宠物ID:', selectedPetId);
    
    this.setData({
      currentPetId: selectedPetId
    });
    
    this.initCalendar();
    this.setCurrentPet();
  },

  onShow() {
    console.log('首页onShow，开始重新生成日历');
    
    const globalData = getApp().globalData || {};
    const globalSelectedPetId = globalData.selectedPetId;
    
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options || {};
    
    const newSelectedPetId = globalSelectedPetId || options.selectedPetId;
    
    if (newSelectedPetId && newSelectedPetId !== this.data.currentPetId) {
      console.log('检测到新的宠物ID:', newSelectedPetId);
      this.setData({
        currentPetId: newSelectedPetId
      }, () => {
        this.setCurrentPet();
        this.initCalendar();
      });
      
      if (globalSelectedPetId) {
        getApp().globalData.selectedPetId = null;
      }
    } else {
      this.setCurrentPet();
      this.initCalendar();
    }
  },

  // 初始化日历
  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentMonth = `${year}年${month + 1}月`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const calendarDays = [];
    
    // 添加上个月的空白日期
    for (let i = 0; i < startDay; i++) {
      calendarDays.push({
        day: '',
        date: '',
        isToday: false,
        hasRecord: false,
        isAbnormal: false,
        poopIcon: ''
      });
    }
    
    // 添加当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      
      const dayData = {
        day: day.toString(),
        date: dateStr,
        isToday,
        hasRecord: this.hasRecordForDate(dateStr),
        isAbnormal: this.isAbnormalDate(dateStr),
        poopIcon: this.getPoopIcon(dateStr)
      };
      
      calendarDays.push(dayData);
    }
    
    this.setData({
      calendarDays,
      currentMonth
    });
  },

  // 检查某天是否有记录
  hasRecordForDate(dateStr) {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      return records.some(record => {
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

      if (dayRecords.length > 0) {
        return dayRecords.length === 1 ? '💩' : `💩×${dayRecords.length}`;
      }
      return '';
    } catch (error) {
      console.error('获取图标出错:', error);
      return '';
    }
  },

  // 设置当前宠物信息
  setCurrentPet() {
    const currentPet = this.data.pets.find(pet => pet.id === this.data.currentPetId) || this.data.pets[0];
    this.setData({
      currentPet: currentPet
    });
  },

  // 选择宠物
  selectPet(e) {
    const petId = e.currentTarget.dataset.petId;
    const currentPet = this.data.pets.find(pet => pet.id === petId);
    
    this.setData({
      currentPetId: petId,
      currentPet: currentPet
    });
    
    this.initCalendar();
  },

  // 添加宠物
  addPet() {
    wx.showModal({
      title: '添加宠物',
      content: '此功能开发中，敬请期待！',
      showCancel: false
    });
  },

  // 查看某天记录
  viewDayRecord(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;

    wx.showToast({
      title: '查看' + date + '的记录',
      icon: 'none'
    });
  },

  // 切换频道
  switchChannel(e) {
    const channel = e.currentTarget.dataset.channel;

    if (channel === 'home') {
      this.setData({
        currentChannel: 'home'
      });
    } else if (channel === 'record') {
      wx.switchTab({
        url: '/pages/record/index'
      });
    } else if (channel === 'ai') {
      wx.showToast({
        title: 'AI功能开发中',
        icon: 'none'
      });
    }
  }
});