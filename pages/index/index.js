//index.js
Page({
  data: {
    calendarDays: []
  },

  onLoad() {
    this.initCalendar();
  },

  initCalendar() {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    this.setData({
      calendarDays: days
    });
  },

  goToRecord() {
    wx.navigateTo({
      url: '/pages/record/index'
    });
  }
});