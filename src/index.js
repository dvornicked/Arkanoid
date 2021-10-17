class Game {
    constructor() {
        this.ctx = null
        this.platform = null
        this.ball = null
        this.blocks = []
        this.rows = 4
        this.cols = 8
        this.width = 0
        this.height = 0
        this.offsetX = 0
        this.offsetY = 0
        this.dimensions = {
            max: {
                width: 640,
                height: 360
            },
            min: {
                width: 640,
                height: 320
            }
        }
        this.running = true
        this.score = 0
        this.sprites = {
            background: null,
            ball: null,
            platform: null,
            block: null
        }
        this.sounds = {
            bump: null
        }
    }

    init () {
        this.canvas = document.getElementById('myCanvas')
        this.ctx = this.canvas.getContext('2d')
        this.initDimensions()
        this.setEvents()
    }

    initDimensions() {
        let data = {
            maxWidth: this.dimensions.max.width,
            maxHeight: this.dimensions.max.height,
            minWidth: this.dimensions.min.width,
            minHeight: this.dimensions.min.height,
            realWidth: window.innerWidth,
            realHeight: window.innerHeight
        }

        if (data.realWidth / data.realHeight > data.maxWidth / data.maxHeight) {
            this.fitWidth(data)
        } else {
            this.fitHeight(data)
        }
        console.log(this.width, this.height)

        this.canvas.width = this.width
        this.canvas.height = this.height
        this.ball.initPosition()
        this.platform.initPosition()
        console.log(this.offsetX, this.offsetY)
    }

    fitWidth(data) {
        this.height = Math.round(data.maxWidth * data.realHeight / data.realWidth)
        this.height = Math.min(this.height, data.maxHeight)
        this.height = Math.max(this.height, data.minHeight)
        this.width = Math.round(data.realWidth * this.height / data.realHeight)
        this.canvas.style.width = '100%'
        this.offsetX = Math.round((this.width - data.maxWidth) / 2)
        console.log('Width')
    }

    fitHeight(data) {
        this.width = Math.round(data.realWidth * data.maxHeight / data.realHeight)
        this.width = Math.min(this.width, data.maxWidth)
        this.width = Math.max(this.width, data.minWidth)
        this.height = Math.round(this.width * data.realHeight / data.realWidth)
        this.canvas.style.height = '100%'
        this.offsetY = Math.round((this.height - data.maxHeight) / 2)
        console.log('Height')
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
        required += Object.keys(this.sounds).length
        let onResourceLoad = () => {
            ++loaded
            if (loaded >= required) {
                callback()
            }
        }

        this.preloadSprites(onResourceLoad)
        this.preloadAudio(onResourceLoad)

    }

    preloadSprites(onResourceLoad) {
        for(let key in this.sprites) {
            this.sprites[key] = new Image()
            this.sprites[key].src = `./img/${key}.png`
            this.sprites[key].addEventListener('load', onResourceLoad)
        }
    }

    preloadAudio(onResourceLoad) {
        for(let key in this.sounds) {
            this.sounds[key] = new Audio(`./sounds/${key}.mp3`)
            this.sounds[key].addEventListener('canplaythrough', onResourceLoad, {once: true})
        }
    }

    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    active: true,
                    width: 60,
                    height: 20,
                    x: 64 * col + 65 + this.offsetX,
                    y: 23 * row + 35 + this.offsetY
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
                    this.sounds.bump.play()
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
            this.sounds.bump.play()
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
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.drawImage(this.sprites.background, this.offsetX, this.offsetY)
        this.ctx.drawImage(this.sprites.ball, this.ball.frame * this.ball.width, 0, 20, 20, this.ball.x, this.ball.y, this.ball.width, this.ball.height)
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y)
        this.renderBlocks()
        this.ctx.fillStyle = '#fff'
        this.ctx.font = '20px Arial'
        this.ctx.fillText(`Score: ${this.score}`, 10 + this.offsetX, 20 + this.offsetY)
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
    frame: 0,
    dx: 0,
    dy: 0,
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    initPosition() {
        this.x += game.offsetX
        this.y += game.offsetY
    },
    start() {
        this.dy = -this.velocity
        this.dx = game.random(-this.velocity, this.velocity)
        this.animate()
    },
    animate() {
        setInterval(() => {
            ++this.frame
            if (this.frame > 3) {
                this.frame = 0
            }
        }, 100)
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

        let worldLeft = game.offsetX
        let worldRight = game.width - game.offsetX
        let worldTop = game.offsetY
        let worldBottom = game.height - game.offsetY

        if (ballLeft < worldLeft) {
            this.x = worldLeft
            this.dx = this.velocity
            game.sounds.bump.play()
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width
            this.dx = -this.velocity
            game.sounds.bump.play()
        } else if (ballTop < worldTop) {
            this.y = worldTop
            this.dy = this.velocity
            game.sounds.bump.play()
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
    initPosition() {
        this.x += game.offsetX
        this.y += game.offsetY
    },
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

        let worldLeft = game.offsetX
        let worldRight = game.width - game.offsetX

        if (platformLeft < worldLeft) {
            if (this.ball) {
                this.ball.x = 40 + worldLeft
            }
            this.x = worldLeft
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