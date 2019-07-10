// pages/diydemo1/index.js
import DragGraph from "./dragGraph.js";
import PSD from "./psd.js";
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIpx: false,
    isShowPsdBox: false,
    // 素材列表
    drawArr: [],
    // 缓存操作图层
    tempGraphArr: [],
    // 设备宽度和设计图宽度比例
    screenWidth: 375,
    factor: 0,
    context: null,
    // 素材数据
    psd: null,
    // 产品信息
    goods: {
      title: "手提包",
      price: "128.00",
      // 设备宽度和设计图宽度比例
      factor: 0,
      designWidth: 1069,
      designX: 97,
      designY: 256,
      designAreaWidth: 879,
      designAreaHeight: 558,
      // 风格数组
      style: [{
          styleName: "黑色",
          designBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g20_layout_mask_design.png",
          specBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g20_layout_mask_spec.png",
          previewBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g20_preview.png",
        },
        {
          styleName: "深蓝色",
          designBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g21_layout_mask_design.png",
          specBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g21_layout_mask_spec.png",
          previewBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g21_preview.png",
        }, {
          styleName: "蓝色",
          designBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g22_layout_mask_design.png",
          specBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g22_layout_mask_spec.png",
          previewBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g22_preview.png",
        }, {
          styleName: "红色",
          designBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g23_layout_mask_design.png",
          specBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g23_layout_mask_spec.png",
          previewBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g23_preview.png",
        }, {
          styleName: "紫色",
          designBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g24_layout_mask_design.png",
          specBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g24_layout_mask_spec.png",
          previewBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g24_preview.png",
        }
      ]
    },
    isShowStyleBox: false,
    // 默认选择第一个款式
    styleActive: 0,
    // 缓存产品第一个款式的设计背景
    tempGoodsItem: {
      styleName: "黑色",
      designBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g20_layout_mask_design.png",
      specBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g20_layout_mask_spec.png",
      previewBg: "http://frontend.guangzhoubaidu.com/A01/a13/a13_g20_preview.png",
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    // 计算比例参数
    wx.getSystemInfo({
      success: function(res) {
        that.data.factor = res.screenWidth / that.data.goods.designWidth;
        that.data.screenWidth = res.screenWidth;
      },
    })
    //初始化canvas
    this.data.context = wx.createCanvasContext('canvas');

    // 判断是否是ipx
    this.setData({
      isIpx: app.getCache("isIpx")
    })

    // 加载素材
    this.setData({
      psd: PSD.data
    })
  },
  // 取消选择状态
  cancelChooes() {
    this.data.drawArr.forEach((item) => {
      item.selected = false;
    })
  },
  saveImg(e) {
    wx.showLoading({
      title: '生成中',
    })
    setTimeout(() => {
      this.cancelChooes()
      this.draw(this.data.tempGoodsItem.specBg);
      wx.hideLoading()
    }, 1000)

  },
  // 查看效果图
  showImg() {
    wx.showLoading({
      title: '生成中',
    })
    setTimeout(() => {
      this.cancelChooes()
      this.draw(this.data.tempGoodsItem.previewBg);
      wx.hideLoading()
    }, 1000)
  },
  addLocalImg() {
    new Promise((resolve, rejreject) => {
        wx.chooseImage({
          success: (res) => {
            wx.getImageInfo({
              src: res.tempFilePaths[0],
              success(res) {
                resolve(res)
              }
            })
          }
        })
      })
      .then(res => {
        let width, height, factor = this.data.goods.designAreaWidth / res.width;
        width = this.toPx(res.width * factor);
        height = this.toPx(res.height * factor);
        this.data.drawArr.push(new DragGraph({
          x: this.toPx(this.data.goods.designX),
          y: this.toPx(this.data.goods.designY),
          w: width,
          h: height,
          type: "image",
          url: res.path,
          selected: false
        }, this.data.context, this.data.factor));
        this.setData({
          drawArr: this.data.drawArr
        })
      }).then(() => {
        this.draw(this.data.tempGoodsItem.designBg);
      })

  },
  // 添加素材图片
  addPsdImg(e) {
    let {
      img
    } = e.currentTarget.dataset;
    new Promise((resolve, rejreject) => {
        wx.getImageInfo({
          src: img,
          success(res) {
            resolve(res)
          }
        })
      })
      .then(res => {
        let width, height, factor = this.data.goods.designAreaWidth / res.width;
        width = this.toPx(res.width * factor);
        height = this.toPx(res.height * factor);
        this.data.drawArr.push(new DragGraph({
          x: this.toPx(this.data.goods.designX),
          y: this.toPx(this.data.goods.designY),
          w: width,
          h: height,
          type: "image",
          url: res.path,
          selected: false
        }, this.data.context, this.data.factor));
        this.setData({
          drawArr: this.data.drawArr
        })
      }).then(() => {
        this.draw(this.data.tempGoodsItem.designBg);
      })
  },
  toPx(rpx) {
    return rpx * this.data.factor;
  },
  // 执行绘画
  // bgImage 背景图
  draw(bgImage) {
    this.data.drawArr.forEach((item) => {
      item.paint();
    });
    if (bgImage !== '') {
      this.data.context.drawImage(bgImage, 0, 0, this.toPx(this.data.goods.designWidth), this.toPx(this.data.goods.designWidth));
    } else {
      console.log("请选择一张背景！")
    }
    return new Promise((resolve) => {
      this.data.context.draw(false, () => {
        resolve();
      });
    });
  },
  // 手势操作
  start(e) {
    const {
      x,
      y
    } = e.touches[0];
    if (e.touches.length < 2) {
      // 保存点击时的坐标
      this.data.currentTouch = {
        x,
        y
      };
    } else {
      this.data.currentTouch = {
        x,
        y,
        x2: e.touches[1].x,
        y2: e.touches[1].y,
      };
    }
    this.data.tempGraphArr = [];
    let lastDelIndex = null; // 记录最后一个需要删除的索引
    this.data.drawArr && this.data.drawArr.forEach((item, index) => {
      const action = item.isInGraph(x, y);
      if (action) {
        item.action = action;
        this.data.tempGraphArr.push(item);
      } else {
        item.action = false;
        item.selected = false;
      }
    });
    // 保存点击时元素的信息
    if (this.data.tempGraphArr.length > 0) {
      for (let i = 0; i < this.data.tempGraphArr.length; i++) {
        let lastIndex = this.data.tempGraphArr.length - 1;
        // 对最后一个元素做操作
        if (i === lastIndex) {
          // 未选中的元素，不执行删除和缩放操作
            this.data.tempGraphArr[lastIndex].selected = true;
            this.setData({
              currentGraph: Object.assign({}, this.data.tempGraphArr[lastIndex])
            })
            // this.data.currentGraph = Object.assign({}, this.data.tempGraphArr[lastIndex]);
        } else {
          // 不是最后一个元素，不需要选中，也不记录状态
          this.data.tempGraphArr[i].action = false;
          this.data.tempGraphArr[i].selected = false;
        }
      }
    } else if (this.data.currentGraph) {
      this.setData({
        ['currentGraph.selected']: false
      })
    }
    this.draw(this.data.tempGoodsItem.designBg);
    // 筛选出被选择图层的index
    if (this.data.drawArr.length > 0) {
      this.recordIndex(this.data.drawArr)
    }
  },
  move(e) {
    const {
      x,
      y
    } = e.touches[0];
    if (e.touches.length > 1) {
      var x2 = e.touches[1].x;
      var y2 = e.touches[1].y;
    }
    if (this.data.tempGraphArr && this.data.tempGraphArr.length > 0) {
      const currentGraph = this.data.tempGraphArr[this.data.tempGraphArr.length - 1];
      if (currentGraph.action === 'move' && e.touches.length == 1) {
        currentGraph.centerX = this.data.currentGraph.centerX + (x - this.data.currentTouch.x);
        currentGraph.centerY = this.data.currentGraph.centerY + (y - this.data.currentTouch.y);
        // 使用中心点坐标计算位移，不使用 x,y 坐标，因为会受旋转影响。
        if (currentGraph.type !== 'text') {
          currentGraph.x = currentGraph.centerX - this.data.currentGraph.w / 2;
          currentGraph.y = currentGraph.centerY - this.data.currentGraph.h / 2;
        }
      } else if (e.touches.length == 2) {
        const twoPoint = {
          x,
          y,
          x2,
          y2
        }
        currentGraph.rotateEvent(this.data.currentTouch, twoPoint, this.data.currentGraph);
      }
      // 更新4个坐标点（相对于画布的坐标系）
      currentGraph._rotateSquare();
      this.draw(this.data.tempGoodsItem.designBg);
    }
  },
  // 结束手指滑动
  end(e) {
    this.data.tempGraphArr = [];
  },
  // 筛选出被选择图层的index
  recordIndex(arr) {
    if (!arr || !Array.isArray(arr)) {
      return;
    }
    arr.forEach((item, index) => {
      if (item.selected) {
        this.setData({
          itemIndex: index
        })
        // this.data.itemIndex = index;
      }
    })
  },
  // 弹出素材选择层
  showPsdBox(e) {
    let {
      type
    } = e.currentTarget.dataset;
    if (type === "show") {
      this.setData({
        isShowPsdBox: true
      })
    } else {
      this.setData({
        isShowPsdBox: false
      })
    }
  },
  // 确认修改按钮
  confirmEdit() {
    this.setData({
      ['currentGraph.selected']: false
    })
  },
  // 移动图层层级
  moveLevel(e) {
    if (!this.data.drawArr.length) {
      return;
    }
    let {
      type
    } = e.currentTarget.dataset;
    let index = this.data.itemIndex;
    let len = this.data.drawArr.length;
    let item = this.data.drawArr.splice(this.data.itemIndex, 1)
    if (type === 'up' && index < len - 1) {
      ++index;
      console.log(index)
    } else if (type === 'down' && index > 0) {
      --index;
    }
    this.data.drawArr.splice(index, 0, item[0])
    this.draw(this.data.tempGoodsItem.designBg);
    this.setData({
      itemIndex: index
    })
  },
  // 旋转事件
  rotateEvent(e) {
    let {
      type
    } = e.currentTarget.dataset;
    let drawArr = this.data.drawArr;
    let index = this.data.itemIndex;
    if (type === "normal") {
      drawArr[index].rotate = 0;
    } else {
      if (drawArr[index].rotate >= 0 && drawArr[index].rotate < 90) {
        drawArr[index].rotate = 90;
      } else if (drawArr[index].rotate >= 90 && drawArr[index].rotate < 180) {
        drawArr[index].rotate = 180;
      } else if (drawArr[index].rotate >= 180 && drawArr[index].rotate < 270) {
        drawArr[index].rotate = 270;
      } else if (drawArr[index].rotate >= 270 && drawArr[index].rotate < 360) {
        drawArr[index].rotate = 0;
      }
    }
    this.setData({
      drawArr
    })
    this.draw(this.data.tempGoodsItem.designBg);
  },
  // 居中事件
  centerEvent() {
    let drawArr = this.data.drawArr;
    let index = this.data.itemIndex;
    drawArr[index].x = (this.data.screenWidth - drawArr[index].w) / 2;
    drawArr[index].centerX = drawArr[index].x + drawArr[index].w / 2;
    this.setData({
      drawArr
    })
    this.draw(this.data.tempGoodsItem.designBg);
  },
  // 删除事件
  deleteEvent() {
    let drawArr = this.data.drawArr;
    let index = this.data.itemIndex;
    drawArr.splice(index, 1)
    this.setData({
      drawArr,
      currentGraph: {}
    })
    this.draw(this.data.tempGoodsItem.designBg);
  },
  // 弹出风格选择层
  showStyleBox(e) {
    let {
      type
    } = e.currentTarget.dataset;
    if (type === "show") {
      this.setData({
        isShowStyleBox: true
      })
    } else {
      this.setData({
        isShowStyleBox: false
      })
    }
  },
  // 选择风格事件
  chooseStyle(e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      tempGoodsItem: this.data.goods.style[index]
    })
    this.draw(this.data.tempGoodsItem.designBg);
  },
  // 加载风格背景图
  setTempGoodsItem(){
    let style = this.data.goods.style;
    return new Promise((resolve,rejreject)=>{
      wx.getImageInfo({
        src: style[0].designBg,
        success(res){
          resolve(res)
        }
      })
    }).then(res=>{
      style[0].designBg = res.path;
      this.setData({
        tempGoodsItem: style[0]
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setTempGoodsItem().then(()=>{
      console.log(this.data.tempGoodsItem.designBg)
      this.draw(this.data.tempGoodsItem.designBg);
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
})