// pages/ai/index.js
Page({
  data: {
    messages: [],
    inputText: '',
    isLoading: false,
    scrollTop: 0,
    currentPet: '用户0617'
  },

  onLoad() {
    console.log('AI健康助手页面加载');
  },

  onShow() {
    console.log('AI健康助手页面显示');
  },

  // 返回上一页
  goBack() {
    try {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        wx.navigateBack({ delta: 1 });
      } else {
        wx.reLaunch({ url: '/pages/index/index' });
      }
    } catch (e) {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  // 选择健康问题
  selectHealthIssue(e) {
    const issue = e.currentTarget.dataset.issue;
    console.log('选择健康问题:', issue);
    
    let response = '';
    let title = '';
    
    switch (issue) {
      case 'hair-tangles':
        title = '毛发打结解决方案';
        response = '毛发打结的解决方案：\n\n1. 定期梳理：每天用专业的宠物梳子梳理毛发，从毛根到毛尖\n2. 使用护毛素：洗澡时使用护毛素，让毛发更顺滑易梳理\n3. 剪掉严重打结：如果打结严重，建议请专业美容师处理\n4. 预防措施：保持毛发清洁，避免长时间不梳理\n5. 选择合适工具：使用防静电梳子，减少毛发损伤';
        break;
      case 'hair-dry':
        title = '毛发干枯护理方案';
        response = '毛发干枯无光泽的解决方案：\n\n1. 营养补充：添加富含Omega-3的鱼油或营养膏\n2. 正确洗护：使用温和的宠物专用洗发水，避免过度清洁\n3. 饮食调理：选择高品质的宠物粮，富含蛋白质和维生素\n4. 定期护理：每周使用护毛素，保持毛发水分\n5. 环境改善：保持室内湿度，避免干燥环境';
        break;
    }
    
    if (response) {
      this.addAIMessage(response);
    }
  },

  // 切换咨询宠物
  switchPet() {
    wx.showActionSheet({
      itemList: ['腿腿', '大包', '李英俊'],
      success: (res) => {
        const pets = ['腿腿', '大包', '李英俊'];
        const selectedPet = pets[res.tapIndex];
        this.setData({
          currentPet: selectedPet
        });
        
        const message = `已切换到${selectedPet}，现在可以咨询关于${selectedPet}的健康问题。`;
        this.addAIMessage(message);
      }
    });
  },

  // 询问问题
  askQuestion(e) {
    const question = e.currentTarget.dataset.question;
    console.log('询问问题:', question);
    
    let response = '';
    
    switch (question) {
      case 'bad-breath':
        response = '宠物口臭的解决方案：\n\n1. 口腔清洁：定期刷牙，使用宠物专用牙膏和牙刷\n2. 口腔护理：使用口腔清洁水或洁牙骨，帮助去除牙垢\n3. 饮食调整：避免喂食人类食物，选择优质宠物粮\n4. 定期检查：每年带宠物做口腔检查，及早发现问题\n5. 专业清洁：必要时进行专业洗牙，彻底清除牙结石\n6. 注意观察：如果口臭持续或加重，及时就医检查';
        break;
      case 'dental-calculus':
        response = '解决牙结石的方法：\n\n1. 预防为主：从小培养刷牙习惯，每天坚持\n2. 专业洗牙：定期到宠物医院进行超声波洗牙\n3. 日常护理：使用洁牙骨、口腔清洁水等辅助产品\n4. 饮食控制：避免软食，选择硬质食物帮助清洁牙齿\n5. 定期检查：每半年检查一次口腔健康\n6. 及时处理：发现牙结石及时处理，避免影响牙齿健康';
        break;
    }
    
    if (response) {
      this.addAIMessage(response);
    }
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    const message = this.data.inputText.trim();
    if (!message) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      });
      return;
    }

    // 添加用户消息
    this.addUserMessage(message);

    // 清空输入框
    this.setData({
      inputText: ''
    });

    // 显示加载状态
    this.setData({
      isLoading: true
    });

    // 模拟AI回复
    setTimeout(() => {
      this.generateAIResponse(message);
    }, 1000);
  },

  // 添加用户消息
  addUserMessage(content) {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content,
      time: this.getCurrentTime()
    };

    this.setData({
      messages: [...this.data.messages, userMessage]
    });

    this.scrollToBottom();
  },

  // 添加AI消息
  addAIMessage(content) {
    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: content,
      time: this.getCurrentTime()
    };

    this.setData({
      messages: [...this.data.messages, aiMessage],
      isLoading: false
    });

    this.scrollToBottom();
  },

  // 生成AI回复
  generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    let response = '';
    
    // 关键词匹配回复
    if (message.includes('便便') || message.includes('大便') || message.includes('拉屎')) {
      response = '关于宠物便便的问题，我建议你观察便便的形状、颜色和频率。正常的便便应该是成型的、棕色的。如果发现异常，建议及时咨询兽医。';
    } else if (message.includes('健康') || message.includes('生病')) {
      response = '宠物健康需要从饮食、运动、定期体检等方面来维护。建议定期带宠物去兽医那里做健康检查，保持均衡的饮食和适量的运动。';
    } else if (message.includes('饮食') || message.includes('吃') || message.includes('食物')) {
      response = '宠物的饮食很重要，建议选择适合宠物年龄和体型的优质狗粮，避免喂食人类食物，特别是巧克力、洋葱等对宠物有害的食物。';
    } else if (message.includes('疫苗') || message.includes('打针')) {
      response = '疫苗是保护宠物健康的重要措施，建议按照兽医的建议定期接种疫苗，包括狂犬病疫苗和核心疫苗。';
    } else if (message.includes('洗澡') || message.includes('清洁')) {
      response = '宠物洗澡的频率要根据品种和活动量来定，一般建议每月1-2次。使用专门的宠物洗浴用品，注意水温适中，避免水进入耳朵。';
    } else if (message.includes('运动') || message.includes('遛狗') || message.includes('散步')) {
      response = '适量的运动对宠物健康很重要，建议每天带宠物散步或玩耍，运动量要根据宠物的年龄、体型和健康状况来调整。';
    } else if (message.includes('年龄') || message.includes('岁')) {
      response = '不同年龄段的宠物有不同的需求，幼犬需要更多的营养和训练，成年犬需要维持健康，老年犬需要更多的关爱和医疗照顾。';
    } else if (message.includes('训练') || message.includes('教') || message.includes('学习')) {
      response = '宠物训练需要耐心和一致性，建议使用正向强化方法，及时奖励好的行为，避免惩罚。可以寻求专业训练师的帮助。';
    } else if (message.includes('谢谢') || message.includes('感谢')) {
      response = '不客气！我很高兴能帮助你和你的宠物。如果还有其他问题，随时可以问我哦～';
    } else if (message.includes('你好') || message.includes('hi') || message.includes('hello')) {
      response = '你好！我是你的宠物健康助手，专门帮助解答关于宠物健康、饮食、训练等方面的问题。有什么想了解的吗？';
    } else {
      response = '感谢你的问题！作为宠物健康助手，我主要可以帮助解答关于宠物健康、饮食、训练、疫苗、清洁等方面的问题。你可以具体描述一下你想了解的内容，我会尽力为你提供专业的建议。';
    }
    
    this.addAIMessage(response);
  },

  // 获取当前时间
  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      this.setData({
        scrollTop: 99999
      });
    }, 100);
  }
