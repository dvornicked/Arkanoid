class Game {
    start() {
        this.ctx = document.getElementById('myCanvas').getContext('2d')
        const background = new Image()
        background.src = './img/background.png'
        window.requestAnimationFrame(() => {
            this.ctx.drawImage(background, 0, 0)
        })
    }
}
const game = new Game()

window.addEventListener('load', () => {
    game.start()
})