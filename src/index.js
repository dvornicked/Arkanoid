class Game {
    constructor() {
        this.ctx = null
        this.platform = null
        this.ball = null
        this.blocks = []
        this.rows = 4
        this.cols = 8
        this.width = 640
        this.height = 360
        this.running = true
        this.score = 0
        this.sprites = {
            background: null,
            ball: null,
            platform: null,
            block: null
        }
    }

    init () {
        // Init
        this.ctx = document.getElementById('myCanvas').getContext('2d')
        this.setEvents()
    }

    setEvents() {
        window.addEventListener('keydown', e => {
            if (e.key === ' ') {
                this.platform.fire()
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                this.platform.start(e.key)
            }
        })
        window.addEventListener('keyup', e => {
            this.platform.stop()
        })
    }

    preload(callback) {
        let loaded = 0
        let required = Object.keys(this.sprites).length
        let onImageLoad = () => {
            ++loaded
            if (loaded >= required) {
                callback()
            }
        }
        for(let key in this.sprites) {
            this.sprites[key] = new Image()
            this.sprites[key].src = `./img/${key}.png`
            this.sprites[key].addEventListener('load', onImageLoad)
        }
    }

    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    active: true,
                    width: 60,
                    height: 20,
                    x: 64 * col + 65,
                    y: 23 * row + 35
                })
            }
        }
    }

    update() {
        this.platform.move()
        this.ball.move()
        this.collideBlocks()
        this.collidePlatform()
        this.ball.collideWorldBounds()
        this.platform.collideWorldBounds()
    }

    addScore() {
        ++this.score

        if (this.score >= this.blocks.length) {
            this.end("You won")
        }
    }

    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active && this.ball.collide(block)) {
                if (this.ball.collide(block)) {
                    this.ball.bumpBlock(block)
                    this.addScore()
                }
            }
        }
    }

    end(result) {
        game.running = false
        alert(result)
        window.location.reload()
    }

    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform)
        }
    }

    run() {
        window.requestAnimationFrame(() => {
            if (this.running) {
                this.update()
                this.render()
                this.run()
            }
        })
    }

    render() {
        this.ctx.clearRect(0, 0, 640, 360)
        this.ctx.drawImage(this.sprites.background, 0, 0)
        this.ctx.drawImage(this.sprites.ball, 0, 0, 20, 20, this.ball.x, this.ball.y, this.ball.width, this.ball.height)
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y)
        this.renderBlocks()
    }

    renderBlocks() {
        for (let block of this.blocks) {
            if (block.active)  {
                this.ctx.drawImage(this.sprites.block, block.x, block.y)
            }
        }
    }

    start() {
        this.init()
        this.preload(() => {
            this.create()
            this.run()
        })
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}

const game = new Game()

game.ball = {
    velocity: 3,
    dx: 0,
    dy: 0,
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    start() {
        this.dy = -this.velocity
        this.dx = game.random(-this.velocity, this.velocity)
    },
    collide(element) {
        let x = this.x + this.dx
        let y = this.y + this.dy
        if (x + this.width > element.x && x < element.x + element.width && y + this.height > element.y && y < element.y + element.height) {
            return true
        }
        return false
    },
    collideWorldBounds() {
        let x = this.x + this.dx
        let y = this.y + this.dy

        let ballLeft = x
        let ballRight = ballLeft + this.width
        let ballTop = y
        let ballBottom = ballTop + this.height

        let worldLeft = 0
        let worldRight = game.width
        let worldTop = 0
        let worldBottom = game.height

        if (ballLeft < worldLeft) {
            this.x = 0
            this.dx = this.velocity
        } else if (ballRight > worldRight) {
            this.x = game.width - this.width
            this.dx = -this.velocity
        } else if (ballTop < worldTop) {
            this.y = 0
            this.dy = this.velocity
        } else if (ballBottom > worldBottom) {
            game.end("You lost")
        }
    },
    move() {
        if (this.dy) {
            this.y += this.dy
        }
        if (this.dx) {
            this.x += this.dx
        }
    },
    bumpBlock(block) {
        this.dy = -this.dy
        block.active = false
    },
    bumpPlatform(platform) {
        if (platform.dx) {
            this.x +=platform.dx
        }
        if (this.dy > 0) {
            this.dy = -this.dy
            let touchX = this.x + this.width / 2
            this.dx = this.velocity * platform.getTouchOffset(touchX)
        }
    }
}

game.platform = {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    width: 100,
    height: 14,
    ball: game.ball,
    fire() {
        if (this.ball) {
            this.ball.start()
            this.ball = null
        }
    },
    start(direction) {
        if (direction === 'ArrowLeft') {
            this.dx = -this.velocity
        } else if (direction === 'ArrowRight') {
            this.dx = this.velocity
        }
    },
    stop() {
        this.dx = 0
    },
    move() {
        if (this.dx) {
            this.x += this.dx
            if (this.ball) {
                this.ball.x += this.dx
            }
        }
    },
    getTouchOffset(x) {
        let diff = (this.x + this.width) - x
        let offset = this.width - diff
        let result = 2 * offset / this.width
        return result - 1
    },
    collideWorldBounds() {
        let x = this.x + this.dx

        let platformLeft = x
        let platformRight = platformLeft + this.width

        let worldLeft = 0
        let worldRight = game.width

        if (platformLeft < worldLeft) {
            if (this.ball) {
                this.ball.x = 40
            }
            this.x = 0
        } else if (platformRight > worldRight) {
            if (this.ball) {
                this.ball.x = worldRight - (this.width + this.ball.width) / 2
            }
            this.x = worldRight - this.width
        }
    }
}

window.addEventListener('load', () => {
    game.start()
})