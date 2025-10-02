// pages/add-pet/index.js
Page({
  data: {
    // 表单数据
    petName: '',
    petGender: '公',
    petBreed: '',
    birthDate: '',
    petWeight: '',
    notes: '',
    isNeutered: false,
    isVaccinated: false,
    petAvatar: '',
    
    // 性别选项
    genderOptions: [
      { value: '公', label: '公' },
      { value: '母', label: '母' }
    ],
    
    // 宠物品种选项（限制在6个以内）
    breedOptions: [
      '金毛', '泰迪', '柯基', '柴犬', '英短', '其他'
    ],

    
  },

  onLoad() {
    console.log('=== 添加宠物页面开始加载 ===');
    try {
      console.log('页面数据初始化完成');
      console.log('当前数据:', this.data);
    } catch (e) {
      console.error('页面加载异常:', e);
    }
    console.log('=== 添加宠物页面加载完成 ===');
  },

  onShow() {
    console.log('添加宠物页面显示');
  },

  onReady() {
    console.log('添加宠物页面渲染完成');
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 输入宠物名称
  onNameInput(e) {
    this.setData({
      petName: e.detail.value
    });
  },


  // 选择宠物性别
  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      petGender: gender
    });
  },

  // 输入体重
  onWeightInput(e) {
    this.setData({
      petWeight: e.detail.value
    });
  },

  // 切换绝育状态
  toggleNeutered() {
    this.setData({
      isNeutered: !this.data.isNeutered
    });
  },

  // 切换疫苗状态
  toggleVaccinated() {
    this.setData({
      isVaccinated: !this.data.isVaccinated
    });
  },


  // 选择表情
  // 上传宠物头像
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          petAvatar: tempFilePath
        });
      },
      fail: (error) => {
        console.error('选择图片失败:', error);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },


  // 选择宠物品种
  selectBreed() {
    console.log('selectBreed 被调用');
    console.log('品种选项:', this.data.breedOptions);
    
    wx.showActionSheet({
      itemList: this.data.breedOptions,
      success: (res) => {
        console.log('选择的品种索引:', res.tapIndex);
        const selectedBreed = this.data.breedOptions[res.tapIndex];
        console.log('选择的品种:', selectedBreed);
        this.setData({
          petBreed: selectedBreed
        });
      },
      fail: (error) => {
        console.error('选择品种失败:', error);
        wx.showModal({
          title: '选择失败',
          content: '品种选择失败: ' + JSON.stringify(error),
          showCancel: false
        });
      }
    });
  },


  // 出生日期选择器改变
  onBirthDateChange(e) {
    console.log('选择的出生日期:', e.detail.value);
    this.setData({
      birthDate: e.detail.value
    });
  },

  // 编辑可爱短语
  editCutePhrase() {
    wx.showModal({
      title: '编辑一句话介绍',
      editable: true,
      placeholderText: '在你眼里,Ta的样子',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            petCutePhrase: res.content.trim()
          });
        }
      }
    });
  },

  // 切换频道
  switchChannel(e) {
    const channel = e.currentTarget.dataset.channel;

    if (channel === 'home') {
      wx.switchTab({
        url: '/pages/index/index'
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
  },

  // 返回首页
  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 取消添加
  cancelAdd() {
    wx.showModal({
      title: '确认取消',
      content: '确定要放弃添加宠物吗？',
      success: (res) => {
        if (res.confirm) {
          this.goBack();
        }
      }
    });
  },

  // 保存宠物
  savePet() {
    const { petName, petGender, petBreed, birthDate, petWeight, notes, isNeutered, isVaccinated, petAvatar } = this.data;

    // 验证必填项
    if (!petName.trim()) {
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      });
      return;
    }

    if (!petBreed.trim()) {
      wx.showToast({
        title: '请选择宠物品种',
        icon: 'none'
      });
      return;
    }

    // 生成新的宠物ID
    const newPetId = 'pet' + Date.now();

    // 构建备注信息
    let notesList = [];
    if (isNeutered) notesList.push('已绝育');
    if (isVaccinated) notesList.push('已打疫苗');
    const notesText = notesList.length > 0 ? notesList.join('、') : '';

    // 构建宠物数据
    const newPet = {
      id: newPetId,
      name: petName.trim(),
      emoji: '🐕', // 默认表情
      avatar: petAvatar,
      gender: petGender,
      breed: petBreed.trim(),
      birthDate: birthDate,
      weight: petWeight.trim() ? petWeight.trim() + 'kg' : '',
      notes: notesText,
      isNeutered: isNeutered,
      isVaccinated: isVaccinated,
      phrase: '可爱的小宝贝'
    };

    // 保存到本地存储
    this.savePetToStorage(newPet);

    // 显示成功提示
    wx.showToast({
      title: '添加成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          this.goBack();
        }, 1500);
      }
    });
  },

  // 保存宠物到本地存储
  savePetToStorage(newPet) {
    try {
      const pets = wx.getStorageSync('pets') || [];
      pets.push(newPet);
      wx.setStorageSync('pets', pets);

      // 设置全局数据，让首页知道有新宠物添加
      const app = getApp();
      if (app.globalData) {
        app.globalData.selectedPetId = newPet.id;
        app.globalData.newPetAdded = true;
      }

      console.log('宠物保存成功:', newPet);
      console.log('设置全局数据 selectedPetId:', newPet.id);
    } catch (error) {
      console.error('保存宠物失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  }
});
