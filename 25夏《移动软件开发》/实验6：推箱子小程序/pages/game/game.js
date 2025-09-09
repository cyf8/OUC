// 引用公共地图数据文件
var data = require('../../utils/data.js')

// 地图图层数据（8x8）
var map = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
]

// 箱子图层数据（8x8）
var box = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
]

// 方块宽度（画布总宽320px / 8格 = 40px）
var w = 40
// 游戏主角（小鸟）初始行列（将在initMap中重新赋值）
var row = 0
var col = 0

Page({
  /**
   * 页面的初始数据
   */
  data: {
    level: 1 // 默认显示第1关
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取首页传递的关卡参数（0开始）
    let level = options.level;
    // 更新页面关卡标题（转为1开始的显示格式）
    this.setData({
      level: parseInt(level) + 1
    })
    // 创建画布上下文
    this.ctx = wx.createCanvasContext('myCanvas')
    // 初始化当前关卡地图数据
    this.initMap(level)
    // 绘制游戏画面
    this.drawCanvas()
  },

  /**
   * 自定义函数：初始化地图数据
   * @param {number} level - 关卡索引（0开始）
   */
  initMap: function (level) {
    // 读取对应关卡的原始地图数据
    let mapData = data.maps[level]
    // 双重循环解析地图数据
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        box[i][j] = 0 // 重置箱子数据
        map[i][j] = mapData[i][j] // 赋值地图基础数据

        // 若当前位置是箱子（4）：分离箱子数据到box数组，地图改为路（2）
        if (mapData[i][j] == 4) {
          box[i][j] = 4
          map[i][j] = 2
        }
        // 若当前位置是人物（5）：地图改为路（2），记录人物初始位置
        else if (mapData[i][j] == 5) {
          map[i][j] = 2
          row = i
          col = j
        }
      }
    }
  },

  /**
   * 自定义函数：绘制游戏画布
   */
  drawCanvas: function () {
    let ctx = this.ctx
    // 清空画布（避免重绘时叠加）
    ctx.clearRect(0, 0, 320, 320)

    // 双重循环绘制8x8地图
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        // 默认绘制路（ice.png）
        let img = 'ice'
        // 若为墙（1）：绘制石头（stone.png）
        if (map[i][j] == 1) {
          img = 'stone'
        }
        // 若为终点（3）：绘制猪（pig.png，文档中终点对应pig图标）
        else if (map[i][j] == 3) {
          img = 'pig'
        }

        // 绘制地图基础图层（路/墙/终点）
        ctx.drawImage('/images/icons/' + img + '.png', j * w, i * w, w, w)

        // 若当前位置有箱子（4）：叠加绘制箱子（box.png）
        if (box[i][j] == 4) {
          ctx.drawImage('/images/icons/box.png', j * w, i * w, w, w)
        }
      }
    }

    // 叠加绘制游戏主角（小鸟，bird.png）
    ctx.drawImage('/images/icons/bird.png', col * w, row * w, w, w)

    // 执行绘制（将内存中的绘图操作渲染到画布）
    ctx.draw()
  },

  /**
   * 自定义函数：方向键-上移
   */
  up: function () {
    // 判断是否在最顶端（行号>0才可上移）
    if (row > 0) {
      // 情况1：上方不是墙（1）且没有箱子（4）→ 直接移动主角
      if (map[row - 1][col] != 1 && box[row - 1][col] != 4) {
        row = row - 1
      }
      // 情况2：上方有箱子（4）→ 判断是否可推动
      else if (box[row - 1][col] == 4) {
        // 箱子不在最顶端（避免推出地图）
        if (row - 1 > 0) {
          // 箱子上方不是墙且没有其他箱子→ 推动箱子+移动主角
          if (map[row - 2][col] != 1 && box[row - 2][col] != 4) {
            box[row - 2][col] = 4 // 箱子上移一格
            box[row - 1][col] = 0 // 原箱子位置清空
            row = row - 1 // 主角上移一格
          }
        }
      }
    }
    // 重绘画布（更新位置）
    this.drawCanvas()
    // 检查游戏是否成功
    this.checkWin()
  },

  /**
   * 自定义函数：方向键-下移
   */
  down: function () {
    // 判断是否在最底端（行号<7才可下移，8行索引0-7）
    if (row < 7) {
      // 情况1：下方不是墙且无箱子→ 直接移动主角
      if (map[row + 1][col] != 1 && box[row + 1][col] != 4) {
        row = row + 1
      }
      // 情况2：下方有箱子→ 判断是否可推动
      else if (box[row + 1][col] == 4) {
        // 箱子不在最底端
        if (row + 1 < 7) {
          // 箱子下方不是墙且无其他箱子→ 推动箱子+移动主角
          if (map[row + 2][col] != 1 && box[row + 2][col] != 4) {
            box[row + 2][col] = 4 // 箱子下移一格
            box[row + 1][col] = 0 // 原箱子位置清空
            row = row + 1 // 主角下移一格
          }
        }
      }
    }
    // 重绘画布
    this.drawCanvas()
    // 检查游戏是否成功
    this.checkWin()
  },

  /**
   * 自定义函数：方向键-左移
   */
  left: function () {
    // 判断是否在最左侧（列号>0才可左移）
    if (col > 0) {
      // 情况1：左侧不是墙且无箱子→ 直接移动主角
      if (map[row][col - 1] != 1 && box[row][col - 1] != 4) {
        col = col - 1
      }
      // 情况2：左侧有箱子→ 判断是否可推动
      else if (box[row][col - 1] == 4) {
        // 箱子不在最左侧
        if (col - 1 > 0) {
          // 箱子左侧不是墙且无其他箱子→ 推动箱子+移动主角
          if (map[row][col - 2] != 1 && box[row][col - 2] != 4) {
            box[row][col - 2] = 4 // 箱子左移一格
            box[row][col - 1] = 0 // 原箱子位置清空
            col = col - 1 // 主角左移一格
          }
        }
      }
    }
    // 重绘画布
    this.drawCanvas()
    // 检查游戏是否成功
    this.checkWin()
  },

  /**
   * 自定义函数：方向键-右移
   */
  right: function () {
    // 判断是否在最右侧（列号<7才可右移，8列索引0-7）
    if (col < 7) {
      // 情况1：右侧不是墙且无箱子→ 直接移动主角
      if (map[row][col + 1] != 1 && box[row][col + 1] != 4) {
        col = col + 1
      }
      // 情况2：右侧有箱子→ 判断是否可推动
      else if (box[row][col + 1] == 4) {
        // 箱子不在最右侧
        if (col + 1 < 7) {
          // 箱子右侧不是墙且无其他箱子→ 推动箱子+移动主角
          if (map[row][col + 2] != 1 && box[row][col + 2] != 4) {
            box[row][col + 2] = 4 // 箱子右移一格
            box[row][col + 1] = 0 // 原箱子位置清空
            col = col + 1 // 主角右移一格
          }
        }
      }
    }
    // 重绘画布
    this.drawCanvas()
    // 检查游戏是否成功
    this.checkWin()
  },

  /**
   * 自定义函数：判断游戏是否成功
   * @returns {boolean} 成功返回true，否则返回false
   */
  isWin: function () {
    // 遍历所有格子：只要有一个箱子（4）不在终点（3）上，游戏未成功
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (box[i][j] == 4 && map[i][j] != 3) {
          return false
        }
      }
    }
    // 所有箱子都在终点上→ 游戏成功
    return true
  },

  /**
   * 自定义函数：检查游戏成功并弹出提示
   */
  checkWin: function () {
    if (this.isWin()) {
      wx.showModal({
        title: "恭喜",
        content: "游戏成功！",
        showCancel: false, // 不显示取消按钮
        confirmText: "确定"
      })
    }
  },

  /**
   * 自定义函数：重新开始游戏
   */
  restartGame: function () {
    // 重新初始化当前关卡地图（level需转为0开始的索引）
    this.initMap(this.data.level - 1)
    // 重绘画布（恢复初始状态）
    this.drawCanvas()
  }
})
