// pages/history/index.js
Page({
  data: {
    historyList: []
  },

  onLoad() {
    this.loadHistoryData();
  },

  onShow() {
    this.loadHistoryData();
  },

  // 加载历史数据
  loadHistoryData() {
    try {
      const records = wx.getStorageSync('poopRecords') || [];
      const historyList = records.map(record => ({
        id: record.id,
        date: record.date || record.timestamp.split('T')[0],
        petName: record.petId === 'pet1' ? '腿腿' : '大包',
        shape: this.getShapeLabel(record.shape),
        color: this.getColorLabel(record.color),
        healthScore: record.healthScore
      }));
      
      this.setData({
        historyList: historyList
      });
    } catch (error) {
      console.error('加载历史数据失败:', error);
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
  }
});