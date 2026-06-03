export interface Book {
  id: string
  title: string
  author: string
  coverColor: string
  spineColor: string
  readingProgress: number
  tilt: number
}

export interface Shelf {
  id: string
  label: string
  books: Book[]
}

const t = (deg: number) => deg

export const library: Shelf[] = [
  {
    id: 'shelf-1',
    label: '玄幻经典',
    books: [
      { id: 'b01', title: '苍穹之上', author: '辰东', coverColor: '#c0392b', spineColor: '#8e2018', readingProgress: 0.72, tilt: t(-4) },
      { id: 'b02', title: '斗破苍穹', author: '天蚕土豆', coverColor: '#8e44ad', spineColor: '#5e2d7a', readingProgress: 1.0, tilt: t(5) },
      { id: 'b03', title: '完美世界', author: '辰东', coverColor: '#16a085', spineColor: '#0e6e5c', readingProgress: 0.45, tilt: t(-6) },
      { id: 'b04', title: '遮天', author: '辰东', coverColor: '#d35400', spineColor: '#943a00', readingProgress: 0.88, tilt: t(3) },
      { id: 'b05', title: '圣墟', author: '辰东', coverColor: '#c0392b', spineColor: '#7a2418', readingProgress: 0.33, tilt: t(-5) },
      { id: 'b06', title: '大主宰', author: '天蚕土豆', coverColor: '#2980b9', spineColor: '#1a5276', readingProgress: 0.60, tilt: t(4) },
      { id: 'b07', title: '武动乾坤', author: '天蚕土豆', coverColor: '#f39c12', spineColor: '#b87308', readingProgress: 0.15, tilt: t(-3) },
      { id: 'b08', title: '元尊', author: '天蚕土豆', coverColor: '#27ae60', spineColor: '#1a7a42', readingProgress: 0.0, tilt: t(6) },
    ]
  },
  {
    id: 'shelf-2',
    label: '仙侠奇缘',
    books: [
      { id: 'b09', title: '凡人修仙传', author: '忘语', coverColor: '#27ae60', spineColor: '#1a7a42', readingProgress: 0.95, tilt: t(5) },
      { id: 'b10', title: '一念永恒', author: '耳根', coverColor: '#e67e22', spineColor: '#a85a18', readingProgress: 0.40, tilt: t(-4) },
      { id: 'b11', title: '仙逆', author: '耳根', coverColor: '#34495e', spineColor: '#1a2530', readingProgress: 0.78, tilt: t(6) },
      { id: 'b12', title: '我欲封天', author: '耳根', coverColor: '#9b59b6', spineColor: '#6c3a80', readingProgress: 0.55, tilt: t(-5) },
      { id: 'b13', title: '道君', author: '跃千愁', coverColor: '#16a085', spineColor: '#0e6e5c', readingProgress: 0.20, tilt: t(3) },
      { id: 'b14', title: '万古神帝', author: '飞天鱼', coverColor: '#e74c3c', spineColor: '#a02c1e', readingProgress: 0.67, tilt: t(-6) },
      { id: 'b15', title: '伏天氏', author: '净无痕', coverColor: '#9b59b6', spineColor: '#6c3a80', readingProgress: 0.82, tilt: t(4) },
    ]
  },
  {
    id: 'shelf-3',
    label: '诡秘悬疑',
    books: [
      { id: 'b16', title: '诡秘之主', author: '爱潜水的乌贼', coverColor: '#2c3e50', spineColor: '#1a252e', readingProgress: 1.0, tilt: t(-5) },
      { id: 'b17', title: '超神机械师', author: '齐佩甲', coverColor: '#2c3e50', spineColor: '#1a252e', readingProgress: 0.60, tilt: t(4) },
      { id: 'b18', title: '牧神记', author: '宅猪', coverColor: '#1abc9c', spineColor: '#117a65', readingProgress: 0.35, tilt: t(-3) },
      { id: 'b19', title: '天道图书馆', author: '横扫天涯', coverColor: '#8e44ad', spineColor: '#5e2d7a', readingProgress: 0.50, tilt: t(6) },
      { id: 'b20', title: '全职法师', author: '乱', coverColor: '#d35400', spineColor: '#943a00', readingProgress: 0.90, tilt: t(-4) },
      { id: 'b21', title: '万族之劫', author: '老鹰吃小鸡', coverColor: '#3498db', spineColor: '#1f6fa5', readingProgress: 0.25, tilt: t(5) },
      { id: 'b22', title: '夜的命名术', author: '会说话的肘子', coverColor: '#2980b9', spineColor: '#1a5276', readingProgress: 0.10, tilt: t(-6) },
    ]
  },
  {
    id: 'shelf-4',
    label: '江湖武侠',
    books: [
      { id: 'b23', title: '剑来', author: '烽火戏诸侯', coverColor: '#2980b9', spineColor: '#1a5276', readingProgress: 0.85, tilt: t(3) },
      { id: 'b24', title: '雪中悍刀行', author: '烽火戏诸侯', coverColor: '#bdc3c7', spineColor: '#808a90', readingProgress: 1.0, tilt: t(-5) },
      { id: 'b25', title: '大奉打更人', author: '卖报小郎君', coverColor: '#c0392b', spineColor: '#8e2018', readingProgress: 0.70, tilt: t(6) },
      { id: 'b26', title: '我师兄实在太稳健了', author: '言归正传', coverColor: '#2ecc71', spineColor: '#1ea85a', readingProgress: 0.45, tilt: t(-4) },
      { id: 'b27', title: '一世之尊', author: '爱潜水的乌贼', coverColor: '#34495e', spineColor: '#1a2530', readingProgress: 0.30, tilt: t(5) },
      { id: 'b28', title: '大道朝天', author: '猫腻', coverColor: '#e67e22', spineColor: '#a85a18', readingProgress: 0.55, tilt: t(-3) },
      { id: 'b29', title: '择天记', author: '猫腻', coverColor: '#1abc9c', spineColor: '#117a65', readingProgress: 0.80, tilt: t(4) },
      { id: 'b30', title: '庆余年', author: '猫腻', coverColor: '#f39c12', spineColor: '#b87308', readingProgress: 1.0, tilt: t(-6) },
    ]
  },
  {
    id: 'shelf-5',
    label: '科幻未来',
    books: [
      { id: 'b31', title: '深空彼岸', author: '辰东', coverColor: '#2c3e50', spineColor: '#1a252e', readingProgress: 0.18, tilt: t(-4) },
      { id: 'b32', title: '不朽', author: '净无痕', coverColor: '#8e44ad', spineColor: '#5e2d7a', readingProgress: 0.42, tilt: t(5) },
      { id: 'b33', title: '星域四万年', author: '卧牛真人', coverColor: '#2980b9', spineColor: '#1a5276', readingProgress: 0.65, tilt: t(-6) },
      { id: 'b34', title: '吞噬星空', author: '我吃西红柿', coverColor: '#e74c3c', spineColor: '#a02c1e', readingProgress: 1.0, tilt: t(3) },
      { id: 'b35', title: '修真聊天群', author: '圣骑士的传说', coverColor: '#27ae60', spineColor: '#1a7a42', readingProgress: 0.50, tilt: t(-5) },
      { id: 'b36', title: '飞剑问道', author: '我吃西红柿', coverColor: '#d35400', spineColor: '#943a00', readingProgress: 0.75, tilt: t(4) },
      { id: 'b37', title: '星辰变', author: '我吃西红柿', coverColor: '#f39c12', spineColor: '#b87308', readingProgress: 1.0, tilt: t(-3) },
    ]
  },
]
