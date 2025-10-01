// pages/add-pet/index.js
Page({
  data: {
    // 表单数据
    petName: '',
    petGender: '公',
    sterilizationStatus: '未绝育',
    petWeight: '',
    petBreed: '',
    petCutePhrase: '',
    petAvatar: '',
    birthDate: '',
    
    // 性别选项
    genderOptions: [
      { value: '公', label: '公' },
      { value: '母', label: '母' }
    ],
    
    // 宠物品种选项
    breedOptions: [
      '金毛', '拉布拉多', '哈士奇', '泰迪', '比熊', '博美', '柯基', '柴犬',
      '萨摩耶', '阿拉斯加', '德牧', '边牧', '英短', '美短', '布偶', '暹罗',
      '波斯', '加菲', '橘猫', '三花', '其他'
    ],

    // 体重选项
    weightOptions: [
      '1kg以下', '1-2kg', '2-3kg', '3-4kg', '4-5kg', '5-6kg', '6-7kg', '7-8kg',
      '8-9kg', '9-10kg', '10-15kg', '15-20kg', '20-25kg', '25-30kg', '30kg以上'
    ],
    
    // 可爱短语模板
    cutePhraseTemplates: [
      '热爱自然的拉屎大王',
      '优雅的便便艺术家',
      '活泼可爱的小天使',
      '温柔体贴的小宝贝',
      '聪明机智的小精灵',
      '憨厚可爱的小萌宠',
      '活力四射的小太阳',
      '乖巧听话的小天使'
    ]
  },

  onLoad() {
    console.log('添加宠物页面加载');
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

  // 选择绝育状态
  selectSterilization(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      sterilizationStatus: status
    });
  },


  // 输入可爱短语
  onCutePhraseInput(e) {
    this.setData({
      petCutePhrase: e.detail.value
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

  // 随机选择可爱短语
  randomCutePhrase() {
    const templates = this.data.cutePhraseTemplates;
    const randomIndex = Math.floor(Math.random() * templates.length);
    this.setData({
      petCutePhrase: templates[randomIndex]
    });
  },

  // 编辑宠物名称
  editName() {
    wx.showModal({
      title: '编辑宠物名字',
      editable: true,
      placeholderText: '请输入宠物名字',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            petName: res.content.trim()
          });
        }
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
      }
    });
  },

  // 选择宠物体重
  selectWeight() {
    console.log('selectWeight 被调用');
    console.log('体重选项:', this.data.weightOptions);
    wx.showActionSheet({
      itemList: this.data.weightOptions,
      success: (res) => {
        console.log('选择的体重索引:', res.tapIndex);
        const selectedWeight = this.data.weightOptions[res.tapIndex];
        console.log('选择的体重:', selectedWeight);
        this.setData({
          petWeight: selectedWeight
        });
      },
      fail: (error) => {
        console.error('选择体重失败:', error);
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
    const { petName, petGender, sterilizationStatus, petWeight, petBreed, petCutePhrase, petAvatar, birthDate } = this.data;

    // 验证必填项
    if (!petName.trim()) {
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      });
      return;
    }

    if (!petWeight.trim()) {
      wx.showToast({
        title: '请选择宠物体重',
        icon: 'none'
      });
      return;
    }

    // 生成新的宠物ID
    const newPetId = 'pet' + Date.now();

    // 构建宠物数据
    const newPet = {
      id: newPetId,
      name: petName.trim(),
      emoji: '🐕', // 默认表情
      avatar: petAvatar,
      gender: petGender,
      sterilizationStatus: sterilizationStatus,
      weight: petWeight.trim(),
      breed: petBreed.trim(),
      birthDate: birthDate.trim(),
      phrase: petCutePhrase.trim() || '可爱的小宝贝'
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

      // 同时更新首页的宠物数据
      const pages = getCurrentPages();
      const indexPage = pages.find(page => page.route === 'pages/index/index');
      if (indexPage) {
        indexPage.setData({
          pets: pets
        });
      }

      console.log('宠物保存成功:', newPet);
    } catch (error) {
      console.error('保存宠物失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  }
});
