Page({
  //获取用户信息
  getMyInfo:function(e){
    wx.getUserProfile({
      desc:'展示用户信息',
      success:(res) =>{
        console.log(res)
        this.setData({
          src:res.userInfo.avatarUrl,
          name:res.userInfo.nickName
        })
      }
    })
  },

  //页面初始数据
  data: {
    src:'/images/logo.png',
    name:'Hello World'  
  },
})