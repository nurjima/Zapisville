const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1350
canvas.height = 850

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 50) {
  collisionsMap.push(collisions.slice(i, 50 + i))
}

const gameZonesMap = []
for (let i = 0; i < gameZonesData.length; i += 50) {
  gameZonesMap.push(gameZonesData.slice(i, 50 + i))
}

const gameSnakesMap = []
for (let i = 0; i < gameSnakesData.length; i += 50) {
  gameSnakesMap.push(gameSnakesData.slice(i, 50 + i))
}

class Boundary {
  static width = 28
  static height = 28
  constructor({position}) {
    this.position = position
    this.width = 28
    this.height = 28
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

const boundaries = []
const offset = {
  x: 0,
  y: 0
}

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 2025 || symbol === 1641 || symbol === 2278 || symbol === 2404 || symbol === 2150 || symbol === 2151) {
      boundaries.push(new Boundary({position: {
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y
      }}))
    }
  })
})

const gameZones = []

const gameSnakes = []

gameZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 2025) {
      gameZones.push(new Boundary({position: {
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y
      }}))
    }
  })
})

gameSnakesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 2025) {
      gameSnakes.push(new Boundary({position: {
        x: j * Boundary.width + offset.x,
        y: i * Boundary.height + offset.y
      }}))
    }
  })
})

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const image = new Image()
image.src = './img/Pellet Town.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerFront.png'

const playerBackImage = new Image()
playerBackImage.src = './img/playerBack.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

class Sprite {
  constructor({ position, velocity, image, frames = { max: 1 }, sprites = [] }) {
    this.position = position,
    this.image = image
    this.frames = {...frames, val: 0, elapsed: 0}
    this.sprites = sprites

    this.image.onload = () => {
      this.width = this.image.width / this.frames.max
      this.height = this.image.height
    }
    this.moving = false
  }

  draw() {
    c.drawImage(
      this.image,
      this.frames.val,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    )
  }
}

const player = new Sprite({
  position: {
    x: canvas.width / 2 - (200 / 12) / 2,
    y: canvas.height / 1.7 - 100 / 1.7
  },
  image: playerDownImage,
  frames: {
    max: 4
  },
  sprites: {
    up: playerBackImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
})

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const movables = [background, ...boundaries, ...gameZones, ...gameSnakes]

function rectangularCollision({rectangle1, rectangle2}) {
  return (rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}

const game = {
  gems: false,
  snake: false
}

function animate() {
  window.requestAnimationFrame(animate)
  background.draw()
  boundaries.forEach((boundary) => {
    boundary.draw()
  })
  gameZones.forEach(gameZone => {
    gameZone.draw()
  })
  gameSnakes.forEach(gameSnake => {
    gameSnake.draw()
  })
  player.draw()

  if (game.gems) return window.location.href = "/Users/sabi/Downloads/3IR-master/index.html"
  else if (game.snake) return window.location.href = "/Users/sabi/Downloads/GameBreak-main/SuperSnake/index.html"

  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < gameZones.length; i++) {
      const gameZone = gameZones[i]
      if (rectangularCollision({
            rectangle1: player,
            rectangle2: gameZone
          })) {
        console.log('game zone colliding')
        game.gems = true
        break
      }
    }
  }

  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < gameSnakes.length; i++) {
      const gameSnake = gameSnakes[i]
      if (rectangularCollision({
            rectangle1: player,
            rectangle2: gameSnake
          })) {
        console.log('game snake colliding')
        game.snake = true
        break
      }
    }
  }

  let moving = true
  player.moving = false
  if (keys.w.pressed && lastKey === 'w') {
    player.moving = true
    player.image = player.sprites.up
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
            rectangle1: player,
            rectangle2: {...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y + 5
            }}
          })) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach(movable => {
        movable.position.y += 5
    })
  }
  else if (keys.a.pressed && lastKey === 'a') {
    player.moving = true
    player.image = player.sprites.left
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
            rectangle1: player,
            rectangle2: {...boundary, position: {
              x: boundary.position.x + 5,
              y: boundary.position.y
            }}
          })) {
        console.log('colliding')
        moving = false
        break
      }
    }
    if (moving)
      movables.forEach(movable => {
        movable.position.x += 5
  })}
  else if (keys.s.pressed && lastKey === 's') {
    player.moving = true
    player.image = player.sprites.down
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
            rectangle1: player,
            rectangle2: {...boundary, position: {
              x: boundary.position.x,
              y: boundary.position.y - 5
            }}
          })) {
        console.log('colliding')
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach(movable => {
        movable.position.y -= 5
  })}
  else if (keys.d.pressed && lastKey === 'd') {
    player.moving = true
    player.image = player.sprites.right
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (rectangularCollision({
            rectangle1: player,
            rectangle2: {...boundary, position: {
              x: boundary.position.x,
              y: boundary.position.y - 5
            }}
          })) {
        console.log('colliding')
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach(movable => {
        movable.position.x -= 5
  })}
}
animate()

let lastKey = ''

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break;
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break;
    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break;
    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break;
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false
      break;
    case 'a':
      keys.a.pressed = false
      break;
    case 's':
      keys.s.pressed = false
      break;
    case 'd':
      keys.d.pressed = false
      break;
  }
})
