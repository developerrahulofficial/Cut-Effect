class Cuttt {
    constructor() {
      this.duration = 0.2
      this.power = 0.15
  
      this.el1 = container.children[0]
      this.el2 = container.children[1]
  
      this.data = [
        [[[0, 0], [0, 0]], [[1, 2], [5, 4]], [[1, 2], [5, 4]], [[2, 3], [0, 5]]], 
        [[[2, 1], [4, 5]], [[0, 0], [0, 0]], [[2, 3], [0, 5]], [[2, 3], [0, 5]]], 
        [[[2, 1], [4, 5]], [[3, 2], [5, 0]], [[0, 0], [0, 0]], [[2, 1], [4, 5]]], 
        [[[3, 2], [5, 0]], [[3, 2], [5, 0]], [[1, 2], [5, 4]], [[0, 0], [0, 0]]]
      ]
  
      this.sp = null
      this.ep = null
      this.isAnimating = false
  
      this.onMove = this.onMove.bind(this)
      this.init()
    }
  
    init() {
      window.addEventListener('touchmove', this.onMove)
      window.addEventListener('mousemove', this.onMove)
    }
    remove() {
      window.removeEventListener('touchmove', this.onMove)
      window.removeEventListener('mousemove', this.onMove)
    }
    onMove(e) {
      const clientX = e.clientX || e.touches?.[0].clientX || 0
      const clientY = e.clientY || e.touches?.[0].clientY || 0
      const element = document.elementFromPoint(clientX, clientY)
      const isElementForCut = element?.hasAttribute('data-for-cut')
      if (!!this.sp && !isElementForCut && !this.ep) {
        this.ep = this.getEnteredPoint(clientX, clientY)
        this.onLeave()
        return
      }
      if (!isElementForCut) return
      if (!this.sp) {
        this.sp = this.getEnteredPoint(clientX, clientY)
      }
    }
    getEnteredPoint(clientX, clientY) {
      const offsetX = clientX - this.el2.getBoundingClientRect().x
      const offsetY = clientY - this.el2.getBoundingClientRect().y
      return { x: Math.max(offsetX, 0), y: Math.max(offsetY, 0) }
    }
   
    onLeave() {
      if (this.isAnimating) return
      this.isAnimating = true
      const { offsetWidth, offsetHeight } = this.el1
  
      const dx = this.ep.x - this.sp.x
      const dy = this.ep.y - this.sp.y
      const a = Math.max(Math.min(dy / dx, 100), -100) || 0
      const b = this.sp.y - a * this.sp.x
  
      const temp = []
      temp.push({ x: 0, y: b })
      temp.push({ x: offsetWidth, y: a * offsetWidth + b })
      if (b !== 0) temp.push({ x: -b / a, y: 0 })
      temp.push({ x: (offsetHeight - b) / a, y: offsetHeight })
      const points = temp.filter(t => t.x >= 0 && t.x <= offsetWidth && t.y >= 0 && t.y <= offsetHeight)
      const lineIndex = [this.getLineIndex(this.el2, points[0]), this.getLineIndex(this.el2, points[1])]
      const clipIndex = this.data[lineIndex[0]][lineIndex[1]]
      const cp1 = [[0, 0], [100, 0], [100, 50], [100, 100], [0, 100], [0, 50]]
      const cp2 = [[0, 0], [100, 0], [100, 50], [100, 100], [0, 100], [0, 50]]
      cp1[clipIndex[0][0]] = [points[0].x / offsetWidth * 100, points[0].y / offsetHeight * 100]
      cp1[clipIndex[0][1]] = [points[1].x / offsetWidth * 100, points[1].y / offsetHeight * 100]
      cp2[clipIndex[1][0]] = [points[0].x / offsetWidth * 100, points[0].y / offsetHeight * 100]
      cp2[clipIndex[1][1]] = [points[1].x / offsetWidth * 100, points[1].y / offsetHeight * 100]
      this.el1.style.clipPath = `polygon(${cp1[0][0]}% ${cp1[0][1]}%,${cp1[1][0]}% ${cp1[1][1]}%,${cp1[2][0]}% ${cp1[2][1]}%,${cp1[3][0]}% ${cp1[3][1]}%,${cp1[4][0]}% ${cp1[4][1]}%,${cp1[5][0]}% ${cp1[5][1]}%)`
      this.el2.style.clipPath = `polygon(${cp2[0][0]}% ${cp2[0][1]}%,${cp2[1][0]}% ${cp2[1][1]}%,${cp2[2][0]}% ${cp2[2][1]}%,${cp2[3][0]}% ${cp2[3][1]}%,${cp2[4][0]}% ${cp2[4][1]}%,${cp2[5][0]}% ${cp2[5][1]}%)`
  
      const x = dx * this.power
      const y = dy * this.power
  
      const timeline = gsap.timeline()
      timeline.to(this.el1, { x: -x, y: -y, duration: this.duration, ease: 'Power4.easeOut' }, 0)
      timeline.to(this.el2, { x: x, y: y, duration: this.duration, ease: 'Power4.easeOut' }, 0)
      timeline.to(this.el1, { x: 0, y: 0, duration: this.duration*2, ease: 'Power4.easeIn' }, this.duration*2)
      timeline.to(this.el2, { x: 0, y: 0, duration: this.duration*2, ease: 'Power4.easeIn', onComplete: () => {
        this.el1.style.clipPath = ''
        this.el2.style.clipPath = ''
        this.sp = this.ep = null
        this.isAnimating = false
      } }, this.duration*2)
    }
  
    getLineIndex(element, point) {
      const { x, y } = point
      const { offsetWidth, offsetHeight } = element
  
      if (x < offsetWidth && y === 0) return 0
      else if (x === offsetWidth && y < offsetHeight) return 1
      else if (x < offsetWidth && y === offsetHeight) return 2
      else if (x === 0 && y < offsetHeight) return 3
    }
  }
  
  
  
  const selectBox = document.querySelector('.select')
  const container = document.querySelector('.container')
  let cuttt = new Cuttt(container)
  
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', e => {
      changeChildren(e.target.getAttribute('data-type'))
    })
  })
  
  
  function changeChildren(type) {
    let element;
    if (type === 'text') {
      element = '<p data-for-cut>Move your cursor over here\nto Cut this text...✂️</p>'
    } else if (type === 'input') {
      element = '<input data-for-cut type="text"></input>'
    } else if (type === 'image') {
      element = '<img data-for-cut src="https://iili.io/Hc9F5rB.jpg">'
    }
    container.innerHTML = element + element
    cuttt.remove()
    cuttt = new Cuttt(container)
    if (type === 'input') initInputText()
  }
  function initInputText(){
    container.children[0].value=container.children[1].value='You will want to cut this...'
    container.children[1].focus()
    
    container.children[1].addEventListener('Key up',e =>{
      container.children[0].value=e.target.value
    })
  }