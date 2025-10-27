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
        breed: '金毛',
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
        breed: '泰迪',
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
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], // 星期英文简写
    weekdayLabels: [
      { label: 'M', key: 'mon' },  // 周一
      { label: 'T', key: 'tue' },  // 周二
      { label: 'W', key: 'wed' },  // 周三
      { label: 'T', key: 'thu' },  // 周四
      { label: 'F', key: 'fri' },  // 周五
      { label: 'S', key: 'sat' },  // 周六
      { label: 'S', key: 'sun' }   // 周日
    ], // 星期标签对象数组，避免重复key，按周一到周日顺序
    showWeekView: true, // 显示周视图还是月视图
    currentWeekStart: null, // 当前周的开始日期
    
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
            breed: '金毛',
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
            breed: '泰迪',
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
              breed: pet.breed || '未知品种',
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
    // 只显示本周的日历
    const now = new Date();
    
    // 确定本周的开始日期（周一为一周开始）
    let weekStart;
    if (this.data.currentWeekStart) {
      weekStart = new Date(this.data.currentWeekStart);
    } else {
      // 获取本周的开始日期（周一）
      // getDay(): 0=周日, 1=周一, 2=周二, ..., 6=周六
      const dayOfWeek = now.getDay();
      // 计算距离周一的偏移
      let diff;
      if (dayOfWeek === 0) {
        // 如果今天是周日，往前推6天
        diff = 6;
      } else {
        // 其他情况往前推 dayOfWeek - 1 天
        diff = dayOfWeek - 1;
      }
      
      console.log('今天是星期', dayOfWeek === 0 ? 7 : dayOfWeek, '，往前推', diff, '天');
      
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - diff);
      weekStart.setHours(0, 0, 0, 0); // 设置为当天的00:00:00
    }
    
    const calendarDays = [];
    
    // 计算本周主要月份（取本周中天数最多的月份）
    let currentYear, currentMonthNum;
    const monthCounts = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
    
    // 找出天数最多的月份
    let maxCount = 0;
    let maxMonth = '';
    for (const key in monthCounts) {
      if (monthCounts[key] > maxCount) {
        maxCount = monthCounts[key];
        maxMonth = key;
      }
    }
    
    const [year, month] = maxMonth.split('-').map(Number);
    currentYear = year;
    currentMonthNum = month;
    const currentMonth = `${currentYear}年${currentMonthNum}月`;
    
    // 生成本周7天的日期
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      
      calendarDays.push({
        day: day.toString(),
        date: dateStr,
        isToday,
        hasRecord: this.hasRecordForDate(dateStr),
        isAbnormal: this.isAbnormalDate(dateStr),
        poopIcon: this.getPoopIcon(dateStr),
        index: i // 添加索引用于匹配weekdayLabels
      });
    }
    
    this.setData({
      calendarDays,
      currentMonth,
      currentWeekStart: weekStart,
      calendarInitialized: true
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

  // 添加记录
  addRecord() {
    console.log('中间加号按钮被点击，跳转到记录页面');
    wx.navigateTo({
      url: '/pages/record/index',
      success: () => {
        console.log('已跳转到记录页面');
      },
      fail: (err) => {
        console.error('navigateTo 记录页面失败，改用 reLaunch：', err);
        wx.reLaunch({ url: '/pages/record/index' });
      }
    });
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
      wx.navigateTo({
        url: '/pages/ai/index',
        success: () => {
          console.log('已跳转到问AI页面');
        },
        fail: (err) => {
          console.error('navigateTo 问AI失败，改用 reLaunch：', err);
          wx.reLaunch({ url: '/pages/ai/index' });
        }
      });
    }
  },

  goToRecord() {
    // 保存当前选中的宠物ID到全局数据
    getApp().globalData = getApp().globalData || {};
    getApp().globalData.selectedPetId = this.data.currentPetId;
    
    // 使用 navigateTo 跳转（已移除系统 tabBar）
    wx.navigateTo({
      url: '/pages/record/index'
    });
  },

  // 显示完整日历视图
  showFullCalendar() {
    // 跳转到完整日历页面
    wx.navigateTo({
      url: '/pages/calendar/index?petId=' + this.data.currentPetId
    });
  },

  // 上一周
  prevWeek() {
    const currentWeekStart = new Date(this.data.currentWeekStart || new Date());
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    this.setData({
      currentWeekStart: currentWeekStart
    });
    
    this.initCalendar();
  },

  // 下一周
  nextWeek() {
    const currentWeekStart = new Date(this.data.currentWeekStart || new Date());
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    
    this.setData({
      currentWeekStart: currentWeekStart
    });
    
    this.initCalendar();
  }
});