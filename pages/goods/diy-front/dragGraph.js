// const DELETE_ICON = '/assets/icon/close.png'; // 删除按钮
const STROKE_COLOR = 'red';
const ROTATE_ENABLED = true;

const DEBUG_MODE = false; // 打开调试后会渲染操作区域边框（无背景时有效）
class dragGraph {
  constructor({
    x = 30,
    y = 30,
    w,
    h,
    type,
    text,
    fontSize = 20,
    color = 'red',
    url = null,
    rotate = 0,
    sourceId = null,
    selected = true
  }, canvas, factor) {
    if (type === 'text') {
      canvas.setFontSize(fontSize);
      const textWidth = canvas.measureText(text).width;
      const textHeight = fontSize + 10;
      this.centerX = x + textWidth / 2;
      this.centerY = y + textHeight / 2;
      this.w = textWidth;
      this.h = textHeight;
    } else {
      this.centerX = x + w / 2;
      this.centerY = y + h / 2;
      this.w = w;
      this.h = h;
    }

    this.x = x;
    this.y = y;

    // 4个顶点坐标
    this.square = [
      [this.x, this.y],
      [this.x + this.w, this.y],
      [this.x + this.w, this.y + this.h],
      [this.x, this.y + this.h]
    ];

    this.fileUrl = url;
    this.text = text;
    this.fontSize = fontSize;
    this.color = color;
    this.ctx = canvas;
    this.rotate = rotate;
    this.type = type;
    this.selected = selected;
    this.factor = factor;
    this.sourceId = sourceId;
    this.MIN_WIDTH = 20;
    this.MIN_FONTSIZE = 10;
  }
  /**
   * 给矩形描边
   * @private
   */
  _drawBorder() {
    let p = this.square;
    let ctx = this.ctx;
    this.ctx.save();
    this.ctx.beginPath();
    ctx.setStrokeStyle('orange');
    this._draw_line(this.ctx, p[0], p[1]);
    this._draw_line(this.ctx, p[1], p[2]);
    this._draw_line(this.ctx, p[2], p[3]);
    this._draw_line(this.ctx, p[3], p[0]);
    ctx.restore();
  }
  /**
   * 画一条线
   * @param ctx
   * @param a
   * @param b
   * @private
   */
  _draw_line(ctx, a, b) {
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
  /**
   * 计算旋转后矩形四个顶点的坐标（相对于画布）
   * @private
   */
  _rotateSquare() {
    this.square = [
      this._rotatePoint(this.x, this.y, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(this.x + this.w, this.y, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(this.x + this.w, this.y + this.h, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(this.x, this.y + this.h, this.centerX, this.centerY, this.rotate),
    ];
  }
  /**
   * 计算旋转后的新坐标（相对于画布）
   * @param x
   * @param y
   * @param centerX
   * @param centerY
   * @param degrees
   * @returns {*[]}
   * @private
   */
  _rotatePoint(x, y, centerX, centerY, degrees) {
    let newX = (x - centerX) * Math.cos(degrees * Math.PI / 180) - (y - centerY) * Math.sin(degrees * Math.PI / 180) + centerX;
    let newY = (x - centerX) * Math.sin(degrees * Math.PI / 180) + (y - centerY) * Math.cos(degrees * Math.PI / 180) + centerY;
    return [newX, newY];
  }
  /**
   * 计算旋转后矩形四个顶点的坐标（相对于画布）
   * @private
   */
  _rotateSquare() {
    this.square = [
      this._rotatePoint(this.x, this.y, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(this.x + this.w, this.y, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(this.x + this.w, this.y + this.h, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(this.x, this.y + this.h, this.centerX, this.centerY, this.rotate),
    ];
  }
  /**
   *  判断一个点是否在多边形内部
   *  @param points 多边形坐标集合
   *  @param testPoint 测试点坐标
   *  返回true为真，false为假
   *  */
  insidePolygon(points, testPoint) {
    let x = testPoint[0],
      y = testPoint[1];
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      let xi = points[i][0],
        yi = points[i][1];
      let xj = points[j][0],
        yj = points[j][1];

      let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
  /**
   * 判断点击的坐标落在哪个区域
   * @param {*} x 点击的坐标
   * @param {*} y 点击的坐标
   */
  isInGraph(x, y) {
    if (this.insidePolygon(this.square, [x, y])) {
      return 'move';
    }
    // 不在选择区域里面
    return false;
  }
  /**
   * 绘制元素
   */
  paint() {
    this.ctx.save();
    // 由于measureText获取文字宽度依赖于样式，所以如果是文字元素需要先设置样式
    let textWidth = 0;
    let textHeight = 0;
    if (this.type === 'text') {
      this.ctx.setFontSize(this.fontSize);
      this.ctx.setTextBaseline('middle');
      this.ctx.setTextAlign('center');
      this.ctx.setFillStyle(this.color);
      textWidth = this.ctx.measureText(this.text).width;
      textHeight = this.fontSize + 10;
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2;
      this.y = this.centerY - textHeight / 2;
    }
    // 旋转元素
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotate * Math.PI / 180);
    this.ctx.translate(-this.centerX, -this.centerY);
    // 渲染元素
    if (this.type === 'text') {
      this.ctx.fillText(this.text, this.centerX, this.centerY);
    } else if (this.type === 'image') {
      this.ctx.drawImage(this.fileUrl, this.x, this.y, this.w, this.h);
    }
    // 如果是选中状态，绘制选择虚线框，和缩放图标、删除图标
    if (this.selected) {
      this.ctx.setLineDash([2, 5]);
      this.ctx.setLineWidth(2);
      this.ctx.setStrokeStyle(STROKE_COLOR);
      this.ctx.lineDashOffset = 6;

      if (this.type === 'text') {
        this.ctx.strokeRect(this.x, this.y, textWidth, textHeight);
        // this.ctx.drawImage(DELETE_ICON, this.x - 15, this.y - 15, 30, 30);
        // this.ctx.drawImage(DRAG_ICON, this.x + textWidth - 15, this.y + textHeight - 15, 30, 30);
        // this.ctx.drawImage(ROTATE_ICON, this.x + textWidth - 15, this.y - 15, 30, 30);
      } else {
        this.ctx.strokeRect(this.x, this.y, this.w, this.h);
        // this.ctx.drawImage(DELETE_ICON, this.x - 15, this.y - 15, 30, 30);
        // this.ctx.drawImage(DRAG_ICON, this.x + this.w - 15, this.y + this.h - 15, 30, 30);
        // this.ctx.drawImage(ROTATE_ICON, this.x + this.w - 15, this.y - 15, 30, 30);
      }
    }
    this.ctx.restore();
  }

  // 旋转事件
  rotateEvent(preTwoPoint, twoPoint, currentGraph) {

    // const diffXBefore = preTwoPoint.x - preTwoPoint.x2;
    // const diffYBefore = preTwoPoint.y - preTwoPoint.y2;
    // const diffXAfter = twoPoint.x - twoPoint.x2;
    // const diffYAfter = twoPoint.y - twoPoint.y2;

    const angleBefore = Math.atan((preTwoPoint.y - preTwoPoint.y2) / (preTwoPoint.x - preTwoPoint.x2)) * 180 / Math.PI;
    const angleAfter = Math.atan((twoPoint.y - twoPoint.y2) / (twoPoint.x - twoPoint.x2)) * 180 / Math.PI;
    // 旋转的角度
    if (ROTATE_ENABLED) {
      this.rotate = currentGraph.rotate + angleAfter - angleBefore;
    }
    // 获取选择区域的宽度高度
    if (this.type === 'text') {
      this.ctx.setFontSize(this.fontSize);
      const textWidth = this.ctx.measureText(this.text).width;
      const textHeight = this.fontSize + 10;
      this.w = textWidth;
      this.h = textHeight;
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2;
      this.y = this.centerY - textHeight / 2;
    } else {
      this.centerX = this.x + this.w / 2;
      this.centerY = this.y + this.h / 2;
    }
    const lineA = Math.sqrt(Math.pow((preTwoPoint.x - preTwoPoint.x2), 2) + Math.pow((preTwoPoint.y - preTwoPoint.y2), 2));
    const lineB = Math.sqrt(Math.pow((twoPoint.x - twoPoint.x2), 2) + Math.pow((twoPoint.y - twoPoint.y2), 2));
    if (this.type === 'image') {
      let resize_rito = lineB / lineA;
      let new_w = currentGraph.w * resize_rito;
      let new_h = currentGraph.h * resize_rito;

      if (currentGraph.w < currentGraph.h && new_w < this.MIN_WIDTH) {
        new_w = this.MIN_WIDTH;
        new_h = this.MIN_WIDTH * currentGraph.h / currentGraph.w;
      } else if (currentGraph.h < currentGraph.w && new_h < this.MIN_WIDTH) {
        new_h = this.MIN_WIDTH;
        new_w = this.MIN_WIDTH * currentGraph.w / currentGraph.h;
      }

      this.w = new_w;
      this.h = new_h;
      this.x = currentGraph.x - (new_w - currentGraph.w) / 2;
      this.y = currentGraph.y - (new_h - currentGraph.h) / 2;

    } else if (this.type === 'text') {
      const fontSize = currentGraph.fontSize * ((lineB - lineA) / lineA + 1);
      this.fontSize = fontSize <= this.MIN_FONTSIZE ? this.MIN_FONTSIZE : fontSize;

      // 旋转位移后重新计算坐标
      this.ctx.setFontSize(this.fontSize);
      const textWidth = this.ctx.measureText(this.text).width;
      const textHeight = this.fontSize + 10;
      this.w = textWidth;
      this.h = textHeight;
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2;
      this.y = this.centerY - textHeight / 2;
    }
  }


  toPx(rpx) {
    return rpx * this.factor;
  }
}

export default dragGraph;