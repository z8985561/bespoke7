const core = require("utils/core.js");
App({
  onShow: function () {
    this.onLaunch();
  },
  onLaunch: function () {
    var that = this;

    wx.getSystemInfo({
      success: function (t) {
        "0" == t.model.indexOf("iPhone X") ? that.setCache("isIpx", t.model) : that.setCache("isIpx", "");
      }
    }), this.getConfig();
    // 不主动获取信息
    // this.getUserInfo(function(e) {}, function(e, t) {
    //     var t = t ? 1 : 0, e = e || "";
    //     t && wx.redirectTo({
    //         url: "/pages/message/auth/index?close=" + t + "&text=" + e
    //     });
    // });
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，请重启应用',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  },
  // require 方法封装
  requirejs: function (core) {
    return require("utils/" + core + ".js");
  },
  // 获取全局配置参数
  getConfig: function () {
    if (null !== this.globalData.api) return {
      api: this.globalData.api,
      approot: this.globalData.approot,
      appid: this.globalData.appid
    };
    var e = wx.getExtConfigSync();
    return console.log(e), this.globalData.api = e.config.api, this.globalData.approot = e.config.approot,
      this.globalData.appid = e.config.appid, e.config;
  },
  // 获取缓存
  getCache: function (key, t) {
    var i = +new Date() / 1e3, n = "";
    i = parseInt(i);
    try {
      (n = wx.getStorageSync(key + this.globalData.appid)).expire > i || 0 == n.expire ? n = n.value : (n = "",
        this.removeCache(key));
    } catch (e) {
      n = void 0 === t ? "" : t;
    }
    return n = n || "";
  },
  // 设置缓存
  setCache: function (key, t, i) {
    var n = +new Date() / 1e3, o = !0, a = {
      expire: i ? n + parseInt(i) : 0,
      value: t
    };
    try {
      wx.setStorageSync(key + this.globalData.appid, a);
    } catch (e) {
      o = !1;
    }
    return o;
  },
  // 删除缓存
  removeCache: function (key) {
    var t = !0;
    try {
      wx.removeStorageSync(key + this.globalData.appid);
    } catch (e) {
      t = !1;
    }
    return t;
  },
  getUserInfo: function (t, i, n) {
    var o = this, a = {}, a = o.getCache("userinfo");
    wx.login({
      success: function (n) {
        n.code ? core.post("wxapp/login", {
          code: n.code
        }, function (n) {
          n.error ? core.alert("获取用户登录态失败:" + n.message) : n.isclose && i && "function" == typeof i ? i(n.closetext, !0) : wx.getUserInfo({
            success: function (i) {
              a = i.userInfo, core.get("wxapp/auth", {
                data: i.encryptedData,
                iv: i.iv,
                sessionKey: n.session_key
              }, function (e) {
                wx.hideLoading();
                wx.showToast({ title: '授权成功', icon: 'none' });
                i.userInfo.openid = e.openId, i.userInfo.id = e.id, i.userInfo.uniacid = e.uniacid,
                  i.needauth = 0, o.setCache("userinfo", i.userInfo, 7200), o.setCache("userinfo_openid", i.userInfo.openid),
                  o.setCache("userinfo_id", e.id), o.getSet(), t && "function" == typeof t && t(a);
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
              });
            },
            fail: function () {
              e.get("wxapp/check", {
                openid: n.openid
              }, function (e) {
                e.needauth = 1, o.setCache("userinfo", e, 7200), o.setCache("userinfo_openid", n.openid),
                  o.setCache("userinfo_id", n.id), o.getSet(), t && "function" == typeof t && t(a);
              });
            }
          });
        }) : core.alert("获取用户登录态失败:" + n.errMsg);
      },
      fail: function () {
        core.alert("获取用户信息失败!");
      }
    });
  },
  getSet: function () {
    var t = this, i = t.getCache("cacheset");
    "" == i && setTimeout(function () {
      core.get("cacheset", {
        version: i.version
      }, function (e) {
        console.log(e), e.update && t.setCache("cacheset", e.data);
      });
    }, 10);
  },
  url: function (e) {
    e = e || {};
    var t = {}, i = "", n = "", o = this.getCache("usermid");
    i = e.mid || "", n = e.merchid || "", "" != o ? ("" != o.mid && void 0 !== o.mid && (t.mid = o.mid) || (t.mid = i),
      "" != o.merchid && void 0 !== o.merchid || (t.merchid = n)) : (t.mid = i, t.merchid = n),
      this.setCache("usermid", t, 7200);
  },
  impower: function (e, t, i) {
    wx.getSetting({
      success: function (n) {
        console.log(n), n.authSetting["scope." + e] || wx.showModal({
          title: "用户未授权",
          content: "您点击了拒绝授权，暂时无法" + t + "，点击去设置可重新获取授权喔~",
          confirmText: "去设置",
          success: function (e) {
            core.confirm ? wx.openSetting({
              success: function (e) { }
            }) : "route" == i ? wx.switchTab({
              url: "/pages/index/index"
            }) : "details" == i || wx.navigateTo({
              url: "/pages/index/index"
            });
          }
        });
      }
    });
  },

  /**
     * 分享送优惠券
  * */
  shareSendCoupon: function (page) {
    wx.showLoading({
      mask: true,
    });
    if (!page.hideGetCoupon) {
      page.hideGetCoupon = function (e) {
        var url = e.currentTarget.dataset.url || false;
        page.setData({
          get_coupon_list: null,
        });
        if (url) {
          wx.navigateTo({
            url: url,
          });
        }
      };
    }
    core.get('sale/coupon/share/send', {}, function (res) {
      if (res.error == 0) {
        page.setData({
          coupon_list: res.coupon_list
        });
      }
      wx.hideLoading();
    })
  },
  checkAccount: function () {
    core.get('shop/getAccountStatus', {}, function (res) {
      console.log(res);
      if (res) {
        if (res.istest) {
          wx.showModal({
            title: '温馨提示',
            content: res.message,
            showCancel: false,
          })
        }
      }
    })
  },
  globalData: {
    appid: "wx32b12b26bbfd1943",
    api: "http://s100.kemanduo.cc/app/ewei_shopv2_api.php?i=4",
    approot: "http://s100.kemanduo.cc/addons/ewei_shopv2/",
    userInfo: "",
  }
});
