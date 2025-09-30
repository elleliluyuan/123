// pages/statistics/index.js
Page({
  data: {
    weeklyStats: {
      totalRecords: 0,
      avgScore: 0,
      healthyRate: 0,
      abnormalCount: 0
    },
    monthlyStats: {
      totalRecords: 0,
      avgScore: 0,
      healthyRate: 0,
      abnormalCount: 0
    }
  },

  onLoad() {
    this.calculateStats();
  },

  onShow() {
    this.calculateStats();
  },

  // 计算统计数据
  calculateStats() {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      const now = new Date();
      
      // 计算本周数据
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekRecords = records.filter(record => 
        new Date(record.timestamp) >= weekAgo
      );
      
      // 计算本月数据
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthRecords = records.filter(record => 
        new Date(record.timestamp) >= monthStart
      );
      
      this.setData({
        weeklyStats: this.calculatePeriodStats(weekRecords),
        monthlyStats: this.calculatePeriodStats(monthRecords)
      });
    } catch (error) {
      console.error('计算统计数据失败:', error);
    }
  },

  // 计算某个时期的统计数据
  calculatePeriodStats(records) {
    if (records.length === 0) {
      return {
        totalRecords: 0,
        avgScore: 0,
        healthyRate: 0,
        abnormalCount: 0
      };
    }
    
    const totalRecords = records.length;
    const avgScore = Math.round(
      records.reduce((sum, record) => sum + record.healthScore, 0) / totalRecords
    );
    const healthyCount = records.filter(record => record.healthScore >= 80).length;
    const healthyRate = Math.round((healthyCount / totalRecords) * 100);
    const abnormalCount = records.filter(record => record.healthScore < 60).length;
    
    return {
      totalRecords,
      avgScore,
      healthyRate,
      abnormalCount
    };
  }
});