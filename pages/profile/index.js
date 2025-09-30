// pages/profile/index.js
Page({
  data: {
    totalRecords: 0,
    avgScore: 0,
    usageDays: 0
  },

  onLoad() {
    this.loadProfileData();
  },

  onShow() {
    this.loadProfileData();
  },

  // 加载个人资料数据
  loadProfileData() {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      const totalRecords = records.length;
      
      let avgScore = 0;
      if (totalRecords > 0) {
        avgScore = Math.round(
          records.reduce((sum, record) => sum + record.healthScore, 0) / totalRecords
        );
      }
      
      // 计算使用天数
      let usageDays = 0;
      if (records.length > 0) {
        const firstRecord = records[records.length - 1]; // 最早的记录
        const lastRecord = records[0]; // 最新的记录
        const firstDate = new Date(firstRecord.timestamp);
        const lastDate = new Date(lastRecord.timestamp);
        usageDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
      }
      
      this.setData({
        totalRecords,
        avgScore,
        usageDays
      });
    } catch (error) {
      console.error('加载个人资料数据失败:', error);
    }
  }
});