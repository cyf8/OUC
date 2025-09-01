Page({
  /**
  * 页面的初始数据
  */
  data: {
      region:['安徽省','芜湖市','镜湖区'],
      now:{
      tmp:0,
      cond_txt:'未知',
      cond_code:'999',
      hum:0,
      pres:0,
      vis:0,
      wind_dir:0,
      wind_spd:0,
      wind_sc:0
      }
  },

  /**
  * 更新省、市、 区信息
  */
  regionChange:function(e){
      this.setData({region:e.detail.value});
      this.getWeather();
  },

  /**
  * 获取实况天气数据
  */
  getWeather:function(){
      var that = this;
      
      // 先通过地名获取 Location ID
      wx.request({
      url: 'https://mt4y3jhkp4.re.qweatherapi.com/geo/v2/city/lookup',
      data: {
          location: that.data.region[1],  // 使用地名
          key: '0d42f9fa16734b6bac2dc57d6ee96f9c'
      },
      success: function(res) {
          // 获取 Location ID
          var locationId = res.data.location[0].id;
          
          // 使用 Location ID 查询天气
          wx.request({
          url: 'https://mt4y3jhkp4.re.qweatherapi.com/v7/weather/now',
          data: {
              location: locationId,
              key: '0d42f9fa16734b6bac2dc57d6ee96f9c',
              adm: that.data.region[1] // 使用地名
          },
          success: function(res) {
              console.log(res.data);
              that.setData({now:res.data.now});
          }
          })
      }
      });
  },


  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
      this.getWeather();
  },
})

