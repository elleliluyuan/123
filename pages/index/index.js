//index.js
Page({
  data: {
    // 宠物数据
    pets: [
      { 
        id: 'pet1', 
        name: '腿腿', 
        emoji: '🐕',
        avatar: '', // 添加avatar字段
        age: '2岁',
        gender: '公',
        weight: '4.5kg',
        phrase: '热爱自然的拉屎大王'
      },
      { 
        id: 'pet2', 
        name: '大包', 
        emoji: '🐶',
        avatar: '', // 添加avatar字段
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
    currentYear: new Date().getFullYear(),
    currentMonthNum: new Date().getMonth() + 1,
    currentMonth: '', // 显示的月份文本
    
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
    
    // 重新加载宠物数据（可能有新添加的宠物）
    this.loadPetsFromStorage();
    
    // 检查全局数据中的宠物ID
    const app = getApp();
    const globalPetId = app.globalData?.selectedPetId;
    const newPetAdded = app.globalData?.newPetAdded;
    
    console.log('全局宠物ID:', globalPetId);
    console.log('是否有新宠物:', newPetAdded);
    
    if (globalPetId && (globalPetId !== this.data.currentPetId || newPetAdded)) {
      // 重新加载宠物数据后再获取宠物信息
      const pet = this.getPetById(globalPetId);
      console.log('找到的宠物:', pet);
      
      this.setData({
        currentPetId: globalPetId,
        currentPet: pet
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
      app.globalData.selectedPetId = null;
      app.globalData.newPetAdded = false;
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
            avatar: '', // 添加avatar字段
            age: '2岁',
            gender: '公',
            weight: '4.5kg',
            phrase: '热爱自然的拉屎大王'
          },
          { 
            id: 'pet2', 
            name: '大包', 
            emoji: '🐶',
            avatar: '', // 添加avatar字段
            age: '3岁',
            gender: '母',
            weight: '6.2kg',
            phrase: '优雅的便便艺术家'
          }
        ];
        
        // 过滤掉重复的宠物（基于ID）
        const allPets = [...defaultPets];
        storedPets.forEach(pet => {
          if (!allPets.find(p => p.id === pet.id)) {
            // 确保新宠物数据格式兼容首页显示
            const homePet = {
              id: pet.id,
              name: pet.name,
              emoji: pet.emoji || '🐕',
              avatar: pet.avatar || '', // 确保有avatar字段
              age: pet.birthDate ? this.calculateAge(pet.birthDate) : '未知',
              gender: pet.gender || '未知',
              weight: pet.weight || '未知',
              phrase: pet.phrase || '可爱的小宝贝'
            };
            allPets.push(homePet);
          }
        });
        
        this.setData({
          pets: allPets
        });
        
        console.log('加载宠物数据:', allPets);
      }
    } catch (error) {
      console.error('加载宠物数据失败:', error);
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

  // 根据ID获取宠物信息
  getPetById(petId) {
    return this.data.pets.find(pet => pet.id === petId) || this.data.pets[0];
  },

  // 选择宠物
  selectPet(e) {
    console.log('selectPet 被调用', e);
    const petId = e.currentTarget.dataset.petId;
    console.log('选择的宠物ID:', petId);
    
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
    
    wx.navigateTo({
      url: '/pages/add-pet/index',
      success: () => {
        console.log('跳转成功');
      },
      fail: (error) => {
        console.error('跳转失败:', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 切换到上一个月
  previousMonth() {
    let year = this.data.currentYear;
    let month = this.data.currentMonthNum;
    
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    
    this.setData({
      currentYear: year,
      currentMonthNum: month
    });
    
    this.initCalendar();
  },

  // 切换到下一个月
  nextMonth() {
    let year = this.data.currentYear;
    let month = this.data.currentMonthNum;
    
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    
    this.setData({
      currentYear: year,
      currentMonthNum: month
    });
    
    this.initCalendar();
  },

  initCalendar() {
    const now = new Date();
    const year = this.data.currentYear;
    const month = this.data.currentMonthNum - 1; // JavaScript月份从0开始
    const currentMonth = `${year}年${this.data.currentMonthNum}月`;
    
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
    console.log('switchChannel 被调用', e);
    const channel = e.currentTarget.dataset.channel;
    console.log('选择的频道:', channel);

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